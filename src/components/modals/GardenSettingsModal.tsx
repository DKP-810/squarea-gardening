import { useState, useEffect } from 'react'
import { X, Sprout } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { useActiveGarden } from '../../hooks/useGarden'
import type { Garden } from '../../types'

interface Props {
  onClose: () => void
}

export function GardenSettingsModal({ onClose }: Props) {
  const { setActiveGardenId } = useAppStore()
  const garden = useActiveGarden()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [lastFrost, setLastFrost] = useState('')
  const [firstFrost, setFirstFrost] = useState('')

  useEffect(() => {
    if (garden) {
      setName(garden.name)
      setLocation(garden.location ?? '')
      setLastFrost(garden.lastFrostDate ?? '')
      setFirstFrost(garden.firstFrostDate ?? '')
    }
  }, [garden])

  async function handleSave() {
    if (!name.trim()) return
    const now = new Date().toISOString()
    if (garden) {
      await db.gardens.update(garden.id, {
        name: name.trim(),
        location: location.trim() || undefined,
        lastFrostDate: lastFrost || null,
        firstFrostDate: firstFrost || null,
        updatedAt: now,
      })
    } else {
      const id = uuidv4()
      const newGarden: Garden = {
        id,
        name: name.trim(),
        location: location.trim() || undefined,
        lastFrostDate: lastFrost || null,
        firstFrostDate: firstFrost || null,
        createdAt: now,
        updatedAt: now,
      }
      await db.gardens.add(newGarden)
      setActiveGardenId(id)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sprout size={20} className="text-green-600" />
            <h2 className="font-semibold text-gray-900">Garden Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Garden name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Backyard Garden"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Zone 6b, Portland OR"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last spring frost</label>
              <input
                type="date"
                value={lastFrost}
                onChange={(e) => setLastFrost(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First fall frost</label>
              <input
                type="date"
                value={firstFrost}
                onChange={(e) => setFirstFrost(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Frost dates are used to auto-calculate seed start and transplant dates.
          </p>
        </div>

        <div className="flex gap-3 justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
