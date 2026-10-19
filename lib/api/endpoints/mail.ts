import { coreApi } from '../client'
import type { BackendUserRole } from '@/lib/types'
import type { RegisterClientType } from '@/lib/services/register-entry'

export type SendRegistrationVerificationEmailInput = {
  clientType: RegisterClientType
  fullName: string
  email: string
  phone: string
  password: string
}

export type SendRegistrationVerificationEmailResponse = {
  ok: boolean
  email: string
  expiresAt?: string
  delivery?: {
    provider: string
    delivered: boolean
    data?: unknown
  }
}

export type VerifyRegistrationEmailCodeInput = {
  email: string
  code: string
}

export type VerifyRegistrationEmailCodeResponse = {
  ok: boolean
  email: string
  emailVerificationToken: string
}

const registrationBackendProfiles: Record<RegisterClientType, {
  roles: BackendUserRole[]
  investment: boolean
  tenant: boolean
}> = {
  advisor: {
    roles: ['AGENT'],
    investment: false,
    tenant: false,
  },
  owner: {
    roles: ['CLIENT'],
    investment: true,
    tenant: false,
  },
  renter: {
    roles: ['CLIENT'],
    investment: false,
    tenant: true,
  },
  tenant: {
    roles: ['CLIENT'],
    investment: false,
    tenant: false,
  },
}

export async function sendRegistrationVerificationEmail(
  input: SendRegistrationVerificationEmailInput,
) {
  const profile = registrationBackendProfiles[input.clientType]

  return coreApi<SendRegistrationVerificationEmailResponse>('/mail/send-email', {
    method: 'POST',
    body: {
      clientType: input.clientType,
      name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      password: input.password,
      roles: profile.roles,
      investment: profile.investment,
      tenant: profile.tenant,
      aboutUser: {
        clientType: input.clientType,
      },
    },
  })
}

export async function verifyRegistrationEmailCode(
  input: VerifyRegistrationEmailCodeInput,
) {
  return coreApi<VerifyRegistrationEmailCodeResponse>('/mail/verify-code', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      code: input.code,
    },
  })
}
