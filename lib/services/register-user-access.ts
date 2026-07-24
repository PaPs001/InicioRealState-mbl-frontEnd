import {
  hasEmailShape,
  hasMinTrimmedLength,
  hasPasswordLength,
  hasPhoneLength,
} from '@/lib/services/form-validation'
import type { RegisterClientType } from './register-entry'

export type RegisterAccessFormData = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type RegisterAccessField = keyof RegisterAccessFormData

export function getInitialRegisterAccessFormData(): RegisterAccessFormData {
  return {
    fullName: '',
    email: '',
    phone: '',
    password: '',
  }
}

export function isRegisterAccessFormValid(data: RegisterAccessFormData) {
  return (
    hasMinTrimmedLength(data.fullName, 3) &&
    hasEmailShape(data.email) &&
    hasPhoneLength(data.phone) &&
    hasPasswordLength(data.password)
  )
}

export function getRegisterAccessValidationErrors(data: RegisterAccessFormData) {
  const errors: string[] = []

  if (!hasMinTrimmedLength(data.fullName, 3)) {
    errors.push('Nombre completo: escribe al menos 3 caracteres.')
  }

  if (!hasEmailShape(data.email)) {
    errors.push('Correo electronico: usa un formato valido, por ejemplo nombre@correo.com.')
  }

  if (!hasPhoneLength(data.phone)) {
    errors.push('Telefono o WhatsApp: escribe al menos 10 digitos.')
  }

  if (!hasPasswordLength(data.password)) {
    errors.push('Contrasena: debe tener al menos 6 caracteres.')
  }

  return errors
}

export function getRegisterClientTypeFromRoute(pathname: string): RegisterClientType {
  if (pathname.startsWith('/regAdvisor')) return 'advisor'
  if (pathname.startsWith('/regInquilino')) return 'renter'
  if (pathname.startsWith('/regSearcher')) return 'tenant'
  return 'owner'
}

export function getRegisterAccessParams(
  data: RegisterAccessFormData,
  clientType: RegisterClientType = 'owner',
) {
  return {
    clientType,
    registrationAccess: '1',
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    password: data.password,
  } as const
}

export function getRegisterExistingAccountConflict(error: unknown): RegisterAccessField | null {
  if (!error || typeof error !== 'object') return null

  const apiError = error as { status?: number; message?: string; error?: string }
  if (apiError.status !== 409) return null

  const message = `${apiError.message ?? ''} ${apiError.error ?? ''}`.toLowerCase()

  if (message.includes('email already registered')) return 'email'
  if (message.includes('phone already registered')) return 'phone'

  return null
}

export function getRegisterAccessErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const apiError = error as { message?: string; error?: string }
    return apiError.message || apiError.error || 'Intentalo de nuevo en unos momentos.'
  }

  return 'Intentalo de nuevo en unos momentos.'
}

