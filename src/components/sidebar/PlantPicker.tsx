import React, { useState } from 'react'
import { Search, Sun, Cloud, CloudOff } from 'lucide-react'
import { usePlants } from '../../hooks/usePlants'
import { useAppStore } from '../../store'

const SUN_ICONS: Record<string, React.ReactNode> = {
  'full-sun': <Sun size={10} className="text-yellow-500" />,
  'partial-shade': <Cloud size={10} className="text-blue-400" />,
  'full-shade': <CloudOff size={10} className="text-gray-400" />,
}

export function PlantPicker() {
  const plants = usePlants()
  const { activePlantId, setActivePlantId, setTool } = useAppStore()
  const [search, setSearch] = useState('')

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function selectPlant(id: string) {
    setActivePlantId(id)
    setTool('paint-plant')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPlant(p.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
              activePlantId === p.id ? 'bg-green-50 ring-1 ring-green-400' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: p.color }}>
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">{p.name}</div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {SUN_ICONS[p.sunRequirement]}
                <span>{p.spacingDensity}/sqft</span>
                <span>·</span>
                <span>{p.daysToHarvest}d</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
