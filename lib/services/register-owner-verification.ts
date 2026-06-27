import type { OwnerAccessFormData } from '@/lib/services/register-owner-access'

export const OWNER_VERIFICATION_CODE_LENGTH = 6
export const OWNER_VERIFICATION_RESEND_SECONDS = 45

export type OwnerVerificationParams = OwnerAccessFormData & {
  clientType: 'owner'
  ownerAccess: '1'
}

export function normalizeOwnerVerificationCode(value: string) {
  return value.replace(/\D/g, '').slice(0, OWNER_VERIFICATION_CODE_LENGTH)
}

export function isOwnerVerificationCodeComplete(value: string) {
  return normalizeOwnerVerificationCode(value).length === OWNER_VERIFICATION_CODE_LENGTH
}

export function formatOwnerVerificationCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function getOwnerVerificationRegisterParams(params: Partial<OwnerVerificationParams>) {
  return {
    clientType: 'owner',
    ownerAccess: '1',
    fullName: params.fullName ?? '',
    email: params.email ?? '',
    phone: params.phone ?? '',
    password: params.password ?? '',
  } as const
}

export function getOwnerWelcomeRegisterParams(params: Partial<OwnerVerificationParams>) {
  return getOwnerVerificationRegisterParams(params)
}
