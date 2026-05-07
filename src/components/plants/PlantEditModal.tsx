import { useState } from 'react'
import { X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db/db'
import type { Plant, SpacingDensity, SunRequirement } from '../../types'

interface Props {
  plant?: Plant
  onClose: () => void
}

const DENSITIES: SpacingDensity[] = [1, 2, 4, 8, 9, 16]
const SUN_OPTIONS: { value: SunRequirement; label: string }[] = [
  { value: 'full-sun', label: 'Full Sun (6+ hrs)' },
  { value: 'partial-shade', label: 'Partial Shade (3–6 hrs)' },
  { value: 'full-shade', label: 'Full Shade (<3 hrs)' },
]

const PRESET_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#9b59b6','#e91e63','#795548','#607d8b',
]

export function PlantEditModal({ plant, onClose }: Props) {
  const isNew = !plant
  const [name, setName] = useState(plant?.name ?? '')
  const [variety, setVariety] = useState(plant?.variety ?? '')
  const [density, setDensity] = useState<SpacingDensity>(plant?.spacingDensity ?? 1)
  const [dth, setDth] = useState(String(plant?.daysToHarvest ?? 60))
  const [indoorWks, setIndoorWks] = useState(plant?.indoorStartWeeks != null ? String(plant.indoorStartWeeks) : '')
  const [txpWks, setTxpWks] = useState(String(plant?.transplantWeeksAfterFrost ?? 0))
  const [sun, setSun] = useState<SunRequirement>(plant?.sunRequirement ?? 'full-sun')
  const [color, setColor] = useState(plant?.color ?? '#2ecc71')
  const [notes, setNotes] = useState(plant?.notes ?? '')

  async function handleSave() {
    if (!name.trim()) return
    const data: Plant = {
      id: plant?.id ?? uuidv4(),
      name: name.trim(),
      variety: variety.trim() || undefined,
      spacingDensity: density,
      daysToHarvest: Number(dth) || 60,
      indoorStartWeeks: indoorWks !== '' ? Number(indoorWks) : null,
      transplantWeeksAfterFrost: Number(txpWks) || 0,
      sunRequirement: sun,
      color,
      isCustom: true,
      notes,
    }
    if (isNew) {
      await db.plants.add(data)
    } else {
      await db.plants.put(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 my-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isNew ? 'Add Plant' : 'Edit Plant'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Plant name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Roma Tomato"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Variety (optional)</label>
              <input type="text" value={variety} onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Brandywine"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Days to harvest</label>
              <input type="number" value={dth} onChange={(e) => setDth(e.target.value)} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Plants per sq ft</label>
            <div className="flex gap-2 flex-wrap">
              {DENSITIES.map((d) => (
                <button key={d} onClick={() => setDensity(d)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${density === d ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Indoor start (wks before frost)</label>
              <input type="number" value={indoorWks} onChange={(e) => setIndoorWks(e.target.value)}
                placeholder="Leave blank = direct sow"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Transplant (wks vs frost)</label>
              <input type="number" value={txpWks} onChange={(e) => setTxpWks(e.target.value)}
                placeholder="0 = at frost, neg = before"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Sun requirement</label>
            <select value={sun} onChange={(e) => setSun(e.target.value as SunRequirement)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {SUN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Display color</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Growing tips, variety notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isNew ? 'Add Plant' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
