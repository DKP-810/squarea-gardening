import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { db } from '../../db/db'
import { usePlant } from '../../hooks/usePlants'
import { calcExpectedHarvest, formatDisplayDate } from '../../utils/dateCalc'
import { useAppStore } from '../../store'
import type { Planting, PlantingStatus } from '../../types'
import { ConfirmModal } from './ConfirmModal'

interface Props {
  planting: Planting
  onClose: () => void
}

const STATUS_OPTIONS: { value: PlantingStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'seeds-started', label: 'Seeds Started' },
  { value: 'transplanted', label: 'Transplanted' },
  { value: 'direct-sown', label: 'Direct Sown' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'failed', label: 'Failed' },
]

export function PlantingDetailModal({ planting, onClose }: Props) {
  const plant = usePlant(planting.plantId)
  const { setSelectedPlantingId } = useAppStore()
  const [variety, setVariety] = useState(planting.variety ?? '')
  const [seedStart, setSeedStart] = useState(planting.seedStartDate ?? '')
  const [sowDate, setSowDate] = useState(planting.transplantOrSowDate ?? '')
  const [actualHarvest, setActualHarvest] = useState(planting.actualHarvestDate ?? '')
  const [status, setStatus] = useState<PlantingStatus>(planting.status)
  const [notes, setNotes] = useState(planting.notes)
  const [showConfirm, setShowConfirm] = useState(false)

  const expectedHarvest = plant
    ? calcExpectedHarvest(sowDate || null, plant.daysToHarvest)
    : null

  async function handleSave() {
    const now = new Date().toISOString()
    await db.plantings.update(planting.id, {
      variety: variety || undefined,
      seedStartDate: seedStart || null,
      transplantOrSowDate: sowDate || null,
      expectedHarvestDate: expectedHarvest,
      actualHarvestDate: actualHarvest || null,
      status,
      notes,
      updatedAt: now,
    })
    onClose()
  }

  async function handleDelete() {
    await db.plantings.delete(planting.id)
    setSelectedPlantingId(null)
    onClose()
  }

  if (!plant) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: plant.color }} />
              <div>
                <h2 className="font-semibold text-gray-900">{plant.name}</h2>
                {planting.successionIndex > 0 && (
                  <span className="text-xs text-gray-500">Succession #{planting.successionIndex + 1}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Variety</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder={`e.g. Mortgage Lifter`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlantingStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {plant.indoorStartWeeks !== null && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Seed Start Date</label>
                  <input type="date" value={seedStart} onChange={(e) => setSeedStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  {plant.indoorStartWeeks !== null ? 'Transplant Date' : 'Sow Date'}
                </label>
                <input type="date" value={sowDate} onChange={(e) => setSowDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Expected Harvest</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">
                  {formatDisplayDate(expectedHarvest)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Actual Harvest</label>
                <input type="date" value={actualHarvest} onChange={(e) => setActualHarvest(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 grid grid-cols-2 gap-2">
              <span>Days to harvest: <strong>{plant.daysToHarvest}</strong></span>
              <span>Spacing: <strong>{plant.spacingDensity}/sq ft</strong></span>
              <span>Sun: <strong>{plant.sunRequirement}</strong></span>
              {plant.indoorStartWeeks && <span>Start indoors: <strong>{plant.indoorStartWeeks}w before frost</strong></span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this planting..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-5 border-t border-gray-100">
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
              <Trash2 size={15} /> Remove planting
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Remove planting?"
          message={`This will remove ${plant.name} from this square.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
