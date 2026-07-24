import {
  confirmPasswordReset,
  requestPasswordResetCode,
  verifyPasswordResetCode,
} from '@/lib/api/endpoints/auth'

export const PASSWORD_RESET_CODE_LENGTH = 6

export function normalizePasswordResetEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizePasswordResetCode(code: string) {
  return code.replace(/\D/g, '').slice(0, PASSWORD_RESET_CODE_LENGTH)
}

export function isPasswordResetCodeComplete(code: string) {
  return normalizePasswordResetCode(code).length === PASSWORD_RESET_CODE_LENGTH
}

export function validatePasswordResetEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizePasswordResetEmail(email))
}

export function validateNewPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

export function getPasswordResetErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const apiError = error as { message?: string; error?: string }
    return apiError.message || apiError.error || fallback
  }

  return fallback
}

export async function requestPasswordReset(email: string) {
  return requestPasswordResetCode({ email: normalizePasswordResetEmail(email) })
}

export async function verifyPasswordReset(email: string, code: string) {
  return verifyPasswordResetCode({
    email: normalizePasswordResetEmail(email),
    code: normalizePasswordResetCode(code),
  })
}

export async function finishPasswordReset(resetToken: string, password: string) {
  return confirmPasswordReset({ resetToken, password })
}
