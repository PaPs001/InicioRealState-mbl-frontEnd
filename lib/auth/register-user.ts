import { apiFetch } from '@/lib/shared/api-fetch'

export async function registerUser(body: unknown) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body,
  })
}
