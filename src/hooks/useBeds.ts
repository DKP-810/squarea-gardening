import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useAppStore } from '../store'

export function useBeds() {
  const gardenId = useAppStore((s) => s.activeGardenId)
  return useLiveQuery(
    () => gardenId ? db.beds.where('gardenId').equals(gardenId).toArray() : [],
    [gardenId]
  ) ?? []
}
