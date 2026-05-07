import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function usePlantings(squareId: string | null) {
  return useLiveQuery(
    () => squareId ? db.plantings.where('squareId').equals(squareId).toArray() : [],
    [squareId]
  ) ?? []
}

export function useAllPlantingsForSquares(squareIds: string[]) {
  return useLiveQuery(
    () => squareIds.length ? db.plantings.where('squareId').anyOf(squareIds).toArray() : [],
    [squareIds.join(',')]
  ) ?? []
}
