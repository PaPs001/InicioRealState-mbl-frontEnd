export const API_URLS = {
  CORE: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? 'https://core-api-smoky-ten.vercel.app',
  NOTIFICATIONS: 'https://inicio-notifications-service.vercel.app',
} as const

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiClientOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  token?: string
}

interface ApiError {
  message: string
  status: number
  error?: string
  path?: string
  details?: unknown
}

const shouldLogApiDebug = (path: string) =>
  path.startsWith('/dates/') || path.includes('/dates/')

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json() as { message?: string; error?: string }
    return data.message || data.error || `Error ${response.status}`
  } catch {
    return `Error ${response.status}: ${response.statusText}`
  }
}

/**
 * Cliente generico para llamadas a la API
 * @param baseUrl - URL base de la API
 * @param path - Ruta del endpoint
 * @param options - Opciones de la peticion
 */
export async function apiClient<T>(
  baseUrl: string,
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (baseUrl.includes('ngrok-free')) {
    requestHeaders['ngrok-skip-browser-warning'] = 'true'
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (shouldLogApiDebug(path)) {
    console.info('[API][dates] response', {
      method,
      path,
      baseUrl,
      status: response.status,
      ok: response.ok,
    })
  }

  if (!response.ok) {
    let details: unknown
    try {
      details = await response.clone().json()
    } catch {
      details = undefined
    }
    const errorMessage = await extractErrorMessage(response)
    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      path,
      details,
    }
    if (shouldLogApiDebug(path)) {
      console.warn('[API][dates] error response', {
        method,
        path,
        baseUrl,
        status: response.status,
        message: errorMessage,
        details,
      })
    }
    throw error
  }

  return response.json() as Promise<T>
}

export async function coreApi<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(API_URLS.CORE, path, options)
}

export async function notificationsApi<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(API_URLS.NOTIFICATIONS, path, options)
}
