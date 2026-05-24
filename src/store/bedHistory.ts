import { db } from '../db/db'
import type { Bed, Square, Planting } from '../types'

type BedHistoryEntry =
  | { type: 'add-bed'; bed: Bed }
  | { type: 'delete-bed'; bed: Bed; squares: Square[]; plantings: Planting[] }
  | { type: 'edit-bed'; bedId: string; before: Partial<Bed>; after: Partial<Bed> }

const undoStack: BedHistoryEntry[] = []
const redoStack: BedHistoryEntry[] = []
const MAX_HISTORY = 20

export function pushBedAction(entry: BedHistoryEntry): void {
  undoStack.push(entry)
  redoStack.length = 0
  if (undoStack.length > MAX_HISTORY) undoStack.shift()
}

// Returns the restored bed's id when undoing a delete (so caller can re-select it), otherwise null.
export async function undoBed(): Promise<string | null> {
  const entry = undoStack.pop()
  if (!entry) return null

  if (entry.type === 'add-bed') {
    const squares = await db.squares.where('bedId').equals(entry.bed.id).toArray()
    const squareIds = squares.map(s => s.id)
    if (squareIds.length) await db.plantings.where('squareId').anyOf(squareIds).delete()
    await db.squares.where('bedId').equals(entry.bed.id).delete()
    await db.beds.delete(entry.bed.id)
  } else if (entry.type === 'delete-bed') {
    await db.beds.add(entry.bed)
    if (entry.squares.length) await db.squares.bulkAdd(entry.squares)
    if (entry.plantings.length) await db.plantings.bulkAdd(entry.plantings)
  } else if (entry.type === 'edit-bed') {
    await db.beds.update(entry.bedId, entry.before)
  }

  redoStack.push(entry)
  return entry.type === 'delete-bed' ? entry.bed.id : null
}

export async function redoBed(): Promise<void> {
  const entry = redoStack.pop()
  if (!entry) return

  if (entry.type === 'add-bed') {
    await db.beds.add(entry.bed)
  } else if (entry.type === 'delete-bed') {
    const squareIds = entry.squares.map(s => s.id)
    if (squareIds.length) await db.plantings.where('squareId').anyOf(squareIds).delete()
    await db.squares.bulkDelete(entry.squares.map(s => s.id))
    await db.beds.delete(entry.bed.id)
  } else if (entry.type === 'edit-bed') {
    await db.beds.update(entry.bedId, entry.after)
  }

  undoStack.push(entry)
}
