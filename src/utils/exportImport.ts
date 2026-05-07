import { db } from '../db/db'
import type { ExportEnvelope } from '../types'

export async function exportGarden(): Promise<void> {
  const [gardens, beds, squares, plantings, plants] = await Promise.all([
    db.gardens.toArray(),
    db.beds.toArray(),
    db.squares.toArray(),
    db.plantings.toArray(),
    db.plants.toArray(),
  ])
  const envelope: ExportEnvelope = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    gardens, beds, squares, plantings, plants,
  }
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `squarea-garden-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importGarden(file: File): Promise<void> {
  const text = await file.text()
  const envelope: ExportEnvelope = JSON.parse(text)
  if (envelope.schemaVersion !== 1) {
    throw new Error(`Unsupported schema version: ${envelope.schemaVersion}`)
  }
  await db.transaction('rw', [db.gardens, db.beds, db.squares, db.plantings, db.plants], async () => {
    await db.gardens.clear()
    await db.beds.clear()
    await db.squares.clear()
    await db.plantings.clear()
    await db.plants.clear()
    await db.gardens.bulkAdd(envelope.gardens)
    await db.beds.bulkAdd(envelope.beds)
    await db.squares.bulkAdd(envelope.squares)
    await db.plantings.bulkAdd(envelope.plantings)
    await db.plants.bulkAdd(envelope.plants)
  })
}
