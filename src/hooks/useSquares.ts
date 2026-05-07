import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useSquares(bedId: string | null) {
  return useLiveQuery(
    () => bedId ? db.squares.where('bedId').equals(bedId).toArray() : [],
    [bedId]
  ) ?? []
}

export function useAllSquaresForBeds(bedIds: string[]) {
  return useLiveQuery(
    () => bedIds.length ? db.squares.where('bedId').anyOf(bedIds).toArray() : [],
    [bedIds.join(',')]
  ) ?? []
}
