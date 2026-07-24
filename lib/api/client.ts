const DEFAULT_CORE_API_URL = 'https://core-api-smoky-ten.vercel.app'

export const API_URLS = {
  CORE: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_CORE_API_URL,
  NOTIFICATIONS: 'https://inicio-notifications-service.vercel.app',
} as const

export const API_BUILD_CONFIG = {
  expoPublicApiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? null,
  resolvedCoreUrl: API_URLS.CORE,
  fallbackCoreUrl: DEFAULT_CORE_API_URL,
  notificationsUrl: API_URLS.NOTIFICATIONS,
} as const

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiClientOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  token?: string
  debugLog?: (entry: ApiDebugLogEntry) => void
}

interface ApiError {
  message: string
  status: number
  error?: string
  path?: string
  details?: unknown
}

type AuthenticatedFetchOptions = {
  method?: HttpMethod
  body?: RequestInit['body']
  headers?: Record<string, string>
  token?: string | null
}

export type ApiDebugLogEntry = {
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  details?: Record<string, unknown>
}

const shouldLogApiDebug = (path: string) =>
  path.startsWith('/dates/') || path.includes('/dates/')

const shouldLogAuthDebug = (path: string) =>
  path.startsWith('/auth/') || path === '/users/me'

const previewToken = (token?: string) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

type AuthTokenRefreshHandler = () => Promise<string | null>

let authTokenRefreshHandler: AuthTokenRefreshHandler | null = null
let authTokenRefreshPromise: Promise<string | null> | null = null
let lastRefreshInputToken: string | null = null
let lastRefreshOutputToken: string | null = null

export function setAuthTokenRefreshHandler(handler: AuthTokenRefreshHandler | null) {
  authTokenRefreshHandler = handler
  if (!handler) {
    lastRefreshInputToken = null
    lastRefreshOutputToken = null
  }
}

async function refreshAuthTokenOnce(expiredToken?: string | null): Promise<string | null> {
  if (expiredToken && expiredToken === lastRefreshInputToken && lastRefreshOutputToken) {
    return lastRefreshOutputToken
  }

  if (!authTokenRefreshHandler) return null

  if (!authTokenRefreshPromise) {
    const refreshInputToken = expiredToken ?? null
    authTokenRefreshPromise = authTokenRefreshHandler()
      .then((refreshedToken) => {
        if (refreshedToken) {
          lastRefreshInputToken = refreshInputToken
          lastRefreshOutputToken = refreshedToken
        }

        return refreshedToken
      })
      .finally(() => {
        authTokenRefreshPromise = null
      })
  }

  return authTokenRefreshPromise
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json() as { message?: string; error?: string }
    return data.message || data.error || `Error ${response.status}`
  } catch {
    return `Error ${response.status}: ${response.statusText}`
  }
}

