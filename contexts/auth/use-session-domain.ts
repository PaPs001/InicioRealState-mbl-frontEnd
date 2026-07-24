import { useAuth } from '../AuthContext'
import type { SessionDomain } from './types'

export function useSessionDomain(): SessionDomain {
  const {
    currentUser,
    authToken,
    refreshToken,
    isLoading,
    isLoggedIn,
    isInvestor,
    isSearching,
    isTenant,
    isAgent,
    isCoordinator,
    isAdmin,
    isClient,
    login,
    logout,
    refreshAuthSession,
    setCurrentUser,
    setAuthSession,
  } = useAuth()

  return {
    currentUser,
    authToken,
    refreshToken,
    isLoading,
    isLoggedIn,
    isInvestor,
    isSearching,
    isTenant,
    isAgent,
    isCoordinator,
    isAdmin,
    isClient,
    login,
    logout,
    refreshAuthSession,
    setCurrentUser,
    setAuthSession,
  }
}

export default useSessionDomain
