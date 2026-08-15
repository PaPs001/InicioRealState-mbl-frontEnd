export const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export interface CalendarCell {
  key: string
  day: number | null
  date: Date | null
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function isSameDate(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

export function createCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1)
  const initialEmptyCells = (firstDayOfMonth.getDay() + 6) % 7

  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: CalendarCell[] = []

  for (let index = 0; index < initialEmptyCells; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      day: null,
      date: null,
    })
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day)

    cells.push({
      key: formatDateKey(date),
      day,
      date,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `empty-end-${cells.length}`,
      day: null,
      date: null,
    })
  }

  return cells
}

export function getSafeDate(value: string): Date {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}
