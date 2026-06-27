import { completeRegistrationAndLogin } from '@/lib/auth/complete-registration'
import type { BackendCurrentUser } from '@/lib/api/endpoints/auth'
import type { User } from '@/lib/types'

type SetAuthSession = (user: User | BackendCurrentUser | null, token: string | null) => Promise<void>

type BaseRegistrationInput = {
  email: string
  password: string
  phone: string
}

type BuyerRegistrationInput = BaseRegistrationInput & {
  name: string
  searchType?: 'buy' | 'rent' | ''
}

type OwnerRegistrationInput = BaseRegistrationInput & {
  fullName: string
}

type RenterRegistrationInput = BaseRegistrationInput & {
  fullName: string
}

type AdvisorRegistrationInput = BaseRegistrationInput & {
  firstName: string
  lastName: string
}

export async function registerBuyer(
  input: BuyerRegistrationInput,
  setAuthSession: SetAuthSession,
) {
  return completeRegistrationAndLogin(
    {
      name: input.name,
      email: input.email,
      phone: input.phone,
      country: null,
      password: input.password,
      roles: ['CLIENT'],
      investment: false,
      tenant: false,
    },
    setAuthSession,
  )
}

export async function registerOwner(
  input: OwnerRegistrationInput,
  setAuthSession: SetAuthSession,
) {
  return completeRegistrationAndLogin(
    {
      name: input.fullName.trim(),
      email: input.email,
      phone: input.phone,
      country: null,
      password: input.password,
      roles: ['CLIENT'],
      investment: true,
      tenant: false,
    },
    setAuthSession,
  )
}

export async function registerRenter(
  input: RenterRegistrationInput,
  setAuthSession: SetAuthSession,
) {
  return completeRegistrationAndLogin(
    {
      name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: null,
      password: input.password,
      roles: ['CLIENT'],
      investment: false,
      tenant: true,
    },
    setAuthSession,
  )
}

export async function registerAdvisor(
  input: AdvisorRegistrationInput,
  setAuthSession: SetAuthSession,
) {
  return completeRegistrationAndLogin(
    {
      name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: null,
      password: input.password,
      roles: ['AGENT'],
      investment: false,
      tenant: false,
    },
    setAuthSession,
  )
}
