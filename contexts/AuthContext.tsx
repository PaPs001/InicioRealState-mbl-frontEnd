import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import type { AuthContextType } from './auth/types'
import { useActivityState } from './auth/use-activity-state'
import { useAuthSessionState } from './auth/use-auth-session-state'
import { usePropertyState } from './auth/use-property-state'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionState = useAuthSessionState()

  const { currentUser, authToken, hydratedFavorites, isLoading, login, logout, setAuthSession, setCurrentUser } = sessionState
  const isClient = currentUser?.systemRole === 'CLIENT'
  const isAgent = currentUser?.systemRole === 'AGENT'
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
    currentUserId: currentUser?.id,
    isAdmin: isStaffCoordinator,
    isAgent,
    isClient,
  })

  const {
    favorites,
    favoriteProperties,
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    userProperties,
    availableProperties,
    loadFavoriteProperties,
    addNewFavoriteProperty,
    toggleFavorite,
    isFavorite,
    getPropertyById,
    loadCatalogProperties,
    newLoadCatalogProperties,
    loadAgentCatalogProperties,
    replaceFavoriteIds,
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
    replaceFavoriteIds(hydratedFavorites)
  }, [hydratedFavorites, replaceFavoriteIds])

  useEffect(() => {
    if (!currentUser) {
      resetPropertyState()
    }
  }, [currentUser, resetPropertyState])

  return (
    <AuthContext.Provider value={{
      currentUser,
      authToken,
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
      favoriteProperties,
      loadFavoriteProperties,
      favorites,
      addNewFavoriteProperty,
      toggleFavorite,
      isFavorite,
      getPropertyById,
      loadCatalogProperties,
      loadAgentCatalogProperties,
      markNotificationAsRead,
      markAllUserNotificationsAsRead,
      unreadNotificationsCount,
    }}>
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
