import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { getDefaultAppointmentType } from '@/components/userDashboard/dashboard-formatters'
import {
  disconnectGoogleCalendar,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendars,
  getSelectedGoogleCalendars,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar,
} from '@/lib/api'

type UseGoogleCalendarSettingsOptions = {
  authToken?: string | null
  returnPath: string
}

export function useGoogleCalendarSettings({
  authToken,
  returnPath,
}: UseGoogleCalendarSettingsOptions) {
  const [connectionStatus, setConnectionStatus] =
    useState<GoogleCalendarConnectionStatus | null>(null)
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<SelectedGoogleCalendar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const clearCalendars = useCallback(() => {
    setCalendars([])
    setSelectedCalendars([])
  }, [])

  const reload = useCallback(async () => {
    if (!authToken) {
      setConnectionStatus(null)
      clearCalendars()
      return
    }

    setIsLoading(true)
    try {
      const status = await getGoogleCalendarConnectionStatus(authToken)
      setConnectionStatus(status)

      if (!status.connected || status.status === 'requires_reconnect') {
        clearCalendars()
        return
      }

      const [availableCalendars, savedCalendars] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
      ])
      setCalendars(availableCalendars)
      setSelectedCalendars(savedCalendars)
    } catch (error) {
      console.warn('No se pudieron cargar los calendarios:', error)
    } finally {
      setIsLoading(false)
    }
  }, [authToken, clearCalendars])

  useEffect(() => {
    void reload()
  }, [reload])

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

  const saveSelection = useCallback(async () => {
    if (!authToken || isSaving) return

    setIsSaving(true)
    try {
      const savedCalendars = await saveSelectedGoogleCalendars(authToken, selectedCalendars)
      setSelectedCalendars(savedCalendars)
      await syncGoogleCalendars(authToken)
      await reload()
      Alert.alert(
        'Calendarios guardados',
        'La selección fue guardada y los calendarios fueron sincronizados.',
      )
    } catch (error) {
      console.warn('No se pudo guardar la selección de calendarios:', error)
    } finally {
      setIsSaving(false)
    }
  }, [authToken, isSaving, reload, selectedCalendars])

  const connect = useCallback(async () => {
    if (!authToken || isConnecting) return

    setIsConnecting(true)
    try {
      const returnTo = Linking.createURL(returnPath.replace(/^\//, ''))
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      const result = await WebBrowser.openAuthSessionAsync(response.url, returnTo)
      if (result.type === 'success') await reload()
    } catch (error) {
      console.warn('No se pudo conectar Google Calendar:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [authToken, isConnecting, reload, returnPath])

  const disconnect = useCallback(() => {
    if (!authToken || isDisconnecting) return

    Alert.alert(
      'Desconectar Google',
      '¿Quieres desconectar la cuenta de Google de esta sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnecting(true)
            try {
              await disconnectGoogleCalendar(authToken)
              clearCalendars()
              setConnectionStatus(null)
            } catch (error) {
              console.warn('No se pudo desconectar Google Calendar:', error)
            } finally {
              setIsDisconnecting(false)
            }
          },
        },
      ],
    )
  }, [authToken, clearCalendars, isDisconnecting])

  const isConnected = connectionStatus?.connected === true
  const needsReconnect = connectionStatus?.status === 'requires_reconnect'

  return useMemo(
    () => ({
      calendars,
      selectedCalendars,
      isConnected,
      needsReconnect,
      isLoading,
      isConnecting,
      isDisconnecting,
      isSaving,
      reload,
      toggleCalendar,
      saveSelection,
      connect,
      disconnect,
    }),
    [
      calendars,
      connect,
      disconnect,
      isConnected,
      isConnecting,
      isDisconnecting,
      isLoading,
      isSaving,
      needsReconnect,
      reload,
      saveSelection,
      selectedCalendars,
      toggleCalendar,
    ],
  )
}
