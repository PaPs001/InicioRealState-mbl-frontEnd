/**
 * Cliente HTTP centralizado para todas las llamadas a la API
 * Maneja errores, headers y configuracion base
 */

// URLs base de las APIs
export const API_URLS = {
  CORE: 'https://core-api-smoky-ten.vercel.app',
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
}

/**
 * Extrae el mensaje de error de una respuesta fallida
 */
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

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response)
    const error: ApiError = {
      message: errorMessage,
      status: response.status,
    }
    throw error
  }

  return response.json() as Promise<T>
}

/**
 * Cliente para la API Core (auth, usuarios, propiedades de usuario)
 */
export async function coreApi<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(API_URLS.CORE, path, options)
}

/**
 * Cliente para la API de Notificaciones (catalogo de propiedades)
 */
export async function notificationsApi<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(API_URLS.NOTIFICATIONS, path, options)
}
