import { useCallback, useEffect, useState } from 'react'

import { refreshAuthTokens } from '@/lib/api/endpoints/auth'
import {
  buildSessionUser,
  clearPersistedAuthSession,
  loadPersistedAuthSession,
  persistAuthSession,
  normalizeAuthUser,
  type BackendUser,
} from '@/lib/services/auth-session'
import type { User } from '@/lib/types'

const previewToken = (token: string | null) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

type AuthSessionState = {
  authToken: string | null
  refreshToken: string | null
  currentUser: User | null
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
      agentpresentation: user?.agentpresentation
    })

    const rawPresentation = Boolean(
      user?.agentpresentation ??
        user?.agentPresentation ??
        false,
    )
    const normalizedUser = user
      ? {
          ...user,
          agentpresentation: rawPresentation,
          agentPresentation: rawPresentation,
        }
      : null

    const sessionUser = buildSessionUser(normalizedUser, token)
    const normalizedSessionUser = sessionUser
      ? {
          ...sessionUser,
          agentpresentation: rawPresentation,
          agentPresentation: rawPresentation,
        }
      : null

    setCurrentUserState(normalizedSessionUser)
    setAuthToken(token)
    setRefreshToken(nextRefreshToken)
    await persistAuthSession(normalizedSessionUser, token, nextRefreshToken)

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
    async (_userId: string) => {
      setCurrentUser(null)
      setAuthToken(null)
      setRefreshToken(null)
    },
    [setCurrentUser],
  )

  const logout = useCallback(async () => {
    setCurrentUserState(null)
    setAuthToken(null)
    setRefreshToken(null)
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
    isLoading,
    setAuthSession,
    setCurrentUser,
    login,
    logout,
    refreshAuthSession,
  }
}

export default useAuthSessionState
