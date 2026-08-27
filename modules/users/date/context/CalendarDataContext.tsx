import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { getDefaultAppointmentType } from '@/components/userDashboard/dashboard-formatters'
import { useAuth } from '@/contexts/AuthContext'
import {
  deleteGoogleCalendarDate,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendarDates,
  getGoogleCalendars,
  getSelectedGoogleCalendars,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  updateGoogleCalendarDate,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarDate,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar,
} from '@/lib/api'
import type { AppointmentType, UpdateGoogleCalendarDatePayload } from '@/lib/api/endpoints/dates'

type LoadAppointmentsOptions = {
  sync?: boolean
}

type CalendarDataContextValue = {
  appointments: GoogleCalendarDate[]
  calendars: GoogleCalendarOption[]
  selectedCalendars: SelectedGoogleCalendar[]
  connectionStatus: GoogleCalendarConnectionStatus | null
  isAppointmentsLoading: boolean
  isSettingsLoading: boolean
  isSavingSelection: boolean
  appointmentsError: string | null
  addAppointment: (appointment: GoogleCalendarDate) => void
  assignCalendarType: (calendar: GoogleCalendarOption, appointmentType: AppointmentType) => void
  clearCalendarData: () => void
  loadAppointments: (options?: LoadAppointmentsOptions) => Promise<GoogleCalendarDate[]>
  loadSettings: () => Promise<void>
  markPrimaryCalendar: (calendar: GoogleCalendarOption) => void
  saveCalendarSelection: () => Promise<void>
  toggleCalendar: (calendar: GoogleCalendarOption) => void
  updateAppointment: (
    dateId: string,
    payload: UpdateGoogleCalendarDatePayload
  ) => Promise<GoogleCalendarDate>
  deleteAppointment: (
    dateId: string,
  ) => Promise<void>
}
 
const CalendarDataContext = createContext<CalendarDataContextValue | null>(null)

function getAppointmentIdentity(appointment: GoogleCalendarDate) {
  return appointment._id
    || appointment.googleEventId
    || [
      appointment.googleCalendarId,
      appointment.startDateTime,
      appointment.title,
    ].filter(Boolean).join('|')
    || null
}

function mergeAppointments(
  current: GoogleCalendarDate[],
  incoming: GoogleCalendarDate[],
) {
  const merged = new Map<string, GoogleCalendarDate>()
  const withoutIdentity: GoogleCalendarDate[] = []

  for (const appointment of [...current, ...incoming]) {
    const identity = getAppointmentIdentity(appointment)
    if (identity) merged.set(identity, appointment)
    else withoutIdentity.push(appointment)
  }

  return [...merged.values(), ...withoutIdentity]
}

