import React from 'react'
import { MousePointer2, Eraser, Square, Leaf } from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'
import type { CanvasTool } from '../../types'

const TOOLS: { id: CanvasTool; icon: React.ReactNode; label: string; key: string }[] = [
  { id: 'select', icon: <MousePointer2 size={16} />, label: 'Select (S)', key: 'S' },
  { id: 'add-bed', icon: <Square size={16} />, label: 'Add Bed (B)', key: 'B' },
  { id: 'paint-plant', icon: <Leaf size={16} />, label: 'Paint Plant (P)', key: 'P' },
  { id: 'erase-plant', icon: <Eraser size={16} />, label: 'Erase (E)', key: 'E' },
]

export function Toolbar() {
  const { tool, setTool, view } = useAppStore()
  if (view !== 'canvas') return null

  return (
    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors',
            tool === t.id
              ? 'bg-green-100 text-green-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.id === 'select' ? 'Select' : t.id === 'add-bed' ? 'Bed' : t.id === 'paint-plant' ? 'Plant' : 'Erase'}</span>
        </button>
      ))}
    </div>
  )
}
