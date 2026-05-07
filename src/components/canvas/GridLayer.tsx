import React, { useMemo } from 'react'
import { Layer, Line } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'

interface Props {
  stageWidth: number
  stageHeight: number
  offsetX: number
  offsetY: number
  scale: number
}

export function GridLayer({ stageWidth, stageHeight, offsetX, offsetY, scale }: Props) {
  const scaledCell = CELL_PX * scale

  const lines = useMemo(() => {
    const result: React.ReactNode[] = []

    // World bounds visible on screen
    const worldLeft = -offsetX / scale
    const worldTop = -offsetY / scale
    const worldRight = worldLeft + stageWidth / scale
    const worldBottom = worldTop + stageHeight / scale

    const startCol = Math.floor(worldLeft / CELL_PX) - 1
    const endCol = Math.ceil(worldRight / CELL_PX) + 1
    const startRow = Math.floor(worldTop / CELL_PX) - 1
    const endRow = Math.ceil(worldBottom / CELL_PX) + 1

    const MAX_LINES = 60
    const colCount = Math.min(endCol - startCol, MAX_LINES)
    const rowCount = Math.min(endRow - startRow, MAX_LINES)

    for (let c = startCol; c <= startCol + colCount; c++) {
      const x = c * CELL_PX
      result.push(
        <Line key={`v-${c}`} points={[x, worldTop, x, worldBottom]}
          stroke="#e5e7eb" strokeWidth={0.5 / scale} listening={false} />
      )
    }
    for (let r = startRow; r <= startRow + rowCount; r++) {
      const y = r * CELL_PX
      result.push(
        <Line key={`h-${r}`} points={[worldLeft, y, worldRight, y]}
          stroke="#e5e7eb" strokeWidth={0.5 / scale} listening={false} />
      )
    }

    return result
  }, [stageWidth, stageHeight, offsetX, offsetY, scale, scaledCell])

  if (scale <= 0.4) return null

  return <Layer listening={false}>{lines}</Layer>
}
