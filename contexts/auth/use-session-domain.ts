import { useAuth } from '../AuthContext'
import type { SessionDomain } from './types'

export function useSessionDomain(): SessionDomain {
  const {
    currentUser,
    authToken,
    isLoading,
    isLoggedIn,
    isInvestor,
    isSearching,
    isTenant,
    isAgent,
    isAdmin,
    isClient,
    login,
    logout,
    setCurrentUser,
    setAuthSession,
  } = useAuth()

  return {
    currentUser,
    authToken,
    isLoading,
    isLoggedIn,
    isInvestor,
    isSearching,
    isTenant,
    isAgent,
    isAdmin,
    isClient,
    login,
    logout,
    setCurrentUser,
    setAuthSession,
  }
}

export default useSessionDomain
