import { useCallback, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import {
  disconnectGoogleCalendar,
  getGoogleCalendarAuthUrl,
} from '@/lib/api'
import { useCalendarData } from '@/modules/users/date/context/CalendarDataContext'

type UseGoogleCalendarSettingsOptions = {
  authToken?: string | null
  returnPath: string
}

export function useGoogleCalendarSettings({
  authToken,
  returnPath,
}: UseGoogleCalendarSettingsOptions) {
  const {
    calendars,
    selectedCalendars,
    connectionStatus,
    isSettingsLoading,
    isSavingSelection,
    assignCalendarType,
    clearCalendarData,
    loadSettings,
    saveCalendarSelection,
    toggleCalendar,
  } = useCalendarData()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const saveSelection = useCallback(async () => {
    if (!authToken || isSavingSelection) return

    try {
      await saveCalendarSelection()
      Alert.alert(
        'Calendarios guardados',
        'La seleccion fue guardada y los calendarios fueron sincronizados.',
      )
    } catch (error) {
      console.warn('No se pudo guardar la seleccion de calendarios:', error)
    }
  }, [authToken, isSavingSelection, saveCalendarSelection])

  const connect = useCallback(async () => {
    if (!authToken || isConnecting) return

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
  }, [authToken, isConnecting, loadSettings, returnPath])

  const disconnect = useCallback(() => {
    if (!authToken || isDisconnecting) return

    Alert.alert(
      'Desconectar Google',
      'Quieres desconectar la cuenta de Google de esta sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnecting(true)
            try {
              await disconnectGoogleCalendar(authToken)
              clearCalendarData()
            } catch (error) {
              console.warn('No se pudo desconectar Google Calendar:', error)
            } finally {
              setIsDisconnecting(false)
            }
          },
        },
      ],
    )
  }, [authToken, clearCalendarData, isDisconnecting])

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
    reload: loadSettings,
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
    loadSettings,
    needsReconnect,
    saveSelection,
    selectedCalendars,
    toggleCalendar,
  ])
}
