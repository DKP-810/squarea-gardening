import React, { useMemo } from 'react'
import { Layer, Line } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'

const MINOR_PX = CELL_PX / 2 // 6" = 24px

interface Props {
  stageWidth: number
  stageHeight: number
  offsetX: number
  offsetY: number
  scale: number
}

export function GridLayer({ stageWidth, stageHeight, offsetX, offsetY, scale }: Props) {
  const lines = useMemo(() => {
    const result: React.ReactNode[] = []

    const worldLeft = -offsetX / scale
    const worldTop = -offsetY / scale
    const worldRight = worldLeft + stageWidth / scale
    const worldBottom = worldTop + stageHeight / scale

    // Minor grid (6") — only when zoomed in enough to be useful
    if (scale >= 0.8) {
      const startMinorCol = Math.floor(worldLeft / MINOR_PX) - 1
      const endMinorCol = Math.ceil(worldRight / MINOR_PX) + 1
      const startMinorRow = Math.floor(worldTop / MINOR_PX) - 1
      const endMinorRow = Math.ceil(worldBottom / MINOR_PX) + 1

      for (let c = startMinorCol; c <= endMinorCol; c++) {
        if (c % 2 === 0) continue // skip — major line drawn below
        const x = c * MINOR_PX
        result.push(
          <Line key={`vm-${c}`} points={[x, worldTop, x, worldBottom]}
            stroke="#eeeeee" strokeWidth={0.5 / scale} listening={false} />
        )
      }
      for (let r = startMinorRow; r <= endMinorRow; r++) {
        if (r % 2 === 0) continue
        const y = r * MINOR_PX
        result.push(
          <Line key={`hm-${r}`} points={[worldLeft, y, worldRight, y]}
            stroke="#eeeeee" strokeWidth={0.5 / scale} listening={false} />
        )
      }
    }

    // Major grid (1ft)
    const startCol = Math.floor(worldLeft / CELL_PX) - 1
    const endCol = Math.ceil(worldRight / CELL_PX) + 1
    const startRow = Math.floor(worldTop / CELL_PX) - 1
    const endRow = Math.ceil(worldBottom / CELL_PX) + 1

    for (let c = startCol; c <= endCol; c++) {
      const x = c * CELL_PX
      result.push(
        <Line key={`v-${c}`} points={[x, worldTop, x, worldBottom]}
          stroke="#d1d5db" strokeWidth={1 / scale} listening={false} />
      )
    }
    for (let r = startRow; r <= endRow; r++) {
      const y = r * CELL_PX
      result.push(
        <Line key={`h-${r}`} points={[worldLeft, y, worldRight, y]}
          stroke="#d1d5db" strokeWidth={1 / scale} listening={false} />
      )
    }

    return result
  }, [stageWidth, stageHeight, offsetX, offsetY, scale])

  if (scale < 0.4) return null

  return <Layer listening={false}>{lines}</Layer>
}
