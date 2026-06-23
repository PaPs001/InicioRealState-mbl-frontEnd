import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getAuthMockUserById, getCurrentUser } from '@/lib/api'
import {
  buildSessionUser,
  clearPersistedAuthSession,
  normalizeAuthUser,
  persistAuthSession,
  persistMockLoginUserId,
  restoreAuthSession,
  type BackendUser,
} from '@/lib/services/auth-session'
import type { User } from '@/lib/types'

type AuthSessionState = {
  authToken: string | null
  currentUser: User | null
  hydratedFavorites: string[]
  isLoading: boolean
  setAuthSession: (user: BackendUser | User | null, token: string | null) => Promise<void>
  setCurrentUser: (user: BackendUser | User | null) => void
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
}

export function useAuthSessionState(): AuthSessionState {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [hydratedFavorites, setHydratedFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const setCurrentUser = useCallback((user: BackendUser | User | null) => {
    setCurrentUserState(normalizeAuthUser(user))
  }, [])

  const setAuthSession = useCallback(async (user: BackendUser | User | null, token: string | null) => {
    const sessionUser = buildSessionUser(user, token)

    setCurrentUserState(sessionUser)
    setAuthToken(token)
    await persistAuthSession(sessionUser, token)

    console.log('[auth][session-stored]', {
      sessionUserId: sessionUser?.id ?? null,
      sessionEmail: sessionUser?.email ?? null,
      sessionSystemRole: sessionUser?.systemRole ?? null,
      investment: sessionUser?.investment ?? null,
      tenant: sessionUser?.tenant ?? null,
      resolvedUserId: sessionUser?.id ?? null,
      hasToken: !!token,
    })
  }, [])

  const hydrateSessionFromToken = useCallback(
    async (token: string, storedUser?: User | null) => {
      const backendUser = await getCurrentUser(token)
      await setAuthSession(
        {
          ...storedUser,
          ...backendUser,
          investment: backendUser.investment ?? storedUser?.investment,
          tenant: backendUser.tenant ?? storedUser?.tenant,
        },
        token,
      )
    },
    [setAuthSession],
  )

  const loadStoredUser = useCallback(async () => {
    try {
      const { storedToken, storedUser, storedUserId } = await restoreAuthSession()

      if (storedToken) {
        try {
          await hydrateSessionFromToken(storedToken, storedUser)
        } catch (error) {
          console.error('Error hydrating session from token:', error)
          setAuthToken(storedToken)
          if (storedUser) {
            setCurrentUserState(storedUser)
          }
        }
      }

      if (storedUserId) {
        const storedFavorites = await AsyncStorage.getItem(`favorites_${storedUserId}`)
        setHydratedFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])
      }
    } catch (error) {
      console.error('Error loading stored user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [hydrateSessionFromToken])

  useEffect(() => {
    loadStoredUser()
  }, [loadStoredUser])

  const login = useCallback(
    async (userId: string) => {
      const user = getAuthMockUserById(userId)
      if (!user) return

      setCurrentUser(user)
      setAuthToken(null)
      await persistMockLoginUserId(userId)
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`)
      setHydratedFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])
    },
    [setCurrentUser],
  )

  const logout = useCallback(async () => {
    setCurrentUserState(null)
    setAuthToken(null)
    setHydratedFavorites([])
    await clearPersistedAuthSession()
  }, [])

  return {
    authToken,
    currentUser,
    hydratedFavorites,
    isLoading,
    setAuthSession,
    setCurrentUser,
    login,
    logout,
  }
}

export default useAuthSessionState
