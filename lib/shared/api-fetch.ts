const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? ''

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function extractApiError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { message?: string; error?: string }
    return data.message || data.error || `Error en la peticion: ${response.status}`
  } catch {
    try {
      const text = await response.text()
      return text || `Error en la peticion: ${response.status}`
    } catch {
      return `Error en la peticion: ${response.status}`
    }
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const apiMessage = await extractApiError(response)
    throw new Error(`${response.status}: ${apiMessage}`)
  }

  return response.json() as Promise<T>
}
