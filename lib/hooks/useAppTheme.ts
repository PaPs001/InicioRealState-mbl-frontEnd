import { useMemo } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { getAppThemeByRole } from '@/lib/theme'

export function useAppTheme() {
  const { isAdmin, isAgent, isInvestor, isSearching, isTenant } = useAuth()

  return useMemo(() => {
    const theme = getAppThemeByRole({
      isAdvisor: isAgent || isAdmin,
      isInvestor,
      isSearching,
      isTenant,
    })

    return {
      theme,
      themeMode: theme.mode,
      isDarkTheme: theme.isDark,
      isAdvisor: theme.mode === 'advisor',
      isInvestor: theme.mode === 'investor',
      isSearching: theme.mode === 'searching' || theme.mode === 'default',
      isTenant: theme.mode === 'tenant',
    }
  }, [isAdmin, isAgent, isInvestor, isSearching, isTenant])
}

export default useAppTheme
