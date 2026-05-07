import { v4 as uuidv4 } from 'uuid'
import { db } from './db'
import { DEFAULT_PLANTS } from '../data/defaultPlants'

export async function seedPlants(): Promise<void> {
  const count = await db.plants.count()
  if (count > 0) return
  const plants = DEFAULT_PLANTS.map((p) => ({ ...p, id: uuidv4(), isCustom: false }))
  await db.plants.bulkAdd(plants)
}
