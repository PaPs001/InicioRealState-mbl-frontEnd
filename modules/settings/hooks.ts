import { useContext } from 'react'

import { SettingsContext } from './SettingsProvider'

export function useAppSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useAppSettings must be used within a SettingsProvider')
  }

  return context
}

export function useOperationMode() {
  const { operationMode, capabilities, setOperationMode } = useAppSettings()
  return { operationMode, capabilities, setOperationMode }
}
