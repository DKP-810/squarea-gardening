import React, { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Copy, Leaf, Sun, Cloud, CloudOff } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { usePlants } from '../../hooks/usePlants'
import { db } from '../../db/db'
import type { Plant } from '../../types'
import { PlantEditModal } from './PlantEditModal'
import { ConfirmModal } from '../modals/ConfirmModal'

const SUN_ICONS: Record<string, React.ReactNode> = {
  'full-sun': <Sun size={12} className="text-yellow-500" />,
  'partial-shade': <Cloud size={12} className="text-blue-400" />,
  'full-shade': <CloudOff size={12} className="text-gray-400" />,
}

export function PlantsView() {
  const plants = usePlants()
  const [search, setSearch] = useState('')
  const [editPlant, setEditPlant] = useState<Plant | undefined>(undefined)
  const [showAdd, setShowAdd] = useState(false)
  const [deletePlant, setDeletePlant] = useState<Plant | null>(null)

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.variety ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(p: Plant) {
    await db.plants.delete(p.id)
    setDeletePlant(null)
  }

  async function handleDuplicate(p: Plant) {
    await db.plants.add({ ...p, id: uuidv4(), name: `Copy of ${p.name}`, isCustom: true })
  }

  function spacingLabel(p: Plant): string {
    if ((p.footprintFt ?? 1) >= 2) return `1 per ${p.footprintFt! * p.footprintFt!}sqft`
    return `${p.spacingDensity}/sqft`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Plant Library</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{plants.length}</span>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
          <Plus size={15} /> Add Plant
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Plant grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <Leaf size={40} strokeWidth={1} />
            <p className="text-sm">{search ? 'No plants match your search' : 'No plants yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="group relative bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: p.color }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditPlant(p)} title="Edit" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDuplicate(p)} title="Duplicate" className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                      <Copy size={13} />
                    </button>
                    <button onClick={() => setDeletePlant(p)} title="Delete" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-medium text-gray-800 leading-tight mb-1">{p.name}</div>
                {p.variety && <div className="text-xs text-gray-400 mb-2">{p.variety}</div>}

                <div className="flex flex-wrap gap-1 mt-auto">
                  <span className="flex items-center gap-0.5 text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">
                    {SUN_ICONS[p.sunRequirement]}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{spacingLabel(p)}</span>
                  <span className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{p.daysToHarvest}d</span>
                  {p.isCustom && <span className="text-xs text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">custom</span>}
                </div>

                {p.notes && (
                  <p className="mt-2 text-xs text-gray-400 line-clamp-2">{p.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <PlantEditModal onClose={() => setShowAdd(false)} />}
      {editPlant && <PlantEditModal plant={editPlant} onClose={() => setEditPlant(undefined)} />}
      {deletePlant && (
        <ConfirmModal
          title="Delete plant?"
          message={`Delete "${deletePlant.name}" from the library?`}
          onConfirm={() => handleDelete(deletePlant)}
          onCancel={() => setDeletePlant(null)}
        />
      )}
    </div>
  )
}
