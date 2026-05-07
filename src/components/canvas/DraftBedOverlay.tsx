import { Layer, Rect, Text } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'

interface Props {
  startX: number
  startY: number
  endX: number
  endY: number
  scale: number
}

export function DraftBedOverlay({ startX, startY, endX, endY, scale }: Props) {
  const x = Math.min(startX, endX) * CELL_PX
  const y = Math.min(startY, endY) * CELL_PX
  const w = Math.max(1, Math.abs(endX - startX)) * CELL_PX
  const h = Math.max(1, Math.abs(endY - startY)) * CELL_PX
  const wFt = Math.max(1, Math.abs(endX - startX))
  const hFt = Math.max(1, Math.abs(endY - startY))

  return (
    <Layer listening={false}>
      <Rect
        x={x} y={y} width={w} height={h}
        fill="rgba(34,197,94,0.1)"
        stroke="#22c55e"
        strokeWidth={2 / scale}
        dash={[6 / scale, 3 / scale]}
        cornerRadius={4 / scale}
      />
      <Text
        x={x + 6 / scale} y={y + 6 / scale}
        text={`${wFt}' × ${hFt}'`}
        fontSize={12 / scale}
        fill="#16a34a"
        fontStyle="bold"
      />
    </Layer>
  )
}
