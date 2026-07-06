import { completeRegistrationAndLogin } from '@/lib/auth/complete-registration'
import type { BackendCurrentUser } from '@/lib/api/endpoints/auth'
import type { BackendUserRole, User } from '@/lib/types'
import type { RegisterClientType } from './register-entry'

type SetAuthSession = (user: User | BackendCurrentUser | null, token: string | null) => Promise<void>

export type RegisterByClientTypeInput = {
  clientType: RegisterClientType
  email: string
  fullName: string
  password: string
  phone: string
  emailVerificationToken?: string
  propertyProfile?: string
  primaryInterest?: string
  priority?: string
  preferredChannel?: string
  platformNotification?: string
  registrationNotes?: string
}

type RegistrationBackendProfile = {
  roles: BackendUserRole[]
  investment: boolean
  tenant: boolean
}

const registrationHomeRoutes: Record<RegisterClientType, string> = {
  advisor: '/userAdviser',
  owner: '/registration-complete',
  renter: '/registration-complete',
  tenant: '/registration-complete',
}

const registrationBackendProfiles: Record<RegisterClientType, RegistrationBackendProfile> = {
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

export function getRegistrationHomeRoute(clientType: RegisterClientType) {
  return registrationHomeRoutes[clientType] as never
}

export function getRegistrationBackendProfile(clientType: RegisterClientType) {
  return registrationBackendProfiles[clientType]
}

function buildRegistrationAboutUser(input: RegisterByClientTypeInput) {
  const aboutUser = {
    clientType: input.clientType,
    propertyProfile: input.propertyProfile?.trim(),
    primaryInterest: input.primaryInterest?.trim(),
    priority: input.priority?.trim(),
    preferredChannel: input.preferredChannel?.trim(),
    platformNotification: input.platformNotification?.trim(),
    registrationNotes: input.registrationNotes?.trim(),
  }

  return Object.fromEntries(
    Object.entries(aboutUser).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export async function registerUserByClientType(
  input: RegisterByClientTypeInput,
  setAuthSession: SetAuthSession,
) {
  const profile = getRegistrationBackendProfile(input.clientType)
  const emailVerificationToken = input.emailVerificationToken?.trim()

  if (!emailVerificationToken) {
    return {
      success: false,
      error: 'Primero debes verificar el codigo enviado a tu correo.',
    } as const
  }

  return completeRegistrationAndLogin(
    {
      name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: null,
      password: input.password,
      emailVerificationToken,
      roles: profile.roles,
      investment: profile.investment,
      tenant: profile.tenant,
      aboutUser: buildRegistrationAboutUser(input),
    },
    setAuthSession,
  )
}
