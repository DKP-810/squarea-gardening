import { Rect, Text, Group } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'
import { hexToRgba } from '../../utils/colorUtils'
import type { Plant } from '../../types'

interface Props {
  col: number
  row: number
  plant: Plant | null
  scale: number
  onLeftClick: () => void
  onRightClick: () => void
  isSelected: boolean
}

export function SquareCell({ col, row, plant, scale, onLeftClick, onRightClick, isSelected }: Props) {
  const x = col * CELL_PX
  const y = row * CELL_PX
  const bg = plant ? hexToRgba(plant.color, 0.25) : 'rgba(255,255,255,0)'
  const border = plant ? plant.color : '#d1d5db'
  const initial = plant ? plant.name.charAt(0).toUpperCase() : ''
  const showLabel = scale > 1.0
  const showFullName = scale > 2.2

  return (
    <Group x={x} y={y}>
      <Rect
        width={CELL_PX} height={CELL_PX}
        fill={bg}
        stroke={isSelected ? '#2563eb' : border}
        strokeWidth={isSelected ? 2 / scale : 0.75 / scale}
        onClick={onLeftClick}
        onContextMenu={onRightClick}
        cornerRadius={1}
      />
      {showLabel && plant && (
        <Text
          text={showFullName ? plant.name : initial}
          x={2} y={CELL_PX / 2 - 6}
          width={CELL_PX - 4}
          align="center"
          fontSize={showFullName ? 8 : 14}
          fill={plant.color}
          listening={false}
          wrap={showFullName ? 'word' : 'none'}
          ellipsis
        />
      )}
    </Group>
  )
}
