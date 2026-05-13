import { Rect, Text, Group, Circle } from 'react-konva'
import { CELL_PX } from '../../utils/gridMath'
import { hexToRgba } from '../../utils/colorUtils'
import type { Plant } from '../../types'

const PIP_POSITIONS: Partial<Record<number, Array<[number, number]>>> = {
  1: [[0.5, 0.5]],
  2: [[0.32, 0.32], [0.68, 0.68]],
  4: [[0.32, 0.32], [0.68, 0.32], [0.32, 0.68], [0.68, 0.68]],
  8: [
    [0.2, 0.32], [0.4, 0.32], [0.6, 0.32], [0.8, 0.32],
    [0.2, 0.68], [0.4, 0.68], [0.6, 0.68], [0.8, 0.68],
  ],
  9: [
    [0.2, 0.2], [0.5, 0.2], [0.8, 0.2],
    [0.2, 0.5], [0.5, 0.5], [0.8, 0.5],
    [0.2, 0.8], [0.5, 0.8], [0.8, 0.8],
  ],
  16: [
    [0.2, 0.2], [0.4, 0.2], [0.6, 0.2], [0.8, 0.2],
    [0.2, 0.4], [0.4, 0.4], [0.6, 0.4], [0.8, 0.4],
    [0.2, 0.6], [0.4, 0.6], [0.6, 0.6], [0.8, 0.6],
    [0.2, 0.8], [0.4, 0.8], [0.6, 0.8], [0.8, 0.8],
  ],
}

const pipRadius = (density: number) => (density >= 9 ? 2 : 3)

interface Props {
  col: number
  row: number
  plant: Plant | null
  variety?: string
  scale: number
  onLeftClick: (ctrlKey: boolean) => void
  onRightClick: () => void
  isSelected: boolean
}

export function SquareCell({ col, row, plant, variety, scale, onLeftClick, onRightClick, isSelected }: Props) {
  const x = col * CELL_PX
  const y = row * CELL_PX
  const bg = plant ? hexToRgba(plant.color, 0.25) : 'rgba(255,255,255,0)'
  const border = plant ? plant.color : '#d1d5db'
  const showLabel = scale > 1.0
  const showFullName = scale > 2.2
  const pips = plant ? (PIP_POSITIONS[plant.spacingDensity] ?? []) : []

  const displayFull = plant
    ? (variety ? `${plant.name} (${variety})` : plant.name)
    : ''
  const displayInitial = plant
    ? (variety ? variety.charAt(0).toUpperCase() : plant.name.charAt(0).toUpperCase())
    : ''

  return (
    <Group x={x} y={y}>
      <Rect
        width={CELL_PX} height={CELL_PX}
        fill={bg}
        stroke={isSelected ? '#2563eb' : border}
        strokeWidth={isSelected ? 2 / scale : 0.75 / scale}
        onClick={(e) => onLeftClick(e.evt.ctrlKey)}
        onContextMenu={onRightClick}
        cornerRadius={1}
      />
      {plant && pips.map(([fx, fy], i) => (
        <Circle
          key={i}
          x={fx * CELL_PX}
          y={fy * CELL_PX}
          radius={pipRadius(plant.spacingDensity)}
          fill={hexToRgba(plant.color, 0.55)}
          listening={false}
        />
      ))}
      {showLabel && plant && (
        <Text
          text={showFullName ? displayFull : displayInitial}
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
