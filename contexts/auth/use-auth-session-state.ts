import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { refreshAuthTokens } from '@/lib/api/endpoints/auth'
import {
  buildSessionUser,
  clearPersistedAuthSession,
  loadPersistedAuthSession,
  normalizeAuthUser,
  persistAuthSession,
  type BackendUser,
} from '@/lib/services/auth-session'
import type { User } from '@/lib/types'

const previewToken = (token: string | null) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

type AuthSessionState = {
  authToken: string | null
  refreshToken: string | null
  currentUser: User | null
  hydratedFavorites: string[]
  isLoading: boolean
  setAuthSession: (user: BackendUser | User | null, token: string | null, refreshToken?: string | null) => Promise<void>
  setCurrentUser: (user: BackendUser | User | null) => void
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuthSession: () => Promise<string | null>
}

export function useAuthSessionState(): AuthSessionState {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [hydratedFavorites, setHydratedFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const setCurrentUser = useCallback((user: BackendUser | User | null) => {
    setCurrentUserState(normalizeAuthUser(user))
  }, [])

  const setAuthSession = useCallback(async (
    user: BackendUser | User | null,
    token: string | null,
    nextRefreshToken: string | null = null,
  ) => {
    console.info('[auth][set-session] start', {
      hasUser: !!user,
      inputUserKeys: user ? Object.keys(user) : [],
      hasToken: !!token,
      hasRefreshToken: !!nextRefreshToken,
      tokenPreview: previewToken(token),
      refreshTokenPreview: previewToken(nextRefreshToken),
    })

    const sessionUser = buildSessionUser(user, token)

    setCurrentUserState(sessionUser)
    setAuthToken(token)
    setRefreshToken(nextRefreshToken)
    await persistAuthSession(sessionUser, token, nextRefreshToken)

    console.log('[auth][session-stored]', {
      sessionUserId: sessionUser?.id ?? null,
      sessionEmail: sessionUser?.email ?? null,
      sessionSystemRole: sessionUser?.systemRole ?? null,
      investment: sessionUser?.investment ?? null,
      tenant: sessionUser?.tenant ?? null,
      resolvedUserId: sessionUser?.id ?? null,
      hasToken: !!token,
      hasRefreshToken: !!nextRefreshToken,
      tokenPreview: previewToken(token),
      refreshTokenPreview: previewToken(nextRefreshToken),
    })
  }, [])

  const initializeSession = useCallback(async () => {
    try {
      const persistedSession = await loadPersistedAuthSession()
      const sessionUser = persistedSession.user

      setCurrentUserState(sessionUser)
      setAuthToken(persistedSession.token)
      setRefreshToken(persistedSession.refreshToken)

      if (sessionUser?.id) {
        const storedFavorites = await AsyncStorage.getItem(`favorites_${sessionUser.id}`)
        setHydratedFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])
      } else {
        setHydratedFavorites([])
      }

      console.info('[auth][session-init] persisted session hydrated', {
        hasUser: !!sessionUser,
        hasToken: !!persistedSession.token,
        hasRefreshToken: !!persistedSession.refreshToken,
      })
    } catch (error) {
      console.error('[auth][session-init] failed', error)
    } finally {
      setIsLoading(false)
      console.info('[auth][session-init] done')
    }
  }, [])

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  const login = useCallback(
    async (userId: string) => {
      setCurrentUser(null)
      setAuthToken(null)
      setRefreshToken(null)
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`)
      setHydratedFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])
    },
    [setCurrentUser],
  )

  const logout = useCallback(async () => {
    setCurrentUserState(null)
    setAuthToken(null)
    setRefreshToken(null)
    setHydratedFavorites([])
    await clearPersistedAuthSession()
  }, [])

  const refreshAuthSession = useCallback(async () => {
    if (!refreshToken) {
      console.warn('[auth][refresh-session] skipped: missing refresh token')
      return null
    }

    const refreshedSession = await refreshAuthTokens(refreshToken)
    const nextAccessToken = refreshedSession.accessToken ?? null
    const nextRefreshToken = refreshedSession.refreshToken ?? refreshToken

    if (!refreshedSession.success || !nextAccessToken) {
      console.warn('[auth][refresh-session] failed, clearing session', {
        message: refreshedSession.message,
        error: refreshedSession.error ?? null,
      })
      await logout()
      return null
    }

    await setAuthSession(refreshedSession.user ?? currentUser, nextAccessToken, nextRefreshToken)

    console.info('[auth][refresh-session] stored refreshed tokens', {
      hasAccessToken: true,
      hasRefreshToken: !!nextRefreshToken,
      userId: refreshedSession.user?.id ?? currentUser?.id ?? null,
    })

    return nextAccessToken
  }, [currentUser, logout, refreshToken, setAuthSession])

  return {
    authToken,
    refreshToken,
    currentUser,
    hydratedFavorites,
    isLoading,
    setAuthSession,
    setCurrentUser,
    login,
    logout,
    refreshAuthSession,
  }
}

export default useAuthSessionState
