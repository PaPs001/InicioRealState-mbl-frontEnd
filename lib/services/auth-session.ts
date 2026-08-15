import AsyncStorage from '@react-native-async-storage/async-storage'

import type { BackendUserRole, User } from '@/lib/types'

const AUTH_USER_STORAGE_KEY = 'authUser'
const AUTH_TOKEN_STORAGE_KEY = 'authToken'
const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'authRefreshToken'
const CURRENT_USER_ID_STORAGE_KEY = 'currentUserId'

const previewToken = (token: string | null) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

export type BackendUser = Partial<User> & {
  _id?: string
  userId?: string
  role?: BackendUserRole
  roles?: BackendUserRole[]
  permissions?: string[]
  investment?: boolean
  tenant?: boolean
}

function decodeBase64(value: string): string | null {
  try {
    if (typeof globalThis.atob === 'function') {
      return globalThis.atob(value)
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value, 'base64').toString('utf-8')
    }

    return null
  } catch {
    return null
  }
}

function mapBackendRolesToSystemRole(
  roles?: BackendUserRole[],
  systemRole?: BackendUserRole,
  role?: BackendUserRole,
): BackendUserRole {
  if (roles?.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (roles?.includes('COORDINATOR')) {
    return 'COORDINATOR'
  }

  if (roles?.includes('AGENT')) {
    return 'AGENT'
  }

  if (role) {
    return role
  }

  if (systemRole) {
    return systemRole
  }

  return 'CLIENT'
}

function deriveInvestmentFlag(permissions?: string[], investment?: boolean): boolean {
  if (typeof investment === 'boolean') return investment

  const normalizedPermissions = permissions?.map(item => item.toUpperCase()) ?? []
  return normalizedPermissions.includes('INVESTOR')
}

function deriveTenantFlag(permissions?: string[], tenant?: boolean): boolean {
  if (typeof tenant === 'boolean') return tenant

  const normalizedPermissions = permissions?.map(item => item.toUpperCase()) ?? []
  return normalizedPermissions.includes('TENANT')
}

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    )

    const decodedPayload = decodeBase64(paddedPayload)
    if (!decodedPayload) return null

    const parsedPayload = JSON.parse(decodedPayload) as { userId?: string }
    const tokenUserId = parsedPayload.userId ?? null

    console.info('[auth][token-decode]', {
      hasToken: true,
      tokenPreview: previewToken(token),
      tokenUserId,
      payloadKeys: Object.keys(parsedPayload),
    })

    return tokenUserId
  } catch {
    console.warn('[auth][token-decode] failed', {
      hasToken: true,
      tokenPreview: previewToken(token),
    })
    return null
  }
}

export function normalizeAuthUser(user: BackendUser | User | null): User | null {
  if (!user) return null

  const backendUser = user as BackendUser
  const agentPresentation = Boolean(
    user.agentpresentation ??
      user.agentPresentation ??
      false,
  )

  return {
    id: user.id ?? backendUser._id ?? backendUser.userId ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    country: user.country ?? backendUser.country ?? null,
    systemRole: mapBackendRolesToSystemRole(backendUser.roles, user.systemRole, backendUser.role),
    roles: backendUser.roles ?? user.roles,
    investment: deriveInvestmentFlag(backendUser.permissions, backendUser.investment),
    tenant: deriveTenantFlag(backendUser.permissions, backendUser.tenant),
    permissions: backendUser.permissions ?? user.permissions,
    avatar: user.avatar,
    profilePhotoKey: user.profilePhotoKey,
    agentPresentationKey: user.agentPresentationKey,
    agentpresentation: agentPresentation,
    agentPresentation: agentPresentation,
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
}

export function buildSessionUser(user: BackendUser | User | null, token: string | null): User | null {
  const normalizedUser = normalizeAuthUser(user)
  const tokenUserId = getUserIdFromToken(token)
  const sessionUser = normalizedUser
    ? { ...normalizedUser, id: normalizedUser.id || tokenUserId || '' }
    : null

  console.info('[auth][build-session-user]', {
    hasInputUser: !!user,
    inputUserKeys: user ? Object.keys(user) : [],
    normalizedUserId: normalizedUser?.id ?? null,
    tokenUserId,
    finalUserId: sessionUser?.id ?? null,
    email: sessionUser?.email ?? null,
    systemRole: sessionUser?.systemRole ?? null,
    hasToken: !!token,
  })

  return sessionUser
}

export type PersistedAuthSession = {
  user: User | null
  token: string | null
  refreshToken: string | null
}

export async function persistAuthSession(
  user: User | null,
  token: string | null,
  refreshToken: string | null = null,
): Promise<void> {
  console.info('[auth][storage-write] start', {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    tokenPreview: previewToken(token),
    refreshTokenPreview: previewToken(refreshToken),
    willStoreUser: !!user?.id,
  })

  if (user?.id) {
    await AsyncStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, user.id)
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }

  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }

  if (refreshToken) {
    await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  } else {
    await AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
  }

  const [storedUserId, storedAuthUser, storedAuthToken, storedRefreshToken] = await Promise.all([
    AsyncStorage.getItem(CURRENT_USER_ID_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
  ])

  console.info('[auth][storage-write] done', {
    storedUserId,
    hasStoredUser: !!storedAuthUser,
    hasStoredToken: !!storedAuthToken,
    hasStoredRefreshToken: !!storedRefreshToken,
    storedUserLength: storedAuthUser?.length ?? 0,
  })
}

export async function loadPersistedAuthSession(): Promise<PersistedAuthSession> {
  const [storedUser, token, refreshToken] = await Promise.all([
    AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
    AsyncStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
  ])

  let user: User | null = null
  if (storedUser) {
    try {
      user = JSON.parse(storedUser) as User
    } catch {
      user = null
    }
  }

  console.info('[auth][storage-read] done', {
    hasStoredUser: !!user,
    hasStoredToken: !!token,
    hasStoredRefreshToken: !!refreshToken,
    tokenPreview: previewToken(token),
    refreshTokenPreview: previewToken(refreshToken),
  })

  return {
    user,
    token,
    refreshToken,
  }
}

export async function clearPersistedAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export async function clearPersistedAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
