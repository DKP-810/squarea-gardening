import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useAppStore } from '../store'

export function useActiveGarden() {
  const id = useAppStore((s) => s.activeGardenId)
  return useLiveQuery(() => (id ? db.gardens.get(id) : undefined), [id])
}

export function useAllGardens() {
  return useLiveQuery(() => db.gardens.toArray(), [])
}
