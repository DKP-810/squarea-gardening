import { useAppStore } from '../../store'
import { PlantPicker } from './PlantPicker'
import { BedPanel } from './BedPanel'
import { SquarePanel } from './SquarePanel'
import { BatchEditPanel } from './BatchEditPanel'

interface Props {
  width: number
}

export function CanvasSidebar({ width }: Props) {
  const { tool, activeBedId, selectedSquareId, selectedPlantingIds } = useAppStore()
  const asideStyle = { width }

  const showPlantPicker = tool === 'paint-plant'
  const showBatchEdit = tool === 'select' && selectedPlantingIds.length > 1
  const showBedPanel = activeBedId && !showPlantPicker && !showBatchEdit && tool !== 'add-bed'
  const showSquarePanel = selectedSquareId && tool === 'select' && !showPlantPicker && !showBatchEdit

  if (showPlantPicker) {
    return (
      <aside style={asideStyle} className="border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select a plant</div>
          <div className="text-xs text-gray-400 mt-0.5">Click a square to plant</div>
        </div>
        <PlantPicker />
      </aside>
    )
  }

  if (showBatchEdit) {
    return (
      <aside style={asideStyle} className="border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch Edit</div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <BatchEditPanel />
        </div>
      </aside>
    )
  }

  if (showSquarePanel) {
    return (
      <aside style={asideStyle} className="border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Square</div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <SquarePanel />
        </div>
      </aside>
    )
  }

  if (showBedPanel) {
    return (
      <aside style={asideStyle} className="border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bed</div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <BedPanel />
        </div>
      </aside>
    )
  }

  return (
    <aside style={asideStyle} className="border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-6 text-center">
        <div className="text-sm">
          {tool === 'add-bed' && 'Drag on the canvas to draw a bed'}
          {tool === 'select' && 'Click a bed or square to inspect'}
          {tool === 'erase-plant' && 'Click a planted square to remove it'}
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div><kbd className="bg-gray-100 text-gray-500 rounded px-1">B</kbd> Add bed</div>
          <div><kbd className="bg-gray-100 text-gray-500 rounded px-1">P</kbd> Paint plant</div>
          <div><kbd className="bg-gray-100 text-gray-500 rounded px-1">S</kbd> Select</div>
          <div><kbd className="bg-gray-100 text-gray-500 rounded px-1">E</kbd> Erase</div>
        </div>
      </div>
    </aside>
  )
}
