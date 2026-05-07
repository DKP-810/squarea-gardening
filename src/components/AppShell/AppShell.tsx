import React from 'react'
import { Map, Calendar, Leaf, Settings, Download } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store'
import { useActiveGarden } from '../../hooks/useGarden'
import { Toolbar } from './Toolbar'
import { CanvasView } from '../canvas/CanvasView'
import { CalendarView } from '../calendar/CalendarView'
import { PlantsView } from '../plants/PlantsView'
import { GardenSettingsModal } from '../modals/GardenSettingsModal'
import { ExportImportModal } from '../modals/ExportImportModal'
import type { AppView } from '../../types'

const VIEWS: { id: AppView; icon: React.ReactNode; label: string }[] = [
  { id: 'canvas', icon: <Map size={15} />, label: 'Garden' },
  { id: 'calendar', icon: <Calendar size={15} />, label: 'Calendar' },
  { id: 'plants', icon: <Leaf size={15} />, label: 'Plants' },
]

export function AppShell() {
  const { view, setView, gardenModalOpen, setGardenModalOpen, exportModalOpen, setExportModalOpen } = useAppStore()
  const garden = useActiveGarden()

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xl">🌱</span>
          <span className="font-bold text-gray-800 text-sm hidden sm:inline">Squarea</span>
        </div>

        <Toolbar />

        {/* View tabs */}
        <nav className="flex items-center gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors',
                view === v.id
                  ? 'bg-green-600 text-white font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {garden && (
            <span className="text-xs text-gray-500 hidden sm:block">
              {garden.name}
              {garden.location && <span className="text-gray-400"> · {garden.location}</span>}
            </span>
          )}
          <button onClick={() => setExportModalOpen(true)} title="Export / Import"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Download size={16} />
          </button>
          <button onClick={() => setGardenModalOpen(true)} title="Garden Settings"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {view === 'canvas' && <CanvasView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'plants' && <PlantsView />}
      </main>

      {gardenModalOpen && <GardenSettingsModal onClose={() => setGardenModalOpen(false)} />}
      {exportModalOpen && <ExportImportModal onClose={() => setExportModalOpen(false)} />}
    </div>
  )
}
