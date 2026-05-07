import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { useLiveQuery } from 'dexie-react-hooks'
import { ConfirmModal } from '../modals/ConfirmModal'

const BED_COLORS = ['#16a34a','#2563eb','#dc2626','#d97706','#7c3aed','#0891b2','#be185d','#78716c']

export function BedPanel() {
  const { activeBedId, setActiveBedId } = useAppStore()
  const bed = useLiveQuery(() => activeBedId ? db.beds.get(activeBedId) : undefined, [activeBedId])
  const [name, setName] = useState('')
  const [bedType, setBedType] = useState<'raised' | 'in-ground'>('raised')
  const [color, setColor] = useState('#16a34a')
  const [notes, setNotes] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (bed) {
      setName(bed.name)
      setBedType(bed.bedType)
      setColor(bed.color)
      setNotes(bed.notes)
    }
  }, [bed])

  async function handleSave() {
    if (!bed) return
    await db.beds.update(bed.id, { name, bedType, color, notes })
  }

  async function handleDelete() {
    if (!bed) return
    // Delete squares and plantings for this bed
    const squares = await db.squares.where('bedId').equals(bed.id).toArray()
    const squareIds = squares.map((s) => s.id)
    if (squareIds.length) await db.plantings.where('squareId').anyOf(squareIds).delete()
    await db.squares.where('bedId').equals(bed.id).delete()
    await db.beds.delete(bed.id)
    setActiveBedId(null)
  }

  if (!bed) return (
    <div className="p-4 text-sm text-gray-400 text-center">Select a bed to edit</div>
  )

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSave}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Type</label>
        <div className="flex gap-2">
          {(['raised', 'in-ground'] as const).map((t) => (
            <button key={t} onClick={() => { setBedType(t); db.beds.update(bed.id, { bedType: t }) }}
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${bedType === t ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'}`}>
              {t === 'raised' ? 'Raised' : 'In-Ground'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Color</label>
        <div className="flex gap-2 flex-wrap">
          {BED_COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); db.beds.update(bed.id, { color: c }) }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-gray-700 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <div className="font-medium text-gray-700 mb-1">Dimensions</div>
        <div>{bed.widthFt}' × {bed.heightFt}' = {bed.widthFt * bed.heightFt} sq ft</div>
        <div className="text-gray-400 mt-0.5">Position: ({bed.x}, {bed.y})</div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleSave}
          rows={3} placeholder="Notes about this bed..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
      </div>

      <button onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
        <Trash2 size={14} /> Delete Bed
      </button>

      {showConfirm && (
        <ConfirmModal
          title="Delete bed?"
          message={`Delete "${bed.name}" and all its plantings?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
