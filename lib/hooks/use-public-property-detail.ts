import { Alert } from 'react-native'
import { useState } from 'react'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { useAppTheme } from './useAppTheme'
import {
  PROPERTY_DETAIL_BOOKED_APPOINTMENTS,
  PROPERTY_DETAIL_DAY_NAMES,
  PROPERTY_DETAIL_MONTH_NAMES,
  PROPERTY_DETAIL_TIME_SLOTS,
  formatCalendarDate,
  formatSelectedDateLabel,
  getMonthDays,
  getNextMonth,
  getPreviousMonth,
  getPropertyAnalysis,
  getWeekDays,
  hasAppointmentsOnDate,
  isAppointmentTimeBooked,
  isPastDate,
  isTodayDate,
} from '@/lib/services/public-property-detail'

export type PropertyDetailTab = 'info' | 'analysis' | 'calendar'
export type CalendarViewMode = 'month' | 'week' | 'day'

export function usePublicPropertyDetail(id?: string) {
  const { theme, isTenant } = useAppTheme()
  const { isClient, isAgent, isAdmin } = useSessionDomain()
  const { getPropertyById, isFavorite, toggleFavorite } = usePropertyDomain()
  const [activeTab, setActiveTab] = useState<PropertyDetailTab>('info')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('week')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const property = getPropertyById(id || '')
  const favorite = property ? isFavorite(property.id) : false
  const isForSale = property?.status === 'for_sale'
  const isForRent = property?.status === 'for_rent'
  const headerSurfaceColor = isTenant ? theme.surfaceLight || theme.surface : theme.surface
  const propertyAnalysis = property ? getPropertyAnalysis(property) : null

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora')
      return
    }

    if (isAppointmentTimeBooked(PROPERTY_DETAIL_BOOKED_APPOINTMENTS, selectedDate, selectedTime)) {
      Alert.alert('Horario no disponible', 'Este horario ya esta ocupado, por favor selecciona otro')
      return
    }

    Alert.alert('Cita Agendada', `Tu cita ha sido agendada para el ${selectedDate} a las ${selectedTime}`)
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
  }

  return {
    theme,
    isTenant,
    isClient,
    isAgent,
    isAdmin,
    property,
    favorite,
    isForSale,
    isForRent,
    headerSurfaceColor,
    propertyAnalysis,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    notes,
    setNotes,
    calendarView,
    setCalendarView,
    currentMonth,
    favoriteToggle: toggleFavorite,
    handleScheduleAppointment,
    monthDays: getMonthDays(currentMonth),
    weekDays: getWeekDays(),
    dayNames: PROPERTY_DETAIL_DAY_NAMES,
    monthNames: PROPERTY_DETAIL_MONTH_NAMES,
    timeSlots: PROPERTY_DETAIL_TIME_SLOTS,
    selectedDateLabel: selectedDate ? formatSelectedDateLabel(selectedDate) : '',
    isTimeBooked: (date: string, time: string) =>
      isAppointmentTimeBooked(PROPERTY_DETAIL_BOOKED_APPOINTMENTS, date, time),
    isToday: isTodayDate,
    isPast: isPastDate,
    hasAppointments: (date: Date) => hasAppointmentsOnDate(PROPERTY_DETAIL_BOOKED_APPOINTMENTS, date),
    formatDateStr: formatCalendarDate,
    nextMonth: () => setCurrentMonth((previous) => getNextMonth(previous)),
    prevMonth: () => setCurrentMonth((previous) => getPreviousMonth(previous)),
  }
}

export default usePublicPropertyDetail
