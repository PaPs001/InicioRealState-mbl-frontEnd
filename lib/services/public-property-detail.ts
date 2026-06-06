import type { Property } from '@/lib/types'

export type PropertyAppointmentSlot = {
  date: string
  time: string
}

export type MonthDayCell = {
  date: Date
  isCurrentMonth: boolean
}

export const PROPERTY_DETAIL_BOOKED_APPOINTMENTS: PropertyAppointmentSlot[] = [
  { date: '2024-06-15', time: '10:00' },
  { date: '2024-06-15', time: '14:00' },
  { date: '2024-06-16', time: '11:00' },
  { date: '2024-06-18', time: '09:00' },
  { date: '2024-06-18', time: '15:00' },
  { date: '2024-06-18', time: '16:00' },
]

export const PROPERTY_DETAIL_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
export const PROPERTY_DETAIL_MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const PROPERTY_DETAIL_DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export function isAppointmentTimeBooked(appointments: PropertyAppointmentSlot[], date: string, time: string) {
  return appointments.some((appointment) => appointment.date === date && appointment.time === time)
}

export function formatCalendarDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export function getMonthDays(currentMonth: Date): MonthDayCell[] {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: MonthDayCell[] = []

  const firstDayWeekday = firstDay.getDay()
  for (let index = firstDayWeekday - 1; index >= 0; index -= 1) {
    days.push({ date: new Date(year, month, -index), isCurrentMonth: false })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true })
  }

  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day += 1) {
    days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
  }

  return days
}

export function getWeekDays(referenceDate = new Date()) {
  const days: Date[] = []
  const startOfWeek = new Date(referenceDate)
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay())

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)
    days.push(date)
  }

  return days
}

export function isTodayDate(date: Date) {
  return date.toDateString() === new Date().toDateString()
}

export function isPastDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function hasAppointmentsOnDate(appointments: PropertyAppointmentSlot[], date: Date) {
  const dateStr = formatCalendarDate(date)
  return appointments.some((appointment) => appointment.date === dateStr)
}

export function getNextMonth(currentMonth: Date) {
  return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
}

export function getPreviousMonth(currentMonth: Date) {
  return new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
}

export function formatSelectedDateLabel(selectedDate: string) {
  return new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function getPropertyAnalysis(property: Property) {
  const currentValue = property.currentValue || property.price
  const monthlyRentEstimate = currentValue * 0.006
  const commission = currentValue * 0.05
  const notary = currentValue * 0.03
  const isr = Math.max(0, (currentValue - property.price) * 0.15)

  return {
    currentValue,
    value1Year: currentValue * 1.08,
    value3Years: currentValue * Math.pow(1.08, 3),
    value5Years: currentValue * Math.pow(1.08, 5),
    commission,
    notary,
    isr,
    totalCosts: commission + notary + isr,
    monthlyRentEstimate,
    annualRoiLabel: '7.2%',
    yearlyGrowthLabel: '8%',
  }
}
