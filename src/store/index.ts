import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import type { AppView, CanvasTool } from '../types'

interface CanvasViewport {
  x: number
  y: number
  scale: number
  cellPx: number
}

interface BedDrawing {
  active: boolean
  startX: number | null
  startY: number | null
}

interface AppState {
  // Garden
  activeGardenId: string | null
  // View
  view: AppView
  // Canvas
  tool: CanvasTool
  activePlantId: string | null
  paintBatchId: string | null
  activeBedId: string | null
  selectedSquareId: string | null
  selectedPlantingId: string | null
  selectedPlantingIds: string[]
  bedDrawing: BedDrawing
  viewport: CanvasViewport
  // Calendar
  calendarYear: number
  // UI
  sidebarOpen: boolean
  gardenModalOpen: boolean
  exportModalOpen: boolean

  // Actions
  setView: (view: AppView) => void
  setTool: (tool: CanvasTool) => void
  setActivePlantId: (id: string | null) => void
  newPaintBatch: () => void
  setActiveBedId: (id: string | null) => void
  setSelectedSquareId: (id: string | null) => void
  setSelectedPlantingId: (id: string | null) => void
  setSelectedPlantingIds: (ids: string[]) => void
  setActiveGardenId: (id: string | null) => void
  setBedDrawing: (drawing: BedDrawing) => void
  setViewport: (vp: Partial<CanvasViewport>) => void
  setCalendarYear: (year: number) => void
  setSidebarOpen: (open: boolean) => void
  setGardenModalOpen: (open: boolean) => void
  setExportModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    activeGardenId: null,
    view: 'canvas',
    tool: 'select',
    activePlantId: null,
    paintBatchId: null,
    activeBedId: null,
    selectedSquareId: null,
    selectedPlantingId: null,
    selectedPlantingIds: [],
    bedDrawing: { active: false, startX: null, startY: null },
    viewport: { x: 0, y: 0, scale: 1, cellPx: 48 },
    calendarYear: new Date().getFullYear(),
    sidebarOpen: true,
    gardenModalOpen: false,
    exportModalOpen: false,

    setView: (view) => set((s) => { s.view = view }),
    setTool: (tool) => set((s) => { s.tool = tool }),
    setActivePlantId: (id) => set((s) => { s.activePlantId = id; s.paintBatchId = id ? uuidv4() : null }),
    newPaintBatch: () => set((s) => { s.paintBatchId = uuidv4() }),
    setActiveBedId: (id) => set((s) => { s.activeBedId = id }),
    setSelectedSquareId: (id) => set((s) => { s.selectedSquareId = id }),
    setSelectedPlantingId: (id) => set((s) => { s.selectedPlantingId = id }),
    setSelectedPlantingIds: (ids) => set((s) => { s.selectedPlantingIds = ids; s.selectedPlantingId = ids[0] ?? null }),
    setActiveGardenId: (id) => set((s) => { s.activeGardenId = id }),
    setBedDrawing: (drawing) => set((s) => { s.bedDrawing = drawing }),
    setViewport: (vp) => set((s) => { Object.assign(s.viewport, vp) }),
    setCalendarYear: (year) => set((s) => { s.calendarYear = year }),
    setSidebarOpen: (open) => set((s) => { s.sidebarOpen = open }),
    setGardenModalOpen: (open) => set((s) => { s.gardenModalOpen = open }),
    setExportModalOpen: (open) => set((s) => { s.exportModalOpen = open }),
  }))
)
