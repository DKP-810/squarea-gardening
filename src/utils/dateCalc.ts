import { addDays, addWeeks, parseISO, isValid, format } from 'date-fns'

export function calcExpectedHarvest(transplantOrSowDate: string | null, daysToHarvest: number): string | null {
  if (!transplantOrSowDate) return null
  const d = parseISO(transplantOrSowDate)
  if (!isValid(d)) return null
  return format(addDays(d, daysToHarvest), 'yyyy-MM-dd')
}

export function calcSeedStartDate(lastFrostDate: string | null, indoorStartWeeks: number | null): string | null {
  if (!lastFrostDate || indoorStartWeeks === null) return null
  const d = parseISO(lastFrostDate)
  if (!isValid(d)) return null
  return format(addWeeks(d, -indoorStartWeeks), 'yyyy-MM-dd')
}

export function calcTransplantDate(lastFrostDate: string | null, transplantWeeksAfterFrost: number): string | null {
  if (!lastFrostDate) return null
  const d = parseISO(lastFrostDate)
  if (!isValid(d)) return null
  return format(addWeeks(d, transplantWeeksAfterFrost), 'yyyy-MM-dd')
}

/** Format a yyyy-MM-dd string for display (e.g. "Aug 15, 2026"). Returns '—' for null/invalid. */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—'
}
