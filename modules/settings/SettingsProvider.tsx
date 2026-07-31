import React, {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useSessionDomain } from '@/contexts/auth/use-session-domain'

import { getCapabilities } from './capabilities'
import { DEFAULT_APP_SETTINGS } from './constants'
import { clearSettings, loadSettings, saveSettings } from './storage'
import type {
  AppSettings,
  OperationMode,
  SettingsContextValue,
} from './types'

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useSessionDomain()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const settingsRef = useRef<AppSettings>(DEFAULT_APP_SETTINGS)
  const [isHydrated, setIsHydrated] = useState(false)
  const userId = currentUser?.id

  useEffect(() => {
    let isActive = true
    setIsHydrated(false)

    loadSettings(userId).then(storedSettings => {
      if (!isActive) return
      settingsRef.current = storedSettings
      setSettings(storedSettings)
      setIsHydrated(true)
    })

    return () => {
      isActive = false
    }
  }, [userId])

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const nextSettings = { ...settingsRef.current, ...patch }
    settingsRef.current = nextSettings
    setSettings(nextSettings)
    await saveSettings(userId, nextSettings)
  }, [userId])

  const setOperationMode = useCallback(
    (operationMode: OperationMode) => updateSettings({ operationMode }),
    [updateSettings],
  )

  const resetSettings = useCallback(async () => {
    settingsRef.current = DEFAULT_APP_SETTINGS
    setSettings(DEFAULT_APP_SETTINGS)
    await clearSettings(userId)
  }, [userId])

  const value = useMemo<SettingsContextValue>(() => {
    return {
      ...settings,
      isHydrated,
      capabilities: getCapabilities(settings.operationMode),
      setOperationMode,
      resetSettings,
    }
  }, [isHydrated, resetSettings, setOperationMode, settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
