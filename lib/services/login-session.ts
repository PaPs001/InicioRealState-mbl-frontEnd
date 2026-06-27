import { loginUser } from '@/lib/api/endpoints/auth'
import type { BackendUser } from '@/lib/services/auth-session'

export type CredentialLoginResult = {
  user: BackendUser
  token: string
}

export async function signInWithCredentials(email: string, password: string): Promise<CredentialLoginResult> {
  const loginResponse = await loginUser({
    email,
    password,
  })

  const token = loginResponse.accessToken ?? null
  const user = loginResponse.user ?? null

  if (!token || !user) {
    throw new Error(loginResponse.error || 'La API no devolvio un token de sesion')
  }

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