export async function fetchWithAuthRetry(
  baseUrl: string,
  path: string,
  options: AuthenticatedFetchOptions = {},
): Promise<Response> {
  const { method = 'GET', body, headers = {}, token } = options

  const buildHeaders = (requestToken?: string | null): Record<string, string> => {
    const requestHeaders: Record<string, string> = { ...headers }

    if (baseUrl.includes('ngrok-free')) {
      requestHeaders['ngrok-skip-browser-warning'] = 'true'
    }

    if (requestToken) {
      requestHeaders.Authorization = `Bearer ${requestToken}`
    }

    return requestHeaders
  }

  let response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: buildHeaders(token),
    body,
  })

  const canRefreshAuth =
    response.status === 401 &&
    !!token &&
    baseUrl === API_URLS.CORE &&
    path !== '/auth/refresh'

  if (!canRefreshAuth) return response

  console.info('[API][auth-refresh] 401 received in raw fetch, trying shared refresh', {
    method,
    path,
    baseUrl,
    tokenPreview: previewToken(token ?? undefined),
  })

  const refreshedToken = await refreshAuthTokenOnce(token)
  if (!refreshedToken) return response

  response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: buildHeaders(refreshedToken),
    body,
  })

  console.info('[API][auth-refresh] raw fetch retry response', {
    method,
    path,
    baseUrl,
    status: response.status,
    ok: response.ok,
  })

  return response
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
  const { method = 'GET', body, headers = {}, token, debugLog } = options

  const buildRequestHeaders = (requestToken?: string | null): Record<string, string> => {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (baseUrl.includes('ngrok-free')) {
      requestHeaders['ngrok-skip-browser-warning'] = 'true'
    }

    if (requestToken) {
      requestHeaders['Authorization'] = `Bearer ${requestToken}`
    }

    return requestHeaders
  }

  const requestHeaders = buildRequestHeaders(token)

  if (shouldLogAuthDebug(path)) {
    debugLog?.({
      level: 'info',
      message: 'La app va a llamar al backend de autenticacion.',
      details: {
        method,
        path,
        baseUrl,
        finalUrl: `${baseUrl}${path}`,
        hasToken: !!token,
        hasNgrokBypass: requestHeaders['ngrok-skip-browser-warning'] === 'true',
        bodyKeys: body && typeof body === 'object' ? Object.keys(body as Record<string, unknown>) : [],
      },
    })
    console.info('[API][auth] request', {
      method,
      path,
      baseUrl,
      finalUrl: `${baseUrl}${path}`,
      hasToken: !!token,
      tokenPreview: previewToken(token),
      hasNgrokBypass: requestHeaders['ngrok-skip-browser-warning'] === 'true',
      bodyKeys: body && typeof body === 'object' ? Object.keys(body as Record<string, unknown>) : [],
    })
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (shouldLogAuthDebug(path)) {
      debugLog?.({
        level: 'error',
        message: 'El telefono no pudo conectarse al backend. Revisa internet, la URL de API y si el servidor acepta conexiones desde iPhone.',
        details: {
          method,
          path,
          baseUrl,
          finalUrl: `${baseUrl}${path}`,
          reason: error instanceof Error ? error.message : String(error),
        },
      })
    }
    throw error
  }

  if (shouldLogAuthDebug(path)) {
    debugLog?.({
      level: response.ok ? 'success' : 'warning',
      message: response.ok
        ? 'El backend respondio a la solicitud de login.'
        : 'El backend respondio, pero rechazo la solicitud de login.',
      details: {
        method,
        path,
        baseUrl,
        finalUrl: `${baseUrl}${path}`,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      },
    })
    console.info('[API][auth] response', {
      method,
      path,
      baseUrl,
      finalUrl: `${baseUrl}${path}`,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    })
  }

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
    const canRefreshAuth =
      response.status === 401 &&
      !!token &&
      baseUrl === API_URLS.CORE &&
      path !== '/auth/refresh'

    if (canRefreshAuth) {
      console.info('[API][auth-refresh] 401 received, trying a single shared refresh', {
        method,
        path,
        baseUrl,
        tokenPreview: previewToken(token),
      })

      const refreshedToken = await refreshAuthTokenOnce(token)

      if (refreshedToken) {
        const retryResponse = await fetch(`${baseUrl}${path}`, {
          method,
          headers: buildRequestHeaders(refreshedToken),
          body: body !== undefined ? JSON.stringify(body) : undefined,
        })

        console.info('[API][auth-refresh] retry response', {
          method,
          path,
          baseUrl,
          status: retryResponse.status,
          ok: retryResponse.ok,
        })

        if (retryResponse.ok) {
          return retryResponse.json() as Promise<T>
        }

        response = retryResponse
      }
    }

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
    if (shouldLogAuthDebug(path)) {
      debugLog?.({
        level: 'error',
        message: 'La API devolvio un error HTTP; el mensaje viene del backend.',
        details: {
          method,
          path,
          baseUrl,
          finalUrl: `${baseUrl}${path}`,
          status: response.status,
          message: errorMessage,
          details,
        },
      })
      console.warn('[API][auth] error response', {
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
