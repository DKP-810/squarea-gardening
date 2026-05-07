import { useMemo } from 'react'
import { Group, Rect, Text } from 'react-konva'
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
import type { Bed } from '../../types'

interface Props {
  bed: Bed
  scale: number
  onSelect: () => void
}

export function BedShape({ bed, scale, onSelect }: Props) {
  const { tool, activePlantId, selectedSquareId, selectedPlantingId, setSelectedSquareId, setSelectedPlantingId, setActiveBedId } = useAppStore()
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

  async function handleCellClick(col: number, row: number, subCol?: number, subRow?: number) {
    const squareKey = `${bed.id}-${col}-${row}`
    let square = squareMap.get(squareKey) ?? squares.find((s) => s.col === col && s.row === row)

    if (tool === 'select') {
      setActiveBedId(bed.id)
      if (square) {
        setSelectedSquareId(square.id)
        const pKey = subCol != null ? `${square.id}-${subCol}-${subRow}` : square.id
        const pl = plantingMap.get(pKey)
        setSelectedPlantingId(pl?.id ?? null)
      }
      return
    }

    if (tool === 'paint-plant' && activePlantId) {
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
        // find max succession index for this square
        const succIdx = plantings.filter((p) => p.squareId === square!.id && p.subCol === (subCol ?? null)).length
        await db.plantings.add({
          id: uuidv4(),
          squareId: square.id,
          plantId: activePlantId,
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

      {/* Square/subgrid cells */}
      {Array.from({ length: bed.heightFt }, (_, row) =>
        Array.from({ length: bed.widthFt }, (_, col) => {
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

          return (
            <SquareCell
              key={`sq-${col}-${row}`}
              col={col} row={row}
              plant={plant}
              scale={scale}
              isSelected={selectedSquareId === squareKey}
              onLeftClick={() => handleCellClick(col, row)}
              onRightClick={() => handleCellRightClick(col, row)}
            />
          )
        })
      )}

      {/* Bed label */}
      {showLabel && (
        <Text
          text={bed.name}
          x={6 / scale} y={6 / scale}
          fontSize={11 / scale}
          fill={bed.color}
          fontStyle="bold"
          listening={false}
        />
      )}
    </Group>
  )
}
