import type { Bed } from '../types'

export const CELL_PX = 48

export function snapToFoot(pointerPx: number, scale: number): number {
  return Math.round(pointerPx / (CELL_PX * scale))
}

export function worldToPixel(feet: number): number {
  return feet * CELL_PX
}

export function pixelToWorld(px: number, scale: number): number {
  return px / (CELL_PX * scale)
}

export function bedsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return !(ax >= bx + bw || ax + aw <= bx || ay >= by + bh || ay + ah <= by)
}

export function wouldOverlapExisting(
  x: number, y: number, w: number, h: number,
  beds: Bed[],
  excludeId?: string
): boolean {
  return beds
    .filter((b) => b.id !== excludeId)
    .some((b) => bedsOverlap(x, y, w, h, b.x, b.y, b.widthFt, b.heightFt))
}
