import { useMemo } from 'react'
import { Group, Rect, Text, Circle } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { CELL_PX } from '../../utils/gridMath'
import { hexToRgba } from '../../utils/colorUtils'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { useSquares } from '../../hooks/useSquares'
import { useAllPlantingsForSquares } from '../../hooks/usePlantings'
import { usePlants } from '../../hooks/usePlants'
import { SquareCell } from './SquareCell'
import { SubgridCell } from './SubgridCell'
import type { Bed, Plant, Planting } from '../../types'

interface Props {
  bed: Bed
  scale: number
  onSelect: () => void
}

export function BedShape({ bed, scale, onSelect }: Props) {
  const { tool, activePlantId, paintBatchId, selectedSquareId, selectedPlantingId, selectedPlantingIds, setSelectedSquareId, setSelectedPlantingId, setSelectedPlantingIds, setActiveBedId, setTool } = useAppStore()
  const squares = useSquares(bed.id)
  const squareIds = useMemo(() => squares.map((s) => s.id), [squares])
  const plantings = useAllPlantingsForSquares(squareIds)
  const plants = usePlants()

  const plantMap = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants])
  const plantingMap = useMemo(() => new Map(plantings.map((pl) => [
    pl.subCol != null ? `${pl.squareId}-${pl.subCol}-${pl.subRow}` : pl.squareId,
    pl
  ])), [plantings])
  const squareMap = useMemo(() => {
    const m = new Map<string, typeof squares[0]>()
    squares.forEach((sq) => m.set(`${sq.bedId}-${sq.col}-${sq.row}`, sq))
    return m
  }, [squares])

  // Large-footprint plant anchors (one planting covers an NxN block)
  const largePlantAnchors = useMemo(() => {
    return plantings
      .filter(pl => pl.subCol === null)
      .flatMap((pl): Array<{ col: number; row: number; plant: Plant; planting: Planting; squareId: string }> => {
        const sq = squares.find(s => s.id === pl.squareId)
        const plant = plantMap.get(pl.plantId)
        if (!sq || !plant || (plant.footprintFt ?? 1) <= 1) return []
        return [{ col: sq.col, row: sq.row, plant, planting: pl, squareId: sq.id }]
      })
  }, [plantings, squares, plantMap])

  // Cells (bed-relative col,row) that are covered by a large plant but are NOT the anchor
  const largeSatelliteCells = useMemo(() => {
    const cells = new Set<string>()
    for (const { col, row, plant } of largePlantAnchors) {
      const fp = plant.footprintFt!
      for (let dc = 0; dc < fp; dc++) {
        for (let dr = 0; dr < fp; dr++) {
          if (dc === 0 && dr === 0) continue
          cells.add(`${col + dc},${row + dr}`)
        }
      }
    }
    return cells
  }, [largePlantAnchors])

  async function handleSelect(pl: Planting, squareId: string, ctrlKey: boolean) {
    setActiveBedId(bed.id)
    setSelectedSquareId(squareId)

    const ids = pl.batchId
      ? (await db.plantings.where('batchId').equals(pl.batchId).toArray()).map(m => m.id)
      : [pl.id]

    if (ctrlKey) {
      const allIn = ids.every(id => selectedPlantingIds.includes(id))
      const next = allIn
        ? selectedPlantingIds.filter(id => !ids.includes(id))
        : [...new Set([...selectedPlantingIds, ...ids])]
      setSelectedPlantingIds(next)
    } else {
      setSelectedPlantingIds(ids)
    }
  }

  async function handleCellClick(col: number, row: number, subCol?: number, subRow?: number, ctrlKey = false) {
    const squareKey = `${bed.id}-${col}-${row}`
    let square = squareMap.get(squareKey) ?? squares.find((s) => s.col === col && s.row === row)

    if (tool === 'select') {
      setActiveBedId(bed.id)
      if (square) {
        const pKey = subCol != null ? `${square.id}-${subCol}-${subRow}` : square.id
        const pl = plantingMap.get(pKey)
        if (pl) {
          await handleSelect(pl, square.id, ctrlKey)
        } else {
          setSelectedSquareId(square.id)
          setSelectedPlantingIds([])
        }
      }
      return
    }

    if (tool === 'paint-plant' && activePlantId) {
      const plant = plantMap.get(activePlantId)
      const fp = plant?.footprintFt ?? 1

      if (fp > 1) {
        // Large plant stamp — check footprint fits within bed
        if (col + fp > bed.widthFt || row + fp > bed.heightFt) return

        // Check every cell in the footprint for conflicts (skip anchor itself)
        for (let dc = 0; dc < fp; dc++) {
          for (let dr = 0; dr < fp; dr++) {
            if (dc === 0 && dr === 0) continue
            const c = col + dc
            const r = row + dr
            if (largeSatelliteCells.has(`${c},${r}`)) return
            const sq = squareMap.get(`${bed.id}-${c}-${r}`)
            if (sq && plantingMap.has(sq.id)) return
          }
        }

        if (!square) {
          const newSquare = { id: uuidv4(), bedId: bed.id, col, row, useSubgrid: false }
          await db.squares.add(newSquare)
          square = newSquare
        }

        const existing = plantingMap.get(square.id)
        const now = new Date().toISOString()
        if (existing) {
          await db.plantings.update(existing.id, { plantId: activePlantId, updatedAt: now })
        } else {
          await db.plantings.add({
            id: uuidv4(),
            squareId: square.id,
            plantId: activePlantId,
            batchId: paintBatchId ?? undefined,
            subCol: null, subRow: null,
            successionIndex: 0,
            seedStartDate: null,
            transplantOrSowDate: null,
            expectedHarvestDate: null,
            actualHarvestDate: null,
            status: 'planned',
            notes: '',
            createdAt: now,
            updatedAt: now,
          })
        }
        return
      }

      // Normal 1×1 plant
      if (!square) {
        const newSquare = { id: uuidv4(), bedId: bed.id, col, row, useSubgrid: false }
        await db.squares.add(newSquare)
        square = newSquare
      }
      const pKey = subCol != null ? `${square.id}-${subCol}-${subRow}` : square.id
      const existing = plantingMap.get(pKey)
      const now = new Date().toISOString()
      if (existing) {
        await db.plantings.update(existing.id, { plantId: activePlantId, updatedAt: now })
      } else {
        const succIdx = plantings.filter((p) => p.squareId === square!.id && p.subCol === (subCol ?? null)).length
        await db.plantings.add({
          id: uuidv4(),
          squareId: square.id,
          plantId: activePlantId,
          batchId: paintBatchId ?? undefined,
          subCol: subCol ?? null,
          subRow: subRow ?? null,
          successionIndex: succIdx,
          seedStartDate: null,
          transplantOrSowDate: null,
          expectedHarvestDate: null,
          actualHarvestDate: null,
          status: 'planned',
          notes: '',
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    if (tool === 'erase-plant') {
      if (!square) return
      const pKey = subCol != null ? `${square.id}-${subCol}-${subRow}` : square.id
      const existing = plantingMap.get(pKey)
      if (existing) await db.plantings.delete(existing.id)
    }
  }

  async function handleCellRightClick(col: number, row: number) {
    const square = squares.find((s) => s.col === col && s.row === row)
    if (!square) return
    await db.squares.update(square.id, { useSubgrid: !square.useSubgrid })
  }

  const bedX = bed.x * CELL_PX
  const bedY = bed.y * CELL_PX
  const bedW = bed.widthFt * CELL_PX
  const bedH = bed.heightFt * CELL_PX
  const showLabel = scale > 0.5

  return (
    <Group x={bedX} y={bedY} onClick={(e) => { e.cancelBubble = true; onSelect() }}>
      {/* Bed background */}
      <Rect
        width={bedW} height={bedH}
        fill={hexToRgba(bed.color, 0.08)}
        stroke={bed.color}
        strokeWidth={2 / scale}
        cornerRadius={4 / scale}
      />

      {/* Square/subgrid cells — skip satellite cells (covered by large plant block) */}
      {Array.from({ length: bed.heightFt }, (_, row) =>
        Array.from({ length: bed.widthFt }, (_, col) => {
          if (largeSatelliteCells.has(`${col},${row}`)) return null

          const square = squares.find((s) => s.col === col && s.row === row)
          const squareKey = square?.id ?? ''

          if (square?.useSubgrid) {
            return Array.from({ length: 4 }, (_, sr) =>
              Array.from({ length: 4 }, (_, sc) => {
                const pKey = `${squareKey}-${sc}-${sr}`
                const pl = plantingMap.get(pKey) ?? null
                const plant = pl ? plantMap.get(pl.plantId) ?? null : null
                return (
                  <Group key={`sub-${col}-${row}-${sc}-${sr}`} x={col * CELL_PX} y={row * CELL_PX}>
                    <SubgridCell
                      subCol={sc} subRow={sr}
                      plant={plant}
                      scale={scale}
                      isSelected={selectedPlantingId === pl?.id}
                      onLeftClick={() => handleCellClick(col, row, sc, sr)}
                      onRightClick={() => handleCellRightClick(col, row)}
                    />
                  </Group>
                )
              })
            )
          }

          const pl = plantingMap.get(squareKey) ?? null
          const plant = pl ? plantMap.get(pl.plantId) ?? null : null

          // Skip anchor cells that belong to a large plant — rendered below as a block
          if (plant && (plant.footprintFt ?? 1) > 1) return null

          return (
            <SquareCell
              key={`sq-${col}-${row}`}
              col={col} row={row}
              plant={plant}
              variety={pl?.variety}
              scale={scale}
              isSelected={pl ? selectedPlantingIds.includes(pl.id) : selectedSquareId === squareKey}
              onLeftClick={(ctrlKey) => handleCellClick(col, row, undefined, undefined, ctrlKey)}
              onRightClick={() => handleCellRightClick(col, row)}
            />
          )
        })
      )}

      {/* Large plant blocks — rendered as a unified visual unit */}
      {largePlantAnchors.map(({ col, row, plant, planting, squareId }) => {
        const fp = plant.footprintFt!
        const bx = col * CELL_PX
        const by = row * CELL_PX
        const bw = fp * CELL_PX
        const bh = fp * CELL_PX
        const cx = bx + bw / 2
        const cy = by + bh / 2
        const isSelectedPlanting = selectedPlantingIds.includes(planting.id)
        const showBlockLabel = scale > 0.6
        const blockVariety = planting.variety
        const blockDisplayFull = blockVariety ? `${plant.name} (${blockVariety})` : plant.name
        const blockDisplayInitial = blockVariety ? blockVariety.charAt(0).toUpperCase() : plant.name.charAt(0).toUpperCase()

        return (
          <Group key={`lp-${col}-${row}`}>
            {/* Fill */}
            <Rect
              x={bx} y={by} width={bw} height={bh}
              fill={hexToRgba(plant.color, 0.2)}
              listening={false}
            />
            {/* Outer border */}
            <Rect
              x={bx} y={by} width={bw} height={bh}
              fill="transparent"
              stroke={isSelectedPlanting ? '#2563eb' : plant.color}
              strokeWidth={(isSelectedPlanting ? 2.5 : 2) / scale}
              cornerRadius={4 / scale}
              listening={false}
            />
            {/* Center pip at grid crosshairs */}
            <Circle
              x={cx} y={cy}
              radius={5}
              fill={hexToRgba(plant.color, 0.75)}
              listening={false}
            />
            {/* Label */}
            {showBlockLabel && (
              <Text
                x={bx + 4 / scale}
                y={cy + 8 / scale}
                width={bw - 8 / scale}
                align="center"
                text={scale > 1.2 ? blockDisplayFull : blockDisplayInitial}
                fontSize={scale > 1.2 ? 9 / scale : 14 / scale}
                fill={plant.color}
                fontStyle="bold"
                listening={false}
              />
            )}
            {/* Transparent click target covering the full block */}
            <Rect
              x={bx} y={by} width={bw} height={bh}
              fill="transparent"
              onClick={async (e) => {
                e.cancelBubble = true
                if (tool === 'select') {
                  await handleSelect(planting, squareId, e.evt.ctrlKey)
                } else if (tool === 'erase-plant') {
                  db.plantings.delete(planting.id)
                  setSelectedSquareId(null)
                  setSelectedPlantingId(null)
                }
              }}
            />
          </Group>
        )
      })}

      {/* Bed name label — clickable pill to select bed in any tool mode */}
      {showLabel && (
        <Group
          x={4 / scale}
          y={4 / scale}
          onClick={(e) => {
            e.cancelBubble = true
            setActiveBedId(bed.id)
            setTool('select')
            setSelectedPlantingIds([])
            setSelectedSquareId(null)
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor = 'pointer'
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor =
              tool === 'add-bed' ? 'crosshair' :
              tool === 'paint-plant' ? 'cell' :
              tool === 'erase-plant' ? 'not-allowed' : 'default'
          }}
        >
          <Rect
            width={(bed.name.length * 7 + 16) / scale}
            height={19 / scale}
            fill={hexToRgba(bed.color, 0.12)}
            stroke={hexToRgba(bed.color, 0.35)}
            strokeWidth={1 / scale}
            cornerRadius={3 / scale}
          />
          <Text
            text={bed.name}
            x={8 / scale}
            y={4 / scale}
            fontSize={11 / scale}
            fill={bed.color}
            fontStyle="bold"
            listening={false}
          />
        </Group>
      )}
    </Group>
  )
}
