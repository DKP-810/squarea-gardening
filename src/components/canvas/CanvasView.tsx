import { useRef, useState, useEffect, useCallback } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { GardenStage } from './GardenStage'
import { CanvasSidebar } from '../sidebar/CanvasSidebar'
import { useActiveGarden } from '../../hooks/useGarden'
import { useAppStore } from '../../store'
import { GardenSettingsModal } from '../modals/GardenSettingsModal'

const MIN_SIDEBAR = 200
const MAX_SIDEBAR = 420

export function CanvasView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [overlapToast, setOverlapToast] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(224)
  const [isResizing, setIsResizing] = useState(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const garden = useActiveGarden()
  const { gardenModalOpen, setGardenModalOpen, activeGardenId } = useAppStore()

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX
    dragStartWidth.current = sidebarWidth
    setIsResizing(true)
    e.preventDefault()
  }, [sidebarWidth])

  useEffect(() => {
    if (!isResizing) return
    function onMouseMove(e: MouseEvent) {
      const delta = dragStartX.current - e.clientX
      setSidebarWidth(Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, dragStartWidth.current + delta)))
    }
    function onMouseUp() { setIsResizing(false) }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

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
    <div className={`flex flex-1 overflow-hidden relative${isResizing ? ' select-none cursor-col-resize' : ''}`}>
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

      {/* Resize handle */}
      <div
        className={`w-1 flex-shrink-0 cursor-col-resize transition-colors ${isResizing ? 'bg-green-500' : 'bg-gray-200 hover:bg-green-400'}`}
        onMouseDown={onResizeMouseDown}
      />

      {/* Sidebar */}
      <CanvasSidebar width={sidebarWidth} />

      {gardenModalOpen && <GardenSettingsModal onClose={() => setGardenModalOpen(false)} />}
    </div>
  )
}
