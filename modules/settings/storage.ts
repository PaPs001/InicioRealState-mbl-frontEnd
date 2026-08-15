import AsyncStorage from '@react-native-async-storage/async-storage'

import { DEFAULT_APP_SETTINGS, SETTINGS_STORAGE_PREFIX } from './constants'
import type { AppSettings, OperationMode } from './types'

const operationModes: OperationMode[] = ['rent', 'sale', 'both']

export function getSettingsStorageKey(userId?: string | null) {
  return `${SETTINGS_STORAGE_PREFIX}:${userId || 'guest'}`
}

function isOperationMode(value: unknown): value is OperationMode {
  return operationModes.includes(value as OperationMode)
}

export async function loadSettings(userId?: string | null): Promise<AppSettings> {
  try {
    const rawSettings = await AsyncStorage.getItem(getSettingsStorageKey(userId))
    if (!rawSettings) return DEFAULT_APP_SETTINGS

    const parsed = JSON.parse(rawSettings) as Partial<AppSettings>
    return {
      operationMode: isOperationMode(parsed.operationMode)
        ? parsed.operationMode
        : DEFAULT_APP_SETTINGS.operationMode,
    }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

export async function saveSettings(userId: string | null | undefined, settings: AppSettings) {
  await AsyncStorage.setItem(getSettingsStorageKey(userId), JSON.stringify(settings))
}

export async function clearSettings(userId?: string | null) {
  await AsyncStorage.removeItem(getSettingsStorageKey(userId))
}
