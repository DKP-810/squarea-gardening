import { v4 as uuidv4 } from 'uuid'
import { db } from './db'
import { DEFAULT_PLANTS } from '../data/defaultPlants'

let seeding = false

async function dedupDefaultPlants(): Promise<void> {
  const all = await db.plants.toArray()
  const seen = new Map<string, string>()
  const toDelete: string[] = []
  const remapped = new Map<string, string>()

  for (const p of all) {
    if (!p.isCustom) {
      if (seen.has(p.name)) {
        toDelete.push(p.id)
        remapped.set(p.id, seen.get(p.name)!)
      } else {
        seen.set(p.name, p.id)
      }
    }
  }

  if (toDelete.length === 0) return

  if (remapped.size > 0) {
    const plantings = await db.plantings.toArray()
    await Promise.all(
      plantings
        .filter((pl) => remapped.has(pl.plantId))
        .map((pl) => db.plantings.update(pl.id, { plantId: remapped.get(pl.plantId)! }))
    )
  }

  await db.plants.bulkDelete(toDelete)
}

// Sync footprintFt and spacingDensity for existing default plants whenever
// defaultPlants.ts changes — without touching user-created (isCustom) plants.
async function migrateDefaultPlants(): Promise<void> {
  const defaultByName = new Map(DEFAULT_PLANTS.map((p) => [p.name, p]))
  const all = await db.plants.toArray()

  await Promise.all(
    all
      .filter((p) => !p.isCustom)
      .flatMap((p) => {
        const def = defaultByName.get(p.name)
        if (!def) return []

        const changes: Partial<typeof p> = {}
        if (def.footprintFt !== p.footprintFt) changes.footprintFt = def.footprintFt
        if (def.spacingDensity !== p.spacingDensity) changes.spacingDensity = def.spacingDensity

        if (Object.keys(changes).length === 0) return []
        return [db.plants.update(p.id, changes)]
      })
  )
}

export async function seedPlants(): Promise<void> {
  if (seeding) return
  seeding = true

  await dedupDefaultPlants()
  await migrateDefaultPlants()

  const count = await db.plants.count()
  if (count > 0) return

  const plants = DEFAULT_PLANTS.map((p) => ({ ...p, id: uuidv4(), isCustom: false }))
  await db.plants.bulkAdd(plants)
}
