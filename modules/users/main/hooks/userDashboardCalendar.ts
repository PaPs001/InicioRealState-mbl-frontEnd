import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import type { AppointmentPreviewItem } from '@/components/userDashboard/types'
import {
  getDefaultAppointmentType,
  mapGoogleDateToAppointment,
} from '@/components/userDashboard/dashboard-formatters'
import {
  disconnectGoogleCalendar,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendarDates,
  getGoogleCalendars,
  getSelectedGoogleCalendars,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar,
} from '@/lib/api'
import type { AppCapabilities } from '@/modules/settings'

type UseDashboardCalendarParams = {
  authToken: string | null
  capabilities?: AppCapabilities
  returnPath?: string
}

export type AppointmentSelectionScreen = 'lead' | 'property' | null
export type AppointmentLeadMode = 'existing' | 'provisional'

export type ProvisionalAppointmentLead = {
  fullName: string
  phone: string
  email: string
}

const DEFAULT_CALENDAR_MESSAGE = 'Conecta Google Calendar para cargar tus citas reales.'

export function useDashboardCalendar({
  authToken,
  capabilities,
  returnPath,
}: UseDashboardCalendarParams) {
  const [calendarAppointments, setCalendarAppointments] = useState<AppointmentPreviewItem[]>([])
  const [calendarMessage, setCalendarMessage] = useState(DEFAULT_CALENDAR_MESSAGE)
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)

  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [googleConnectionStatus, setGoogleConnectionStatus] =
    useState<GoogleCalendarConnectionStatus | null>(null)
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendarOption[]>([])
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState<SelectedGoogleCalendar[]>([])
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)
  const [isCalendarSettingsLoading, setIsCalendarSettingsLoading] = useState(false)
  const [isSavingCalendarSelection, setIsSavingCalendarSelection] = useState(false)

  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false)
  const [appointmentSelectionScreen, setAppointmentSelectionScreen] =
    useState<AppointmentSelectionScreen>(null)
  const [appointmentLeadMode, setAppointmentLeadMode] =
    useState<AppointmentLeadMode>('existing')
  const [provisionalAppointmentLead, setProvisionalAppointmentLead] =
    useState<ProvisionalAppointmentLead>({
      fullName: '',
      phone: '',
      email: '',
    })
  const hasLoadedInitialAppointmentsRef = useRef(false)
  const hasLoadedInitialSettingsRef = useRef(false)

  const loadGoogleCalendarAppointments = useCallback(
    async (options: { sync?: boolean } = {}) => {
      if (!authToken) {
        setCalendarAppointments([])
        setIsGoogleConnected(false)
        setCalendarMessage('Inicia sesion para cargar tus citas reales.')
        return
      }

      setIsCalendarLoading(true)
      try {
        const dates = await getGoogleCalendarDates(authToken, {
          sync: options.sync,
        })
        const appointments = dates
          .map(mapGoogleDateToAppointment)
          .filter(isAppointmentFromTodayOn)
          .sort((current, next) => current.sortTime - next.sortTime)

        setCalendarAppointments(appointments)
        setIsGoogleConnected(true)
        setCalendarMessage(
          appointments.length ? '' : 'No hay citas de Google para esta semana.',
        )
      } catch (error) {
        console.warn('No se pudieron cargar las citas de Google Calendar:', error)
        setCalendarAppointments([])

        try {
          const status = await getGoogleCalendarConnectionStatus(authToken)
          setGoogleConnectionStatus(status)
          setIsGoogleConnected(status.status === 'connected' && status.connected)
          setCalendarMessage(
            status.status === 'requires_reconnect'
              ? 'Reconecta Google Calendar para recuperar tus citas.'
              : DEFAULT_CALENDAR_MESSAGE,
          )
        } catch {
          setIsGoogleConnected(false)
          setCalendarMessage(DEFAULT_CALENDAR_MESSAGE)
        }
      } finally {
        setIsCalendarLoading(false)
      }
    },
    [authToken],
  )

  const loadGoogleCalendarSettings = useCallback(async () => {
    if (!authToken) {
      setGoogleCalendars([])
      setSelectedGoogleCalendars([])
      return
    }

    setIsCalendarSettingsLoading(true)
    try {
      const status = await getGoogleCalendarConnectionStatus(authToken)
      setGoogleConnectionStatus(status)
      setIsGoogleConnected(status.status === 'connected' && status.connected)

      if (status.status === 'requires_reconnect') {
        setGoogleCalendars([])
        setSelectedGoogleCalendars([])
        setCalendarMessage('Reconecta Google Calendar para recuperar tus citas.')
        return
      }

      if (!status.connected) {
        setGoogleCalendars([])
        setSelectedGoogleCalendars([])
        return
      }

      const [calendars, selectedCalendars] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
      ])

      setGoogleCalendars(calendars)
      setSelectedGoogleCalendars(selectedCalendars)
    } catch (error) {
      console.warn('No se pudieron cargar los calendarios:', error)
    } finally {
      setIsCalendarSettingsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken || hasLoadedInitialAppointmentsRef.current) return

    hasLoadedInitialAppointmentsRef.current = true
    console.info('[DashboardCalendar][initial-load]', { service: 'appointments' })
    loadGoogleCalendarAppointments({ sync: true })
  }, [authToken, loadGoogleCalendarAppointments])

  useEffect(() => {
    if (!authToken || hasLoadedInitialSettingsRef.current) return

    hasLoadedInitialSettingsRef.current = true
    console.info('[DashboardCalendar][initial-load]', { service: 'settings' })
    loadGoogleCalendarSettings()
  }, [authToken, loadGoogleCalendarSettings])

  const connectGoogleCalendar = useCallback(async () => {
    if (!authToken || isConnectingCalendar) return

    setIsConnectingCalendar(true)
    try {
      const returnTo = Linking.createURL((returnPath ?? '').replace(/^\//, ''))
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      const result = await WebBrowser.openAuthSessionAsync(response.url, returnTo)

      if (result.type === 'success') {
        await Promise.all([
          loadGoogleCalendarSettings(),
          loadGoogleCalendarAppointments({ sync: true }),
        ])
      }
    } catch (error) {
      console.warn('No se pudo conectar Google Calendar:', error)
    } finally {
      setIsConnectingCalendar(false)
    }
  }, [
    authToken,
    isConnectingCalendar,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    returnPath,
  ])

  const disconnectCalendar = useCallback(() => {
    if (!authToken || isDisconnectingCalendar) return

    Alert.alert(
      'Desconectar Google',
      'Quieres desconectar la cuenta de Google de esta sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnectingCalendar(true)
            try {
              await disconnectGoogleCalendar(authToken)
              setGoogleCalendars([])
              setSelectedGoogleCalendars([])
              setCalendarAppointments([])
              setGoogleConnectionStatus(null)
              setIsGoogleConnected(false)
              setCalendarMessage('Google Calendar fue desconectado.')
            } catch (error) {
              console.warn('No se pudo desconectar Google Calendar:', error)
            } finally {
              setIsDisconnectingCalendar(false)
            }
          },
        },
      ],
    )
  }, [authToken, isDisconnectingCalendar])

  const getCalendarSelection = useCallback(
    (calendarId?: string) =>
      selectedGoogleCalendars.find((calendar) => calendar.calendarId === calendarId),
    [selectedGoogleCalendars],
  )

  const toggleGoogleCalendar = useCallback((calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedGoogleCalendars((current) => {
      const existing = current.find((item) => item.calendarId === calendarId)

      if (existing) {
        return current.map((item) =>
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
          primaryForCreate: current.every((item) => item.primaryForCreate !== true),
        },
      ]
    })
  }, [])

  const markPrimaryGoogleCalendar = useCallback((calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedGoogleCalendars((current) => {
      const next = current.some((item) => item.calendarId === calendarId)
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

      return next.map((item) => ({
        ...item,
        enabled: item.calendarId === calendarId ? true : item.enabled,
        primaryForCreate: item.calendarId === calendarId,
      }))
    })
  }, [])

  const saveGoogleCalendarSelection = useCallback(async () => {
    if (!authToken || isSavingCalendarSelection) return

    setIsSavingCalendarSelection(true)
    try {
      const savedSelection = await saveSelectedGoogleCalendars(authToken, selectedGoogleCalendars)
      setSelectedGoogleCalendars(savedSelection)
      await syncGoogleCalendars(authToken)
      await Promise.all([
        loadGoogleCalendarSettings(),
        loadGoogleCalendarAppointments(),
      ])
      Alert.alert(
        'Calendarios guardados',
        'La seleccion fue guardada y las citas fueron sincronizadas.',
      )
    } catch (error) {
      console.warn('No se pudo guardar la seleccion de calendarios:', error)
    } finally {
      setIsSavingCalendarSelection(false)
    }
  }, [
    authToken,
    isSavingCalendarSelection,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    selectedGoogleCalendars,
  ])

  const changeAppointmentLeadMode = useCallback((mode: AppointmentLeadMode) => {
    setAppointmentLeadMode(mode)
    setAppointmentSelectionScreen(null)
  }, [])

  const updateProvisionalAppointmentLead = useCallback(
    (field: keyof ProvisionalAppointmentLead, value: string) => {
      setProvisionalAppointmentLead((currentLead) => ({
        ...currentLead,
        [field]: value,
      }))
    },
    [],
  )

  const visibleCalendarAppointments = useMemo(
    () =>
      calendarAppointments.filter((appointment) =>
        canShowAppointment(appointment, capabilities),
      ),
    [calendarAppointments, capabilities],
  )

  const enabledSelectedCalendars = useMemo(
    () => selectedGoogleCalendars.filter((calendar) => calendar.enabled !== false),
    [selectedGoogleCalendars],
  )

  const needsGoogleReconnect = googleConnectionStatus?.status === 'requires_reconnect'

  return {
    appointmentLeadMode,
    appointmentSelectionScreen,
    calendarAppointments,
    calendarMessage,
    changeAppointmentLeadMode,
    connectGoogleCalendar,
    disconnectCalendar,
    enabledSelectedCalendars,
    getCalendarSelection,
    googleCalendars,
    googleConnectionStatus,
    isAppointmentModalVisible,
    isCalendarLoading,
    isCalendarSettingsLoading,
    isConnectingCalendar,
    isDisconnectingCalendar,
    isGoogleConnected,
    isSavingCalendarSelection,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    markPrimaryGoogleCalendar,
    needsGoogleReconnect,
    provisionalAppointmentLead,
    saveGoogleCalendarSelection,
    selectedGoogleCalendars,
    setAppointmentSelectionScreen,
    setIsAppointmentModalVisible,
    toggleGoogleCalendar,
    updateProvisionalAppointmentLead,
    visibleCalendarAppointments,
  }
}

function isAppointmentFromTodayOn(appointment: AppointmentPreviewItem) {
  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime()

  return (
    appointment.sortTime !== Number.MAX_SAFE_INTEGER &&
    appointment.sortTime >= startOfToday
  )
}

function canShowAppointment(
  appointment: AppointmentPreviewItem,
  capabilities?: AppCapabilities,
) {
  if (!capabilities) return true

  const type = appointment.appointmentType
  if (type === 'renta') return capabilities.canViewRentals
  if (type === 'venta') return capabilities.canViewSales

  return true
}
