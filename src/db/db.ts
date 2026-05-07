import Dexie, { type Table } from 'dexie'
import type { Garden, Bed, Square, Planting, Plant } from '../types'

class SquareaDB extends Dexie {
  gardens!: Table<Garden>
  beds!: Table<Bed>
  squares!: Table<Square>
  plantings!: Table<Planting>
  plants!: Table<Plant>

  constructor() {
    super('SquareaGardening')
    this.version(1).stores({
      gardens: 'id',
      beds: 'id, gardenId',
      squares: 'id, bedId, [bedId+col+row]',
      plantings: 'id, squareId, plantId, transplantOrSowDate',
      plants: 'id, name',
    })
  }
}

export const db = new SquareaDB()
