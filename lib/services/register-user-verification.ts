import {
  sendRegistrationVerificationEmail,
  verifyRegistrationEmailCode,
} from '@/lib/api/endpoints/mail'
import type { RegisterAccessFormData } from './register-user-access'
import type { RegisterClientType } from './register-entry'

export const REGISTER_VERIFICATION_CODE_LENGTH = 6
export const REGISTER_VERIFICATION_RESEND_SECONDS = 45

export type RegisterVerificationParams = RegisterAccessFormData & {
  clientType: RegisterClientType
  registrationAccess: '1'
  emailVerificationToken?: string
}

export function normalizeRegisterVerificationCode(value: string) {
  return value.replace(/\D/g, '').slice(0, REGISTER_VERIFICATION_CODE_LENGTH)
}

export function isRegisterVerificationCodeComplete(value: string) {
  return normalizeRegisterVerificationCode(value).length === REGISTER_VERIFICATION_CODE_LENGTH
}

export function formatRegisterVerificationCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function getRegisterVerificationParams(params: Partial<RegisterVerificationParams>) {
  return {
    clientType: params.clientType ?? 'owner',
    registrationAccess: '1',
    fullName: params.fullName ?? '',
    email: params.email ?? '',
    phone: params.phone ?? '',
    password: params.password ?? '',
    emailVerificationToken: params.emailVerificationToken ?? '',
  } as const
}

export function getRegisterWelcomeParams(params: Partial<RegisterVerificationParams>) {
  return getRegisterVerificationParams(params)
}

export async function requestRegisterVerificationCode(
  params: Partial<RegisterVerificationParams>,
) {
  const verificationParams = getRegisterVerificationParams(params)

  return sendRegistrationVerificationEmail({
    clientType: verificationParams.clientType,
    fullName: verificationParams.fullName,
    email: verificationParams.email,
    phone: verificationParams.phone,
    password: verificationParams.password,
  })
}

export async function confirmRegisterVerificationCode(
  email: string,
  code: string,
) {
  return verifyRegistrationEmailCode({ email, code: normalizeRegisterVerificationCode(code) })
}
