/**
 * Endpoints de autenticacion y usuarios
 */

import { coreApi } from '../client'
import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, User } from '@/lib/types'

// Validaciones
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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

  if (!data.role || !['investor', 'searching', 'tenant', 'agent', 'admin'].includes(data.role)) {
    errors.push('El rol de usuario es invalido')
  }

  return { valid: errors.length === 0, errors }
}

// Registro de usuario
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

    const result = await coreApi<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        role: data.role,
        referralCode: data.referralCode || null
      }
    })

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: result.user,
      token: result.token
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

// Login de usuario
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    if (!data.email || !data.password) {
      return {
        success: false,
        message: 'Email y contrasena son requeridos',
        error: 'Datos incompletos'
      }
    }

    const result = await coreApi<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: {
        email: data.email.trim().toLowerCase(),
        password: data.password
      }
    })

    return {
      success: true,
      message: 'Sesion iniciada exitosamente',
      user: result.user,
      token: result.token
    }
  } catch (error) {
    console.error('Error en loginUser:', error)
    return {
      success: false,
      message: 'Error al iniciar sesion',
      error: error instanceof Error ? error.message : 'Credenciales invalidas'
    }
  }
}

// Verificar si email existe
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

// Actualizar perfil de usuario
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
