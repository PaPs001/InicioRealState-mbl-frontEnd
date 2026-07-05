import { loginUser } from '@/lib/api/endpoints/auth'
import type { BackendUser } from '@/lib/services/auth-session'
import type { ApiDebugLogEntry } from '@/lib/api/client'

export type CredentialLoginResult = {
  user: BackendUser
  token: string
}

export async function signInWithCredentials(
  email: string,
  password: string,
  debugLog?: (entry: ApiDebugLogEntry) => void
): Promise<CredentialLoginResult> {
  const loginResponse = await loginUser({
    email,
    password,
  }, debugLog)

  const token = loginResponse.accessToken ?? null
  const user = loginResponse.user ?? null

  if (!token || !user) {
    debugLog?.({
      level: 'error',
      message: 'El login termino sin una sesion usable para guardar en el telefono.',
      details: {
        success: loginResponse.success,
        message: loginResponse.message,
        error: loginResponse.error ?? null,
        hasToken: !!token,
        hasUser: !!user,
      },
    })
    throw new Error(loginResponse.error || 'La API no devolvio un token de sesion')
  }

  debugLog?.({
    level: 'success',
    message: 'Login validado por la API. Sigue guardar la sesion local.',
    details: {
      emailAttempt: email.trim().toLowerCase(),
      userId: user.id,
      role: user.systemRole,
      investment: user.investment,
      tenant: user.tenant,
      tokenPreview: token.slice(0, 12),
    },
  })

  console.info('[auth][login-session][frontend]', {
    emailAttempt: email.trim().toLowerCase(),
    user,
    tokenPreview: token.slice(0, 16),
  })

  return {
    user: user as BackendUser,
    token,
  }
}
