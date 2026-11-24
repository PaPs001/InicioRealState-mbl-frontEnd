import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import {
  disconnectGoogleCalendar,
  getGoogleCalendarAuthUrl,
} from '@/lib/api'
import { useCalendarData } from '@/modules/users/date/context/CalendarDataContext'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'

type UseGoogleCalendarSettingsOptions = {
  authToken?: string | null
  returnPath: string
}

export function useGoogleCalendarSettings({
  authToken,
  returnPath,
}: UseGoogleCalendarSettingsOptions) {
  const { isCoordinator } = useSessionDomain()
  const {
    calendars,
    selectedCalendars,
    connectionStatus,
    isSettingsLoading,
    isSavingSelection,
    assignCalendarType,
    loadSettings,
    saveCalendarSelection,
    toggleCalendar,
  } = useCalendarData()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const reload = useCallback(async () => {
    if (!authToken || !isCoordinator) return
    await loadSettings()
  }, [authToken, isCoordinator, loadSettings])

  useEffect(() => {
    void reload().catch(error => {
      console.warn('No se pudo cargar la configuracion global de Google Calendar:', error)
    })
  }, [reload])

  const saveSelection = useCallback(async () => {
    if (!authToken || !isCoordinator || isSavingSelection) return

    try {
      await saveCalendarSelection()
      Alert.alert(
        'Calendarios guardados',
        'La seleccion de calendarios fue guardada.',
      )
    } catch (error) {
      console.warn('No se pudo guardar la seleccion de calendarios:', error)
    }
  }, [authToken, isCoordinator, isSavingSelection, saveCalendarSelection])

  const connect = useCallback(async () => {
    if (!authToken || !isCoordinator || isConnecting) return

    setIsConnecting(true)
    try {
      const returnTo = Linking.createURL(returnPath.replace(/^\//, ''))
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      const result = await WebBrowser.openAuthSessionAsync(response.url, returnTo)
      if (result.type === 'success') await loadSettings()
    } catch (error) {
      console.warn('No se pudo conectar Google Calendar:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [authToken, isCoordinator, isConnecting, loadSettings, returnPath])

  const disconnect = useCallback(() => {
    if (!authToken || !isCoordinator || isDisconnecting) return

    Alert.alert(
      'Desconectar Google',
      'Quieres desconectar la cuenta global de Google Calendar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnecting(true)
            try {
              await disconnectGoogleCalendar(authToken)
              await loadSettings()
            } catch (error) {
              console.warn('No se pudo desconectar Google Calendar:', error)
            } finally {
              setIsDisconnecting(false)
            }
          },
        },
      ],
    )
  }, [authToken, isCoordinator, isDisconnecting, loadSettings])

  const isConnected = connectionStatus?.connected === true
  const needsReconnect = connectionStatus?.status === 'requires_reconnect'

  return useMemo(() => ({
    calendars,
    selectedCalendars,
    isConnected,
    needsReconnect,
    isLoading: isSettingsLoading,
    isConnecting,
    isDisconnecting,
    isSaving: isSavingSelection,
    reload,
    toggleCalendar,
    saveSelection,
    connect,
    disconnect,
    assignCalendarType,
  }), [
    assignCalendarType,
    calendars,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isDisconnecting,
    isSavingSelection,
    isSettingsLoading,
    reload,
    needsReconnect,
    saveSelection,
    selectedCalendars,
    toggleCalendar,
  ])
}
