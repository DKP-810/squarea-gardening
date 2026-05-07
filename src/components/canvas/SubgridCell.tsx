import { Rect, Group } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'
import { hexToRgba } from '../../utils/colorUtils'
import type { Plant } from '../../types'

const SUBCELL = CELL_PX / 4

interface Props {
  subCol: number
  subRow: number
  plant: Plant | null
  scale: number
  onLeftClick: () => void
  onRightClick: () => void
  isSelected: boolean
}

export function SubgridCell({ subCol, subRow, plant, scale, onLeftClick, onRightClick, isSelected }: Props) {
  const x = subCol * SUBCELL
  const y = subRow * SUBCELL
  const bg = plant ? hexToRgba(plant.color, 0.3) : 'rgba(255,255,255,0)'
  const border = plant ? plant.color : '#e5e7eb'

  return (
    <Group x={x} y={y}>
      <Rect
        width={SUBCELL} height={SUBCELL}
        fill={bg}
        stroke={isSelected ? '#2563eb' : border}
        strokeWidth={isSelected ? 1.5 / scale : 0.5 / scale}
        onClick={onLeftClick}
        onContextMenu={onRightClick}
        cornerRadius={0.5}
      />
    </Group>
  )
}
