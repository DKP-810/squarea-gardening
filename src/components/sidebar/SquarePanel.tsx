import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { usePlant } from '../../hooks/usePlants'
import { PlantingDetailModal } from '../modals/PlantingDetailModal'

export function SquarePanel() {
  const { selectedSquareId, selectedPlantingId } = useAppStore()
  const square = useLiveQuery(() => selectedSquareId ? db.squares.get(selectedSquareId) : undefined, [selectedSquareId])
  const plantings = useLiveQuery(
    () => selectedSquareId ? db.plantings.where('squareId').equals(selectedSquareId).toArray() : [],
    [selectedSquareId]
  ) ?? []
  const activePlanting = plantings.find((p) => p.id === selectedPlantingId) ?? plantings[0]
  const [showDetail, setShowDetail] = useState(false)

  if (!square) return (
    <div className="p-4 text-sm text-gray-400 text-center">Click a square to inspect</div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs text-gray-500">
        Square ({square.col + 1}, {square.row + 1}) · {square.useSubgrid ? '3" sub-grid' : '1 sq ft'}
      </div>

      {plantings.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-4">No plantings in this square.<br />Select Paint Plant tool to add one.</div>
      ) : (
        <div className="space-y-2">
          {plantings.map((pl) => (
            <PlantingRow key={pl.id} plantId={pl.plantId}
              successionIndex={pl.successionIndex}
              status={pl.status}
              onEdit={() => setShowDetail(true)} />
          ))}
        </div>
      )}

      {showDetail && activePlanting && (
        <PlantingDetailModal planting={activePlanting} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}

function PlantingRow({ plantId, successionIndex, status, onEdit }: {
  plantId: string
  successionIndex: number
  status: string
  onEdit: () => void
}) {
  const plant = usePlant(plantId)
  if (!plant) return null

  const statusColors: Record<string, string> = {
    planned: 'bg-gray-100 text-gray-600',
    'seeds-started': 'bg-purple-100 text-purple-700',
    transplanted: 'bg-blue-100 text-blue-700',
    'direct-sown': 'bg-blue-100 text-blue-700',
    growing: 'bg-green-100 text-green-700',
    harvested: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <button onClick={onEdit}
      className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-left">
      <div className="w-5 h-5 rounded shrink-0" style={{ backgroundColor: plant.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-800 truncate">{plant.name}</div>
        {successionIndex > 0 && <div className="text-xs text-gray-400">Succession #{successionIndex + 1}</div>}
      </div>
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    </button>
  )
}
