/**
 * Endpoints de autenticacion y usuarios
 */

import { coreApi } from '../client'
import { mockUsers } from '@/lib/mock-data'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
  BackendUserRole,
} from '@/lib/types'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const apiError = error as { message?: string; error?: string }
    return apiError.message || apiError.error || fallback
  }

  return fallback
}

export type BackendCurrentUser = {
  _id?: string
  id?: string
  email: string
  name: string
  phone?: string
  country?: string
  role?: BackendUserRole
  roles?: BackendUserRole[]
  permissions?: string[]
  investment?: boolean
  tenant?: boolean
}

function mapBackendRolesToSystemRole(roles?: BackendUserRole[], role?: BackendUserRole): BackendUserRole {
  if (roles?.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (roles?.includes('COORDINATOR')) {
    return 'COORDINATOR'
  }

  if (roles?.includes('AGENT')) {
    return 'AGENT'
  }

  return role ?? 'CLIENT'
}

function mapBackendAuthUser(user?: BackendCurrentUser): User | undefined {
  if (!user) return undefined

  const roles = user.roles ?? (user.role ? [user.role] : ['CLIENT'])

  return {
    id: user.id ?? user._id ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    country: user.country ?? null,
    systemRole: mapBackendRolesToSystemRole(roles, user.role),
    roles,
    investment: user.investment ?? false,
    tenant: user.tenant ?? false,
    permissions: user.permissions,
    createdAt: new Date().toISOString(),
  }
}

export function getAuthMockUserById(userId: string): User | null {
  return mockUsers.find((user) => user.id === userId) ?? null
}

type RegisterApiPayload =
  | User
  | {
      user?: User
      data?: User | { user?: User }
      message?: string
    }

type LoginApiPayload = {
  accessToken?: string
  refreshToken?: string
  user?: BackendCurrentUser
  data?: {
    accessToken?: string
    refreshToken?: string
    user?: BackendCurrentUser
  }
}

function extractRegisteredUser(payload: RegisterApiPayload): User | undefined {
  if ('id' in payload && 'email' in payload) {
    return mapBackendAuthUser(payload as BackendCurrentUser)
  }

  if (payload.user) {
    return mapBackendAuthUser(payload.user as BackendCurrentUser)
  }

  if (payload.data && 'id' in payload.data && 'email' in payload.data) {
    return mapBackendAuthUser(payload.data as BackendCurrentUser)
  }

  return mapBackendAuthUser(payload.data?.user as BackendCurrentUser | undefined)
}

function extractLoginTokens(payload: LoginApiPayload): {
  accessToken?: string
  refreshToken?: string
} {
  return {
    accessToken: payload.accessToken ?? payload.data?.accessToken,
    refreshToken: payload.refreshToken ?? payload.data?.refreshToken,
  }
}

function extractLoginUser(payload: LoginApiPayload): BackendCurrentUser | undefined {
  return payload.user ?? payload.data?.user
}

export async function getCurrentUser(token: string): Promise<BackendCurrentUser> {
  return coreApi<BackendCurrentUser>('/users/me', {
    method: 'GET',
    token,
  })
}

export function validateRegistrationData(data: RegisterRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres')
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('El correo electronico es invalido')
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push('El telefono debe tener al menos 10 digitos')
  }

  if (!data.password || data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
    errors.push('La contrasena debe tener al menos 8 caracteres e incluir letras y numeros')
  }

  if (!Array.isArray(data.roles) || data.roles.length !== 1 || !['CLIENT', 'AGENT'].includes(data.roles[0])) {
    errors.push('El rol de usuario es invalido')
  }

  return { valid: errors.length === 0, errors }
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const validation = validateRegistrationData(data)
    if (!validation.valid) {
      return {
        success: false,
        message: 'Datos de registro invalidos',
        error: validation.errors.join(', ')
      }
    }

    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      country: data.country?.trim() || null,
      password: data.password,
      roles: data.roles,
      investment: data.investment,
      tenant: data.tenant,
    }

    console.log('[auth][register] payload', payload)

    const result = await coreApi<RegisterApiPayload>('/auth/register', {
      method: 'POST',
      body: payload
    })

    const user = extractRegisteredUser(result)

    console.log('[auth][register] response', result)

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user
    }
  } catch (error) {
    console.error('Error en registerUser:', error)
    return {
      success: false,
      message: 'Error al registrar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    if (!data.email || !data.password) {
      return {
        success: false,
        message: 'Email y contraseña son requeridos',
        error: 'Datos incompletos'
      }
    }

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    }

    console.log('[auth][login] payload', {
      email: payload.email,
      passwordLength: payload.password.length,
    })

    const result = await coreApi<LoginApiPayload>('/auth/login', {
      method: 'POST',
      body: payload
    })

    const { accessToken, refreshToken } = extractLoginTokens(result)
    const user = mapBackendAuthUser(extractLoginUser(result))

    console.log('[auth][login] response', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userId: user?.id ?? null,
      systemRole: user?.systemRole ?? null,
      roles: user?.roles ?? null,
      investment: user?.investment ?? null,
      tenant: user?.tenant ?? null,
    })

    return {
      success: !!accessToken,
      message: 'Sesion iniciada exitosamente',
      accessToken,
      refreshToken,
      user,
      error: accessToken ? undefined : 'La API no devolvio un token de sesion',
    }
  } catch (error) {
    console.error('Error en loginUser:', error)
    return {
      success: false,
      message: 'Error al iniciar sesion',
      error: getApiErrorMessage(error, 'Credenciales invalidas')
    }
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await coreApi<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() }
    })
    return result.exists || false
  } catch {
    return false
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>,
  token: string
): Promise<{ success: boolean; message: string; user?: User; error?: string }> {
  try {
    const result = await coreApi<{ user: User }>(`/auth/profile/${userId}`, {
      method: 'PUT',
      token,
      body: updates
    })

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: result.user
    }
  } catch (error) {
    console.error('Error en updateUserProfile:', error)
    return {
      success: false,
      message: 'Error al actualizar perfil',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
