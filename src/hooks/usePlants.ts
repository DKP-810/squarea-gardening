import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function usePlants() {
  return useLiveQuery(() => db.plants.orderBy('name').toArray(), []) ?? []
}

export function usePlant(id: string | null) {
  return useLiveQuery(() => (id ? db.plants.get(id) : undefined), [id])
}
