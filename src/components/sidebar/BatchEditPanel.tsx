import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { X } from 'lucide-react'
import { db } from '../../db/db'
import { usePlants } from '../../hooks/usePlants'
import { useAppStore } from '../../store'
import { calcExpectedHarvest } from '../../utils/dateCalc'
import type { PlantingStatus } from '../../types'

const STATUS_OPTIONS: { value: PlantingStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'seeds-started', label: 'Seeds Started' },
  { value: 'transplanted', label: 'Transplanted' },
  { value: 'direct-sown', label: 'Direct Sown' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'failed', label: 'Failed' },
]

export function BatchEditPanel() {
  const { selectedPlantingIds, setSelectedPlantingIds, setSelectedPlantingId, setSelectedSquareId } = useAppStore()
  const plants = usePlants()
  const plantMap = useMemo(() => new Map(plants.map(p => [p.id, p])), [plants])

  const selectedPlantings = useLiveQuery(
    () => selectedPlantingIds.length > 0
      ? db.plantings.where('id').anyOf(selectedPlantingIds).toArray()
      : [],
    [selectedPlantingIds.join(',')]
  ) ?? []

  const varieties = [...new Set(selectedPlantings.map(p => p.variety ?? ''))]
  const statuses = [...new Set(selectedPlantings.map(p => p.status))]
  const seedStartDates = [...new Set(selectedPlantings.map(p => p.seedStartDate ?? ''))]
  const sowDates = [...new Set(selectedPlantings.map(p => p.transplantOrSowDate ?? ''))]
  const actualHarvestDates = [...new Set(selectedPlantings.map(p => p.actualHarvestDate ?? ''))]
  const notesList = [...new Set(selectedPlantings.map(p => p.notes))]

  const mixedVariety = varieties.length > 1
  const mixedStatus = statuses.length > 1
  const mixedSeedStart = seedStartDates.length > 1
  const mixedSowDate = sowDates.length > 1
  const mixedActualHarvest = actualHarvestDates.length > 1
  const mixedNotes = notesList.length > 1

  // null = user hasn't touched this field; don't apply on save
  const [variety, setVariety] = useState<string | null>(null)
  const [status, setStatus] = useState<PlantingStatus | '' | null>(null)
  const [seedStart, setSeedStart] = useState<string | null>(null)
  const [sowDate, setSowDate] = useState<string | null>(null)
  const [actualHarvest, setActualHarvest] = useState<string | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function clearSelection() {
    setSelectedPlantingIds([])
    setSelectedPlantingId(null)
    setSelectedSquareId(null)
  }

  async function handleSave() {
    const now = new Date().toISOString()
    await Promise.all(
      selectedPlantings.map(async (pl) => {
        const plant = plantMap.get(pl.plantId)
        const changes: Record<string, unknown> = { updatedAt: now }
        if (variety !== null) changes.variety = variety || undefined
        if (status !== null && status !== '') changes.status = status
        if (seedStart !== null) changes.seedStartDate = seedStart || null
        if (sowDate !== null) {
          changes.transplantOrSowDate = sowDate || null
          if (plant && sowDate) {
            changes.expectedHarvestDate = calcExpectedHarvest(sowDate, plant.daysToHarvest)
          } else if (!sowDate) {
            changes.expectedHarvestDate = null
          }
        }
        if (actualHarvest !== null) changes.actualHarvestDate = actualHarvest || null
        if (notes !== null) changes.notes = notes
        await db.plantings.update(pl.id, changes)
      })
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const plantNames = [...new Set(
    selectedPlantings.map(pl => {
      const plant = plantMap.get(pl.plantId)
      return plant?.name ?? 'Unknown'
    })
  )]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-700">
            {selectedPlantingIds.length} plantings selected
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">
            {plantNames.slice(0, 3).join(', ')}{plantNames.length > 3 ? ` +${plantNames.length - 3} more` : ''}
          </div>
        </div>
        <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
          <X size={15} />
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Only filled fields are applied. Leave blank to keep existing values.
      </p>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Variety</label>
        <input
          type="text"
          value={variety ?? ''}
          onChange={(e) => setVariety(e.target.value)}
          placeholder={mixedVariety ? 'Mixed values' : (varieties[0] || 'e.g. Mortgage Lifter')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
        <select
          value={status ?? ''}
          onChange={(e) => setStatus(e.target.value as PlantingStatus | '')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">{mixedStatus ? '— Mixed —' : '— No change —'}</option>
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Seed Start</label>
          <input
            type="date"
            value={seedStart ?? ''}
            onChange={(e) => setSeedStart(e.target.value)}
            placeholder={mixedSeedStart ? 'Mixed' : ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Transplant / Sow</label>
          <input
            type="date"
            value={sowDate ?? ''}
            onChange={(e) => setSowDate(e.target.value)}
            placeholder={mixedSowDate ? 'Mixed' : ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Exp. Harvest</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 italic">
            {sowDate ? 'Per plant' : '—'}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Act. Harvest</label>
          <input
            type="date"
            value={actualHarvest ?? ''}
            onChange={(e) => setActualHarvest(e.target.value)}
            placeholder={mixedActualHarvest ? 'Mixed' : ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={mixedNotes ? 'Mixed values' : 'Add notes to all selected...'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {saved ? 'Saved!' : `Apply to ${selectedPlantingIds.length} plantings`}
      </button>
    </div>
  )
}
