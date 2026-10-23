import { loginUser, registerUser } from '@/lib/api/endpoints/auth'
import type { RegisterRequest, User } from '@/lib/types'

type SetAuthSession = (user: User | null, token: string | null, refreshToken?: string | null) => Promise<void>

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
    const response = await registerUser(data)

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

    if (!loginResponse.success || !loginResponse.accessToken) {
      return {
        success: false,
        error: loginResponse.error || 'No se pudo iniciar sesion despues del registro',
      }
    }

    const sessionUser = loginResponse.user ?? response.user ?? null

    await setAuthSession(sessionUser, loginResponse.accessToken, loginResponse.refreshToken ?? null)

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