export function CalendarDataProvider({ children }: PropsWithChildren) {
  const { authToken } = useAuth()
  const loadedTokenRef = useRef<string | null>(null)
  const [appointments, setAppointments] = useState<GoogleCalendarDate[]>([])
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<SelectedGoogleCalendar[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<GoogleCalendarConnectionStatus | null>(null)
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(false)
  const [isSavingSelection, setIsSavingSelection] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)

  const clearCalendarData = useCallback(() => {
    setAppointments([])
    setCalendars([])
    setSelectedCalendars([])
    setConnectionStatus(null)
    setAppointmentsError(null)
  }, [])

  const loadAppointments = useCallback(async (
    options: LoadAppointmentsOptions = {},
  ) => {
    if (!authToken) {
      setAppointments([])
      return []
    }

    setIsAppointmentsLoading(true)
    setAppointmentsError(null)
    try {
      const dates = await getGoogleCalendarDates(authToken, {
        sync: options.sync,
      })
      setAppointments(dates)
      return dates
    } catch (error) {
      setAppointmentsError('No se pudieron cargar las citas.')
      throw error
    } finally {
      setIsAppointmentsLoading(false)
    }
  }, [authToken])

  const loadSettings = useCallback(async () => {
    if (!authToken) {
      setCalendars([])
      setSelectedCalendars([])
      setConnectionStatus(null)
      return
    }

    setIsSettingsLoading(true)
    try {
      const status = await getGoogleCalendarConnectionStatus(authToken)
      setConnectionStatus(status)

      if (!status.connected || status.status === 'requires_reconnect') {
        setCalendars([])
        setSelectedCalendars([])
        return
      }

      const [availableCalendars, savedCalendars] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
      ])
      setCalendars(availableCalendars)
      setSelectedCalendars(savedCalendars)
    } finally {
      setIsSettingsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken) {
      loadedTokenRef.current = null
      clearCalendarData()
      return
    }
    if (loadedTokenRef.current === authToken) return
    loadedTokenRef.current = authToken

    console.info('[CalendarDataProvider][initial-load]')
    void Promise.all([
      loadAppointments().catch(error => {
        console.warn('No se pudieron cargar las citas:', error)
      }),
      loadSettings().catch(error => {
        console.warn('No se pudieron cargar los calendarios:', error)
      }),
    ])
  }, [authToken, clearCalendarData, loadAppointments, loadSettings])

  const addAppointment = useCallback((appointment: GoogleCalendarDate) => {
    setAppointments(current => mergeAppointments(current, [appointment]))
  }, [])

  const toggleCalendar = useCallback((calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedCalendars(current => {
      const existing = current.find(item => item.calendarId === calendarId)
      if (existing) {
        return current.map(item =>
          item.calendarId === calendarId
            ? { ...item, enabled: item.enabled === false }
            : item,
        )
      }

      return [
        ...current,
        {
          calendarId,
          summary: calendar.summary ?? '',
          enabled: true,
          appointmentType: getDefaultAppointmentType(calendar.summary),
          primaryForCreate: current.every(item => item.primaryForCreate !== true),
        },
      ]
    })
  }, [])

  const assignCalendarType = useCallback((
    calendar: GoogleCalendarOption,
    appointmentType: AppointmentType,
  ) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedCalendars(current => {
      const selectedCalendar = current.find(item => item.calendarId === calendarId)
      if (selectedCalendar?.appointmentType === appointmentType) {
        return current.map(item =>
          item.calendarId === calendarId
            ? { ...item, appointmentType: 'general' as const }
            : item,
        )
      }

      const withoutPreviousSelection = current.map(item =>
        item.appointmentType === appointmentType
          ? { ...item, appointmentType: 'general' as const }
          : item,
      )
      const existing = withoutPreviousSelection.find(item => item.calendarId === calendarId)

      if (existing) {
        return withoutPreviousSelection.map(item =>
          item.calendarId === calendarId
            ? { ...item, enabled: true, appointmentType }
            : item,
        )
      }

      return [
        ...withoutPreviousSelection,
        {
          calendarId,
          summary: calendar.summary ?? '',
          enabled: true,
          appointmentType,
        },
      ]
    })
  }, [])

  const markPrimaryCalendar = useCallback((calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedCalendars(current => {
      const next = current.some(item => item.calendarId === calendarId)
        ? current
        : [
            ...current,
            {
              calendarId,
              summary: calendar.summary ?? '',
              enabled: true,
              appointmentType: getDefaultAppointmentType(calendar.summary),
            },
          ]

      return next.map(item => ({
        ...item,
        enabled: item.calendarId === calendarId ? true : item.enabled,
        primaryForCreate: item.calendarId === calendarId,
      }))
    })
  }, [])

  const saveCalendarSelection = useCallback(async () => {
    if (!authToken || isSavingSelection) return

    setIsSavingSelection(true)
    try {
      const submittedCalendars = selectedCalendars
      const savedCalendars = await saveSelectedGoogleCalendars(authToken, submittedCalendars)
      const savedById = new Map(savedCalendars.map(calendar => [calendar.calendarId, calendar]))

      setSelectedCalendars(submittedCalendars.map(calendar => ({
        ...calendar,
        ...savedById.get(calendar.calendarId),
        appointmentType: calendar.appointmentType,
        primaryForCreate: calendar.primaryForCreate,
      })))

      await syncGoogleCalendars(authToken)
      await Promise.all([loadSettings(), loadAppointments()])
    } finally {
      setIsSavingSelection(false)
    }
  }, [authToken, isSavingSelection, loadAppointments, loadSettings, selectedCalendars])

  const updateAppointment = useCallback(
    async(
      dateId: string,
      payload: UpdateGoogleCalendarDatePayload
    ) => {
      if(!authToken){
        throw new Error('No hay una sesion activa')
      }

      const updateAppointment = await updateGoogleCalendarDate(
        authToken,
        dateId,
        payload,
      )

      setAppointments(current => current.map(appointment => appointment._id === dateId ?
        updateAppointment 
        : appointment
      ))

      return updateAppointment
    }, [authToken]
  )

  const deleteAppointment = useCallback(
    async (dateId: string) => {
      if(!authToken){
        throw new Error('No hay una sesion activa')
      }
      
      await deleteGoogleCalendarDate(
        authToken,
        dateId,
      )

      setAppointments(current => current.filter(
        appointment => appointment._id !== dateId,
      ))
    }, [authToken],
  )

  const value = useMemo<CalendarDataContextValue>(() => ({
    appointments,
    calendars,
    selectedCalendars,
    connectionStatus,
    isAppointmentsLoading,
    isSettingsLoading,
    isSavingSelection,
    appointmentsError,
    addAppointment,
    assignCalendarType,
    clearCalendarData,
    loadAppointments,
    loadSettings,
    markPrimaryCalendar,
    saveCalendarSelection,
    toggleCalendar,
    updateAppointment,
    deleteAppointment
  }), [
    addAppointment,
    appointments,
    appointmentsError,
    assignCalendarType,
    calendars,
    clearCalendarData,
    connectionStatus,
    isAppointmentsLoading,
    isSavingSelection,
    isSettingsLoading,
    loadAppointments,
    loadSettings,
    markPrimaryCalendar,
    saveCalendarSelection,
    selectedCalendars,
    toggleCalendar,
    updateAppointment,
    deleteAppointment
  ])

  return (
    <CalendarDataContext.Provider value={value}>
      {children}
    </CalendarDataContext.Provider>
  )
}

export function useCalendarData() {
  const value = useContext(CalendarDataContext)
  if (!value) {
    throw new Error('useCalendarData debe usarse dentro de CalendarDataProvider')
  }
  return value
}
