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

const previewToken = (token: string | null) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

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
    console.info('[auth][set-session] start', {
      hasUser: !!user,
      inputUserKeys: user ? Object.keys(user) : [],
      hasToken: !!token,
      tokenPreview: previewToken(token),
    })

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
      tokenPreview: previewToken(token),
    })
  }, [])

  const hydrateSessionFromToken = useCallback(
    async (token: string, storedUser?: User | null) => {
      console.info('[auth][hydrate-token] start', {
        hasStoredUser: !!storedUser,
        storedUserId: storedUser?.id ?? null,
        hasToken: !!token,
        tokenPreview: previewToken(token),
      })

      const backendUser = await getCurrentUser(token)
      console.info('[auth][hydrate-token] backend-user', {
        backendUserKeys: backendUser ? Object.keys(backendUser) : [],
        backendUserId: backendUser?.id ?? null,
        backendMongoId: backendUser?._id ?? null,
        email: backendUser?.email ?? null,
        role: backendUser?.role ?? null,
        roles: backendUser?.roles ?? null,
      })

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

      console.info('[auth][load-stored-user] restored', {
        storedUserId,
        storedUserObjectId: storedUser?.id ?? null,
        hasStoredUser: !!storedUser,
        hasStoredToken: !!storedToken,
        storedTokenPreview: previewToken(storedToken),
      })

      if (storedToken) {
        try {
          await hydrateSessionFromToken(storedToken, storedUser)
        } catch (error) {
          console.error('[auth][hydrate-token] failed', {
            error,
            hasStoredUser: !!storedUser,
            storedUserId: storedUser?.id ?? null,
            hasStoredToken: true,
            storedTokenPreview: previewToken(storedToken),
          })
          setAuthToken(storedToken)
          if (storedUser) {
            setCurrentUserState(storedUser)
            console.info('[auth][hydrate-token] fallback-stored-user', {
              storedUserId: storedUser.id,
              email: storedUser.email,
              systemRole: storedUser.systemRole,
            })
          } else {
            console.warn('[auth][hydrate-token] fallback-token-only', {
              hasStoredToken: true,
              storedTokenPreview: previewToken(storedToken),
            })
          }
        }
      } else {
        console.info('[auth][load-stored-user] no stored token')
      }

      if (storedUserId) {
        const storedFavorites = await AsyncStorage.getItem(`favorites_${storedUserId}`)
        setHydratedFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])
        console.info('[auth][favorites] hydrated', {
          storedUserId,
          hasStoredFavorites: !!storedFavorites,
          favoritesCount: storedFavorites ? JSON.parse(storedFavorites).length : 0,
        })
      }
    } catch (error) {
      console.error('[auth][load-stored-user] failed', error)
    } finally {
      setIsLoading(false)
      console.info('[auth][load-stored-user] done')
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
