/**
 * Endpoints de autenticacion y usuarios
 */

import { coreApi } from '../client'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
  UserProfile,
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
  roles?: BackendUserRole[]
  clientProfile?: UserProfile
  permissions?: string[]
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
  token?: string
  data?: {
    accessToken?: string
    refreshToken?: string
    token?: string
  }
}

function extractRegisteredUser(payload: RegisterApiPayload): User | undefined {
  if ('id' in payload && 'email' in payload) {
    return payload
  }

  if (payload.user) {
    return payload.user
  }

  if (payload.data && 'id' in payload.data && 'email' in payload.data) {
    return payload.data
  }

  return payload.data?.user
}

function extractLoginTokens(payload: LoginApiPayload): {
  accessToken?: string
  refreshToken?: string
} {
  return {
    accessToken: payload.accessToken ?? payload.token ?? payload.data?.accessToken ?? payload.data?.token,
    refreshToken: payload.refreshToken ?? payload.data?.refreshToken,
  }
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

  if (!data.password || data.password.length < 6) {
    errors.push('La contrasena debe tener al menos 6 caracteres')
  }

  if (!data.role || !['CLIENT', 'AGENT', 'COORDINATOR', 'ADMIN'].includes(data.role)) {
    errors.push('El rol de usuario es invalido')
  }

  if (!data.clientProfile || !['INVESTOR', 'SEEKER', 'TENANT'].includes(data.clientProfile)) {
    errors.push('El perfil de usuario es invalido')
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
      password: data.password,
      role: data.role,
      clientProfile: data.clientProfile,
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

    console.log('[auth][login] response', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    })

    return {
      success: !!accessToken,
      message: 'Sesion iniciada exitosamente',
      accessToken,
      refreshToken,
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
