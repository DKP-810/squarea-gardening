import { useRef, useState, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { useBeds } from '../../hooks/useBeds'
import { snapToFoot, wouldOverlapExisting } from '../../utils/gridMath'
import { GridLayer } from './GridLayer'
import { BedShape } from './BedShape'
import { DraftBedOverlay } from './DraftBedOverlay'
import type Konva from 'konva'
import type { Bed } from '../../types'

const BED_COLORS = ['#16a34a','#2563eb','#dc2626','#d97706','#7c3aed','#0891b2','#be185d']

interface Props {
  width: number
  height: number
  onBedOverlap: () => void
}

export function GardenStage({ width, height, onBedOverlap }: Props) {
  const { tool, bedDrawing, setBedDrawing, viewport, setViewport, activeGardenId, setActiveBedId, setSelectedSquareId } = useAppStore()
  const beds = useBeds()
  const stageRef = useRef<Konva.Stage>(null)
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })
  const [draftEnd, setDraftEnd] = useState({ x: 0, y: 0 })

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    const scaleBy = 1.08
    const oldScale = viewport.scale
    const newScale = e.evt.deltaY < 0
      ? Math.min(4, oldScale * scaleBy)
      : Math.max(0.3, oldScale / scaleBy)

    const stage = stageRef.current!
    const pointer = stage.getPointerPosition()!
    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    }
    setViewport({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target !== stageRef.current) return // clicked a shape

    if (tool === 'select') {
      isPanning.current = true
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      setActiveBedId(null)
      setSelectedSquareId(null)
      return
    }

    if (tool === 'add-bed') {
      const pos = stageRef.current!.getPointerPosition()!
      const wx = snapToFoot(pos.x - viewport.x, viewport.scale)
      const wy = snapToFoot(pos.y - viewport.y, viewport.scale)
      setBedDrawing({ active: true, startX: wx, startY: wy })
      setDraftEnd({ x: wx, y: wy })
    }
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (isPanning.current && tool === 'select') {
      const dx = e.evt.clientX - lastPan.current.x
      const dy = e.evt.clientY - lastPan.current.y
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      setViewport({ x: viewport.x + dx, y: viewport.y + dy })
      return
    }

    if (tool === 'add-bed' && bedDrawing.active) {
      const pos = stageRef.current!.getPointerPosition()!
      const wx = snapToFoot(pos.x - viewport.x, viewport.scale)
      const wy = snapToFoot(pos.y - viewport.y, viewport.scale)
      setDraftEnd({ x: wx, y: wy })
    }
  }

  async function handleMouseUp() {
    isPanning.current = false

    if (tool === 'add-bed' && bedDrawing.active && bedDrawing.startX !== null) {
      const x = Math.min(bedDrawing.startX, draftEnd.x)
      const y = Math.min(bedDrawing.startY!, draftEnd.y)
      const w = Math.max(1, Math.abs(draftEnd.x - bedDrawing.startX))
      const h = Math.max(1, Math.abs(draftEnd.y - bedDrawing.startY!))

      setBedDrawing({ active: false, startX: null, startY: null })

      if (!wouldOverlapExisting(x, y, w, h, beds)) {
        const colorIndex = beds.length % BED_COLORS.length
        const newBed: Bed = {
          id: uuidv4(),
          gardenId: activeGardenId!,
          name: `Bed ${beds.length + 1}`,
          bedType: 'raised',
          x, y,
          widthFt: w,
          heightFt: h,
          color: BED_COLORS[colorIndex],
          notes: '',
          createdAt: new Date().toISOString(),
        }
        await db.beds.add(newBed)
        setActiveBedId(newBed.id)
      } else {
        onBedOverlap()
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const { setTool, setActivePlantId } = useAppStore.getState()
      if (e.key === 'b' || e.key === 'B') setTool('add-bed')
      if (e.key === 's' || e.key === 'S') setTool('select')
      if (e.key === 'p' || e.key === 'P') setTool('paint-plant')
      if (e.key === 'e' || e.key === 'E') setTool('erase-plant')
      if (e.key === 'Escape') {
        setTool('select')
        setActivePlantId(null)
        setActiveBedId(null)
        setSelectedSquareId(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: tool === 'add-bed' ? 'crosshair' : tool === 'paint-plant' ? 'cell' : tool === 'erase-plant' ? 'not-allowed' : 'default' }}
    >
      <GridLayer
        stageWidth={width}
        stageHeight={height}
        offsetX={viewport.x}
        offsetY={viewport.y}
        scale={viewport.scale}
      />
      <Layer x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale}>
        {beds.map((bed) => (
          <BedShape
            key={bed.id}
            bed={bed}
            scale={viewport.scale}
            onSelect={() => setActiveBedId(bed.id)}
          />
        ))}
      </Layer>
      {bedDrawing.active && bedDrawing.startX !== null && (
        <DraftBedOverlay
          startX={bedDrawing.startX}
          startY={bedDrawing.startY!}
          endX={draftEnd.x}
          endY={draftEnd.y}
          scale={viewport.scale}
        />
      )}
    </Stage>
  )
}
