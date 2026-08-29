import React, { createContext, useContext, ReactNode, useEffect, useMemo } from 'react'
import type { AuthContextType } from './auth/types'
import { useActivityState } from './auth/use-activity-state'
import { useAuthSessionState } from './auth/use-auth-session-state'
import { usePropertyState } from './auth/use-property-state'
import { setAuthTokenRefreshHandler } from '@/lib/api/client'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionState = useAuthSessionState()

  const { currentUser, authToken, refreshToken, isLoading, login, logout, refreshAuthSession, setAuthSession, setCurrentUser } = sessionState
  const normalizedUserRoles = [
    currentUser?.systemRole,
    ...(currentUser?.roles ?? []),
  ].filter((role): role is NonNullable<typeof role> => Boolean(role)).map(role => role.toUpperCase())
  const isClient = currentUser?.systemRole === 'CLIENT'
  const isAgent = normalizedUserRoles.includes('AGENT')
  const isInvestor = !!currentUser?.investment
  const isTenant = !!currentUser?.tenant
  const isSearching = isClient && !isInvestor && !isTenant
  const isCoordinator = currentUser?.systemRole === 'COORDINATOR'
  const isAdmin = currentUser?.systemRole === 'ADMIN'
  const isStaffCoordinator = isAdmin || isCoordinator

  const propertyDomain = usePropertyState({
    authToken,
    currentUserId: currentUser?.id,
    isAdmin: isStaffCoordinator,
    isAgent,
  })
  const activityDomain = useActivityState({
    authToken,
    currentUserId: currentUser?.id,
    isAdmin: isStaffCoordinator,
    isAgent,
    isClient,
  })

  const {
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    userProperties,
    availableProperties,
    getPropertyById,
    loadCatalogProperties,
    newLoadCatalogProperties,
    loadAgentCatalogProperties,
    resetPropertyState,
  } = propertyDomain

  const {
    userLeads,
    userAppointments,
    userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
  } =
    activityDomain

  useEffect(() => {
    if (!currentUser) {
      resetPropertyState()
    }
  }, [currentUser, resetPropertyState])

  useEffect(() => {
    setAuthTokenRefreshHandler(refreshToken ? refreshAuthSession : null)

    return () => {
      setAuthTokenRefreshHandler(null)
    }
  }, [refreshAuthSession, refreshToken])

  const authContextValue = useMemo<AuthContextType>(() => ({
    currentUser,
    authToken,
    refreshToken,
    isLoading,
    isLoggedIn: !!currentUser,
    isInvestor,
    isSearching,
    isCoordinator,
    isTenant,
    isAgent,
    isAdmin,
    isClient,
    login,
    logout,
    refreshAuthSession,
    setCurrentUser,
    setAuthSession,
    userProperties,
    availableProperties,
    catalogProperties,
    agentCatalogProperties,
    newLoadCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    userLeads,
    userAppointments,
    notifications: userNotifications,
    getPropertyById,
    loadCatalogProperties,
    loadAgentCatalogProperties,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
    unreadNotificationsCount,
  }), [
    agentCatalogProperties,
    agentCatalogRawData,
    authToken,
    availableProperties,
    catalogProperties,
    currentUser,
    getPropertyById,
    hasLoadedAgentCatalog,
    hasLoadedCatalog,
    isAdmin,
    isAgent,
    isAgentCatalogLoading,
    isCatalogLoading,
    isClient,
    isCoordinator,
    isInvestor,
    isLoading,
    isSearching,
    isTenant,
    loadAgentCatalogProperties,
    loadCatalogProperties,
    login,
    logout,
    markAllUserNotificationsAsRead,
    markNotificationAsRead,
    newLoadCatalogProperties,
    refreshAuthSession,
    refreshToken,
    setAuthSession,
    setCurrentUser,
    unreadNotificationsCount,
    userAppointments,
    userLeads,
    userNotifications,
    userProperties,
  ])

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
