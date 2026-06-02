/**
 * Hook para obtener el tema correcto basado en el rol del usuario
 */
import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { clientThemes, colors, type ClientTheme } from '@/lib/theme'

export type ThemeMode = 'investor' | 'tenant' | 'searching' | 'advisor' | 'default'

interface UseThemeResult {
  theme: ClientTheme
  themeMode: ThemeMode
  isInvestor: boolean
  isTenant: boolean
  isSearching: boolean
  isAdvisor: boolean
  isDarkTheme: boolean
}

export function useTheme(): UseThemeResult {
  const { currentUser, isInvestor, isTenant, isAgent, isAdmin } = useAuth()

  return useMemo(() => {
    const isSearching = currentUser?.clientProfile === 'SEEKER'
    const isAdvisor = isAgent || isAdmin

    let themeMode: ThemeMode = 'default'
    let theme: ClientTheme
    let isDarkTheme = false

    if (isInvestor) {
      themeMode = 'investor'
      theme = clientThemes.investor
      isDarkTheme = true
    } else if (isTenant) {
      themeMode = 'tenant'
      theme = clientThemes.tenant
      isDarkTheme = true
    } else if (isAdvisor) {
      themeMode = 'advisor'
      theme = clientThemes.advisor
      isDarkTheme = true
    } else {
      themeMode = 'searching'
      theme = clientThemes.searching
      isDarkTheme = false
    }

    return {
      theme,
      themeMode,
      isInvestor,
      isTenant,
      isSearching,
      isAdvisor,
      isDarkTheme,
    }
  }, [currentUser, isInvestor, isTenant, isAgent, isAdmin])
}

export default useTheme
