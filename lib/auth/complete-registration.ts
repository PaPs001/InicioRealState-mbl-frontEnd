import { getCurrentUser, loginUser } from '@/lib/api/endpoints/auth'
import type { BackendCurrentUser } from '@/lib/api/endpoints/auth'
import { registerUser } from '@/lib/registerUser'
import type { RegisterRequest, User } from '@/lib/types'

type SetAuthSession = (user: User | BackendCurrentUser | null, token: string | null) => Promise<void>

export type CompleteRegistrationResult =
  | {
      success: true
      user: User | null
      accessToken: string
    }
  | {
      success: false
      error: string
    }

export async function completeRegistrationAndLogin(
  data: RegisterRequest,
  setAuthSession: SetAuthSession
): Promise<CompleteRegistrationResult> {
  try {
    console.log('[auth][complete-registration] start', {
      email: data.email.trim().toLowerCase(),
      role: data.role,
      clientProfile: data.clientProfile,
      hasPhone: !!data.phone?.trim(),
      passwordLength: data.password.length,
    })

    const response = await registerUser(data)
    console.log('[auth][complete-registration] register result', {
      success: response.success,
      message: response.message,
      error: response.error ?? null,
      userId: response.user?.id ?? null,
      userEmail: response.user?.email ?? null,
      userSystemRole: response.user?.systemRole ?? null,
      userClientProfile: response.user?.clientProfile ?? null,
    })

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'No se pudo completar el registro',
      }
    }

    const loginResponse = await loginUser({
      email: data.email,
      password: data.password,
    })
    console.log('[auth][complete-registration] login result', {
      success: loginResponse.success,
      message: loginResponse.message,
      error: loginResponse.error ?? null,
      hasAccessToken: !!loginResponse.accessToken,
      hasRefreshToken: !!loginResponse.refreshToken,
    })

    if (!loginResponse.success || !loginResponse.accessToken) {
      return {
        success: false,
        error: loginResponse.error || 'No se pudo iniciar sesion despues del registro',
      }
    }

    const sessionUser = await getCurrentUser(loginResponse.accessToken).catch((error) => {
      console.error('[auth][complete-registration] getCurrentUser failed', error)
      return response.user ?? null
    })

    console.log('[auth][complete-registration] setAuthSession start', {
      email: sessionUser?.email ?? response.user?.email ?? data.email.trim().toLowerCase(),
    })
    await setAuthSession(sessionUser, loginResponse.accessToken)
    console.log('[auth][complete-registration] setAuthSession done')

    return {
      success: true,
      user: response.user ?? null,
      accessToken: loginResponse.accessToken,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
