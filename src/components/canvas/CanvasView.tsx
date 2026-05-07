import { useRef, useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { GardenStage } from './GardenStage'
import { CanvasSidebar } from '../sidebar/CanvasSidebar'
import { useActiveGarden } from '../../hooks/useGarden'
import { useAppStore } from '../../store'
import { GardenSettingsModal } from '../modals/GardenSettingsModal'

export function CanvasView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [overlapToast, setOverlapToast] = useState(false)
  const garden = useActiveGarden()
  const { gardenModalOpen, setGardenModalOpen, activeGardenId } = useAppStore()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function showOverlapToast() {
    setOverlapToast(true)
    setTimeout(() => setOverlapToast(false), 3000)
  }

  if (!activeGardenId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Squarea Gardening</h2>
          <p className="text-gray-500 text-sm mb-6">Start by creating your garden to set up frost dates and begin planning.</p>
          <button onClick={() => setGardenModalOpen(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
            Create My Garden
          </button>
        </div>
        {gardenModalOpen && <GardenSettingsModal onClose={() => setGardenModalOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-50 relative">
        {garden && !garden.lastFrostDate && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertCircle size={13} />
            Set your frost dates in Garden Settings for automatic date calculations
          </div>
        )}

        {overlapToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={13} />
            Beds cannot overlap — try a different position
            <button onClick={() => setOverlapToast(false)}><X size={13} /></button>
          </div>
        )}

        <GardenStage width={size.width} height={size.height} onBedOverlap={showOverlapToast} />
      </div>

      {/* Sidebar */}
      <CanvasSidebar />

      {gardenModalOpen && <GardenSettingsModal onClose={() => setGardenModalOpen(false)} />}
    </div>
  )
}
