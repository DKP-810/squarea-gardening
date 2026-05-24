import React from 'react'
import { MousePointer2, Eraser, Square, Leaf } from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'
import type { CanvasTool } from '../../types'

const TOOLS: { id: CanvasTool; icon: React.ReactNode; label: string }[] = [
  { id: 'select',      icon: <MousePointer2 size={16} />, label: 'Select (S)' },
  { id: 'add-bed',     icon: <Square size={16} />,        label: 'Add Bed (B)' },
  { id: 'paint-plant', icon: <Leaf size={16} />,          label: 'Paint Plant (P)' },
  { id: 'erase-plant', icon: <Eraser size={16} />,        label: 'Erase (E)' },
]

const LABELS: Record<CanvasTool, string> = {
  'select': 'Select',
  'add-bed': 'Bed',
  'paint-plant': 'Plant',
  'erase-plant': 'Erase',
}

interface Props {
  bedButtonRef?: React.RefObject<HTMLButtonElement | null>
  highlightBed?: boolean
}

export function Toolbar({ bedButtonRef, highlightBed }: Props) {
  const { tool, setTool, view } = useAppStore()
  if (view !== 'canvas') return null

  return (
    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          ref={t.id === 'add-bed' ? bedButtonRef : undefined}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors',
            tool === t.id
              ? 'bg-green-100 text-green-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100',
            t.id === 'add-bed' && highlightBed && 'ring-2 ring-green-500 ring-offset-1'
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{LABELS[t.id]}</span>
        </button>
      ))}
    </div>
  )
}
