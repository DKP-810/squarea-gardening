import { Layer, Rect, Circle, Text } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'
import { hexToRgba } from '../../utils/colorUtils'
import type { Plant } from '../../types'

interface Props {
  stampCol: number
  stampRow: number
  footprintFt: number
  plant: Plant
  isValid: boolean
  scale: number
}

export function PlantStampOverlay({ stampCol, stampRow, footprintFt, plant, isValid, scale }: Props) {
  const x = stampCol * CELL_PX
  const y = stampRow * CELL_PX
  const size = footprintFt * CELL_PX
  const cx = x + size / 2
  const cy = y + size / 2
  const color = isValid ? plant.color : '#9ca3af'
  const fillOpacity = isValid ? 0.12 : 0.08

  return (
    <Layer listening={false}>
      <Rect
        x={x} y={y} width={size} height={size}
        fill={isValid ? hexToRgba(plant.color, fillOpacity) : `rgba(156,163,175,${fillOpacity})`}
        stroke={color}
        strokeWidth={2 / scale}
        dash={[6 / scale, 3 / scale]}
        cornerRadius={4 / scale}
      />
      <Circle
        x={cx} y={cy}
        radius={5}
        fill={isValid ? hexToRgba(plant.color, 0.5) : 'rgba(156,163,175,0.5)'}
      />
      {scale > 0.6 && (
        <Text
          x={x + 4 / scale}
          y={cy + 8 / scale}
          width={size - 8 / scale}
          align="center"
          text={scale > 1.2 ? plant.name : plant.name.charAt(0)}
          fontSize={scale > 1.2 ? 9 / scale : 14 / scale}
          fill={color}
          fontStyle="bold"
          listening={false}
        />
      )}
    </Layer>
  )
}
