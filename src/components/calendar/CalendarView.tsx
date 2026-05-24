import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { parseISO, isValid, startOfYear, differenceInDays, format } from 'date-fns'
import { db } from '../../db/db'
import { useAppStore } from '../../store'
import { useActiveGarden } from '../../hooks/useGarden'
import { useBeds } from '../../hooks/useBeds'
import type { Planting, Plant, Square, Bed } from '../../types'
import { PlantingDetailModal } from '../modals/PlantingDetailModal'

const DAY_PX = 2.5
const ROW_H = 44
const LABEL_W = 200

function dayOffset(dateStr: string, year: number): number {
  const d = parseISO(dateStr)
  if (!isValid(d)) return 0
  return differenceInDays(d, startOfYear(new Date(year, 0, 1)))
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

interface PlantingRowData {
  planting: Planting
  plant: Plant
  square: Square
  bed: Bed
}

type CalendarEntry =
  | { type: 'single'; row: PlantingRowData }
  | { type: 'batch'; batchId: string; plant: Plant; variety: string | null; rows: PlantingRowData[] }

export function CalendarView() {
  const { calendarYear, setCalendarYear, setSelectedPlantingId, selectedPlantingId } = useAppStore()
  const garden = useActiveGarden()
  const beds = useBeds()
  const scrollRef = useRef<HTMLDivElement>(null)
  const labelScrollRef = useRef<HTMLDivElement>(null)
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

  const allSquares = useLiveQuery(
    () => beds.length ? db.squares.where('bedId').anyOf(beds.map((b) => b.id)).toArray() : [],
    [beds.map((b) => b.id).join(',')]
  ) ?? []

  const allPlantings = useLiveQuery(
    () => allSquares.length ? db.plantings.where('squareId').anyOf(allSquares.map((s) => s.id)).toArray() : [],
    [allSquares.map((s) => s.id).join(',')]
  ) ?? []

  const allPlants = useLiveQuery(() => db.plants.toArray(), []) ?? []

  const selectedPlanting = allPlantings.find((p) => p.id === selectedPlantingId) ?? null

  const plantMap = new Map(allPlants.map((p) => [p.id, p]))
  const squareMap = new Map(allSquares.map((s) => [s.id, s]))
  const bedMap = new Map(beds.map((b) => [b.id, b]))

  const rows: PlantingRowData[] = []
  allPlantings.forEach((pl) => {
    const plant = plantMap.get(pl.plantId)
    const square = squareMap.get(pl.squareId)
    if (!plant || !square) return
    const bed = bedMap.get(square.bedId)
    if (!bed) return
    rows.push({ planting: pl, plant, square, bed })
  })

  rows.sort((a, b) => {
    const bedCmp = a.bed.name.localeCompare(b.bed.name)
    if (bedCmp !== 0) return bedCmp
    const sqCmp = a.square.row - b.square.row || a.square.col - b.square.col
    if (sqCmp !== 0) return sqCmp
    return a.planting.successionIndex - b.planting.successionIndex
  })

  // Group sorted rows into batch entries and singles
  const entries: CalendarEntry[] = []
  const seenBatches = new Set<string>()
  for (const row of rows) {
    const bid = row.planting.batchId
    if (!bid) {
      entries.push({ type: 'single', row })
    } else if (!seenBatches.has(bid)) {
      seenBatches.add(bid)
      const batchRows = rows.filter(r => r.planting.batchId === bid)
      if (batchRows.length <= 1) {
        entries.push({ type: 'single', row: batchRows[0] ?? row })
      } else {
        const varietySet = new Set(batchRows.map(r => r.planting.variety ?? ''))
        const variety = varietySet.size === 1 ? (batchRows[0].planting.variety ?? null) : null
        entries.push({ type: 'batch', batchId: bid, plant: row.plant, variety, rows: batchRows })
      }
    }
  }

  function toggleBatch(batchId: string) {
    setExpandedBatches(prev => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  const totalDays = 365
  const totalWidth = totalDays * DAY_PX

  useEffect(() => {
    if (!scrollRef.current) return
    const today = new Date()
    if (today.getFullYear() !== calendarYear) return
    const todayOffset = differenceInDays(today, startOfYear(today))
    const targetScroll = todayOffset * DAY_PX - scrollRef.current.clientWidth / 2
    scrollRef.current.scrollLeft = Math.max(0, targetScroll)
  }, [calendarYear])

  const lastFrostOffset = garden?.lastFrostDate ? dayOffset(garden.lastFrostDate, calendarYear) : null
  const firstFrostOffset = garden?.firstFrostDate ? dayOffset(garden.firstFrostDate, calendarYear) : null
  const todayOffset = new Date().getFullYear() === calendarYear
    ? differenceInDays(new Date(), startOfYear(new Date(calendarYear, 0, 1)))
    : null

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(calendarYear, i, 1)
    return { label: format(d, 'MMM'), offset: differenceInDays(d, startOfYear(d)) }
  })

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Crop Calendar</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-indigo-400 inline-block" /> Seeds started</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-green-500 inline-block" /> Growing</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-yellow-400 inline-block" /> Harvest window</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCalendarYear(calendarYear - 1)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold px-2">{calendarYear}</span>
            <button onClick={() => setCalendarYear(calendarYear + 1)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Calendar size={40} strokeWidth={1} />
          <p className="text-sm">No plantings yet. Add plants to your garden beds to see them here.</p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed label column */}
          <div className="shrink-0 border-r border-gray-200" style={{ width: LABEL_W }}>
            <div className="h-8 border-b border-gray-200 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500">Bed / Square</span>
            </div>
            <div ref={labelScrollRef} className="overflow-hidden" style={{ height: `calc(100% - 32px)` }}>
              {entries.map(entry => {
                if (entry.type === 'single') {
                  return (
                    <div key={entry.row.planting.id}
                      className="flex items-center gap-2 px-3 border-b border-gray-50"
                      style={{ height: ROW_H }}>
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: entry.row.plant.color }} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">{entry.row.plant.name}</div>
                        <div className="text-xs text-gray-400 truncate">{entry.row.bed.name} ({entry.row.square.col + 1},{entry.row.square.row + 1})</div>
                      </div>
                    </div>
                  )
                }

                const expanded = expandedBatches.has(entry.batchId)
                const label = entry.variety
                  ? `${entry.plant.name} (${entry.variety})`
                  : entry.plant.name
                const uniqueBeds = [...new Set(entry.rows.map(r => r.bed.name))]
                const bedLabel = uniqueBeds.length === 1 ? uniqueBeds[0] : `${uniqueBeds.length} beds`

                return (
                  <div key={entry.batchId}>
                    <button
                      onClick={() => toggleBatch(entry.batchId)}
                      className="w-full flex items-center gap-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      style={{ height: ROW_H, paddingLeft: 8, paddingRight: 12, borderLeft: `3px solid ${entry.plant.color}` }}
                    >
                      <ChevronRight
                        size={12}
                        className="shrink-0 text-gray-400 transition-transform duration-150"
                        style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: entry.plant.color }} />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-gray-700 truncate">{label}</span>
                          <span className="text-xs font-medium shrink-0 px-1 rounded"
                            style={{ backgroundColor: `${entry.plant.color}22`, color: entry.plant.color }}>
                            ×{entry.rows.length}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{bedLabel}</div>
                      </div>
                    </button>
                    {expanded && entry.rows.map(r => (
                      <div key={r.planting.id}
                        className="flex items-center gap-2 border-b border-gray-50"
                        style={{ height: ROW_H, paddingLeft: 28, paddingRight: 12 }}>
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0 opacity-75" style={{ backgroundColor: r.plant.color }} />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-600 truncate">{r.bed.name} ({r.square.col + 1},{r.square.row + 1})</div>
                          {r.planting.variety && (
                            <div className="text-xs text-gray-400 truncate">{r.planting.variety}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scrollable Gantt area */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin"
            onScroll={(e) => {
              if (labelScrollRef.current) labelScrollRef.current.scrollTop = e.currentTarget.scrollTop
            }}>
            <div style={{ width: totalWidth, minHeight: '100%', position: 'relative' }}>
              {/* Month header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200" style={{ height: 32 }}>
                <div className="relative h-full" style={{ width: totalWidth }}>
                  {months.map((m) => (
                    <span key={m.label} className="absolute top-0 h-full flex items-center text-xs text-gray-500 px-1"
                      style={{ left: m.offset * DAY_PX }}>
                      {m.label}
                    </span>
                  ))}
                  {months.map((m) => (
                    <div key={`line-${m.label}`} className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: m.offset * DAY_PX }} />
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div style={{ position: 'relative' }}>
                {entries.map(entry => {
                  if (entry.type === 'single') {
                    return (
                      <PlantingGanttRow
                        key={entry.row.planting.id}
                        data={entry.row}
                        year={calendarYear}
                        isSelected={selectedPlantingId === entry.row.planting.id}
                        totalWidth={totalWidth}
                        onClick={() => setSelectedPlantingId(entry.row.planting.id)}
                      />
                    )
                  }

                  const expanded = expandedBatches.has(entry.batchId)
                  return (
                    <div key={entry.batchId}>
                      <BatchGanttRow
                        entry={entry}
                        year={calendarYear}
                        totalWidth={totalWidth}
                        isAnySelected={entry.rows.some(r => r.planting.id === selectedPlantingId)}
                        expanded={expanded}
                        onToggle={() => toggleBatch(entry.batchId)}
                      />
                      {expanded && entry.rows.map(r => (
                        <PlantingGanttRow
                          key={r.planting.id}
                          data={r}
                          year={calendarYear}
                          isSelected={selectedPlantingId === r.planting.id}
                          totalWidth={totalWidth}
                          onClick={() => setSelectedPlantingId(r.planting.id)}
                          indent
                        />
                      ))}
                    </div>
                  )
                })}

                {/* Frost lines */}
                {lastFrostOffset !== null && lastFrostOffset >= 0 && lastFrostOffset < 365 && (
                  <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-400 pointer-events-none"
                    style={{ left: lastFrostOffset * DAY_PX }}>
                    <span className="absolute top-1 left-1 text-xs text-blue-500 whitespace-nowrap bg-white px-0.5 rounded">Last frost</span>
                  </div>
                )}
                {firstFrostOffset !== null && firstFrostOffset >= 0 && firstFrostOffset < 365 && (
                  <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-amber-400 pointer-events-none"
                    style={{ left: firstFrostOffset * DAY_PX }}>
                    <span className="absolute top-1 left-1 text-xs text-amber-500 whitespace-nowrap bg-white px-0.5 rounded">First frost</span>
                  </div>
                )}
                {todayOffset !== null && todayOffset >= 0 && todayOffset < 365 && (
                  <div className="absolute top-0 bottom-0 border-l-2 border-red-400 pointer-events-none"
                    style={{ left: todayOffset * DAY_PX }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPlanting && (
        <PlantingDetailModal
          planting={selectedPlanting}
          onClose={() => setSelectedPlantingId(null)}
        />
      )}
    </div>
  )
}

function PlantingGanttRow({ data, year, isSelected, totalWidth, onClick, indent = false }: {
  data: PlantingRowData
  year: number
  isSelected: boolean
  totalWidth: number
  onClick: () => void
  indent?: boolean
}) {
  const { planting, plant } = data
  const yearStart = startOfYear(new Date(year, 0, 1))

  function toOffset(dateStr: string | null): number | null {
    if (!dateStr) return null
    const d = parseISO(dateStr)
    if (!isValid(d)) return null
    return clamp(differenceInDays(d, yearStart) * DAY_PX, 0, totalWidth)
  }

  const seedOffset = toOffset(planting.seedStartDate)
  const sowOffset = toOffset(planting.transplantOrSowDate)
  const harvestOffset = toOffset(planting.actualHarvestDate ?? planting.expectedHarvestDate)
  const harvestEndOffset = harvestOffset !== null ? Math.min(harvestOffset + 14 * DAY_PX, totalWidth) : null
  const hasAnyBar = seedOffset !== null || sowOffset !== null

  return (
    <div
      className={`relative border-b cursor-pointer transition-colors ${
        isSelected ? 'bg-green-50 border-gray-100' : indent ? 'bg-gray-50 border-gray-50 hover:bg-gray-100' : 'border-gray-50 hover:bg-gray-50'
      }`}
      style={{ height: ROW_H }}
      onClick={onClick}
    >
      {[0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334].map((d) => (
        <div key={d} className="absolute top-0 bottom-0 border-l border-gray-100 pointer-events-none"
          style={{ left: d * DAY_PX }} />
      ))}

      {!hasAnyBar && (
        <div className="absolute inset-0 flex items-center" style={{ left: 4 }}>
          <div className="h-2 rounded-full opacity-20" style={{ backgroundColor: plant.color, width: 60 }} />
        </div>
      )}

      {seedOffset !== null && sowOffset !== null && sowOffset > seedOffset && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 rounded-l-full opacity-80"
          style={{ left: seedOffset, width: sowOffset - seedOffset, backgroundColor: '#818cf8' }} />
      )}

      {sowOffset !== null && harvestOffset !== null && harvestOffset > sowOffset && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 opacity-80"
          style={{ left: sowOffset, width: harvestOffset - sowOffset, backgroundColor: plant.color }} />
      )}

      {harvestOffset !== null && harvestEndOffset !== null && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 rounded-r-full opacity-80"
          style={{ left: harvestOffset, width: harvestEndOffset - harvestOffset, backgroundColor: '#fbbf24' }} />
      )}

      {!hasAnyBar && (
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{ left: 10, borderColor: plant.color, backgroundColor: 'white' }} />
      )}
    </div>
  )
}

function BatchGanttRow({ entry, year, totalWidth, isAnySelected, expanded, onToggle }: {
  entry: Extract<CalendarEntry, { type: 'batch' }>
  year: number
  totalWidth: number
  isAnySelected: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const { plant, rows } = entry
  const yearStart = startOfYear(new Date(year, 0, 1))

  function toOffset(dateStr: string | null): number | null {
    if (!dateStr) return null
    const d = parseISO(dateStr)
    if (!isValid(d)) return null
    return clamp(differenceInDays(d, yearStart) * DAY_PX, 0, totalWidth)
  }

  const seedOffsets = rows.map(r => toOffset(r.planting.seedStartDate)).filter((v): v is number => v !== null)
  const sowOffsets = rows.map(r => toOffset(r.planting.transplantOrSowDate)).filter((v): v is number => v !== null)
  const harvestOffsets = rows.map(r => toOffset(r.planting.actualHarvestDate ?? r.planting.expectedHarvestDate)).filter((v): v is number => v !== null)

  const minSeed = seedOffsets.length ? Math.min(...seedOffsets) : null
  const minSow = sowOffsets.length ? Math.min(...sowOffsets) : null
  const maxHarvest = harvestOffsets.length ? Math.max(...harvestOffsets) : null
  const maxHarvestEnd = maxHarvest !== null ? Math.min(maxHarvest + 14 * DAY_PX, totalWidth) : null
  const hasAnyBar = minSeed !== null || minSow !== null

  return (
    <div
      className={`relative border-b border-gray-100 cursor-pointer transition-colors ${isAnySelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
      style={{ height: ROW_H, borderLeft: `3px solid ${plant.color}` }}
      onClick={onToggle}
    >
      {[0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334].map((d) => (
        <div key={d} className="absolute top-0 bottom-0 border-l border-gray-100 pointer-events-none"
          style={{ left: d * DAY_PX }} />
      ))}

      {!hasAnyBar && (
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{ left: 10, borderColor: plant.color, backgroundColor: 'white' }} />
      )}

      {minSeed !== null && minSow !== null && minSow > minSeed && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 rounded-l-full opacity-80"
          style={{ left: minSeed, width: minSow - minSeed, backgroundColor: '#818cf8' }} />
      )}

      {minSow !== null && maxHarvest !== null && maxHarvest > minSow && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 opacity-80"
          style={{ left: minSow, width: maxHarvest - minSow, backgroundColor: plant.color }} />
      )}

      {maxHarvest !== null && maxHarvestEnd !== null && (
        <div className="absolute top-1/2 -translate-y-1/2 h-5 rounded-r-full opacity-80"
          style={{ left: maxHarvest, width: maxHarvestEnd - maxHarvest, backgroundColor: '#fbbf24' }} />
      )}
    </div>
  )
}
