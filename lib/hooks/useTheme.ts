import type { AppTheme } from '@/lib/theme'
import { useAppTheme } from './useAppTheme'

export type ThemeMode = 'investor' | 'tenant' | 'searching' | 'advisor' | 'default'

interface UseThemeResult {
  theme: AppTheme
  themeMode: ThemeMode
  isInvestor: boolean
  isTenant: boolean
  isSearching: boolean
  isAdvisor: boolean
  isDarkTheme: boolean
}

export function useTheme(): UseThemeResult {
  return useAppTheme()
}

export default useTheme
