import AsyncStorage from '@react-native-async-storage/async-storage'

import type { BackendUserRole, User } from '@/lib/types'

const AUTH_USER_STORAGE_KEY = 'authUser'
const AUTH_TOKEN_STORAGE_KEY = 'authToken'
const CURRENT_USER_ID_STORAGE_KEY = 'currentUserId'

export type BackendUser = Partial<User> & {
  _id?: string
  userId?: string
  role?: BackendUserRole
  roles?: BackendUserRole[]
  permissions?: string[]
  investment?: boolean
  tenant?: boolean
}

type RestoredAuthSession = {
  storedToken: string | null
  storedUser: User | null
  storedUserId: string | null
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
  if (systemRole) {
    return systemRole
  }

  if (role) {
    return role
  }

  if (roles?.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (roles?.includes('COORDINATOR')) {
    return 'COORDINATOR'
  }

  if (roles?.includes('AGENT')) {
    return 'AGENT'
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
    return parsedPayload.userId ?? null
  } catch {
    return null
  }
}

export function normalizeAuthUser(user: BackendUser | User | null): User | null {
  if (!user) return null

  const backendUser = user as BackendUser

  return {
    id: user.id ?? backendUser._id ?? backendUser.userId ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    systemRole: mapBackendRolesToSystemRole(backendUser.roles, user.systemRole, backendUser.role),
    investment: deriveInvestmentFlag(backendUser.permissions, backendUser.investment),
    tenant: deriveTenantFlag(backendUser.permissions, backendUser.tenant),
    permissions: backendUser.permissions ?? user.permissions,
    avatar: user.avatar,
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
}

export function buildSessionUser(user: BackendUser | User | null, token: string | null): User | null {
  const normalizedUser = normalizeAuthUser(user)
  const tokenUserId = getUserIdFromToken(token)

  return normalizedUser
    ? { ...normalizedUser, id: normalizedUser.id || tokenUserId || '' }
    : null
}

export async function persistAuthSession(user: User | null, token: string | null): Promise<void> {
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
}

export async function restoreAuthSession(): Promise<RestoredAuthSession> {
  const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  const storedAuthUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY)
  const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_STORAGE_KEY)

  return {
    storedToken,
    storedUser: storedAuthUser ? normalizeAuthUser(JSON.parse(storedAuthUser) as User) : null,
    storedUserId,
  }
}

export async function clearPersistedAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export async function persistMockLoginUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, userId)
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
