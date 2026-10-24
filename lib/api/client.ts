import { getGoogleCalendarAuthError } from './google-calendar-errors'

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
  signal?: AbortSignal
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
  path.startsWith('/auth/') || path === '/users/me' ||
  path === '/mail/send-email' || path === '/mail/verify-code'

export function sanitizeAuthLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuthLog)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /password|passwd|token|secret|authorization|cookie|^code$|otp|verificationcode/i.test(key)
        ? '[OCULTO]'
        : sanitizeAuthLog(item),
    ]))
  }
  return value
}

// Read a clone so diagnostics never consume the response used by the app.
async function fetchWithAuthDiagnostics(
  baseUrl: string,
  path: string,
  init: RequestInit,
  debugLog?: (entry: ApiDebugLogEntry) => void,
): Promise<Response> {
  if (!shouldLogAuthDebug(path)) return fetch(`${baseUrl}${path}`, init)

  const startedAt = Date.now()
  const context = { method: init.method, baseUrl, path, finalUrl: `${baseUrl}${path}` }
  console.info('[API][auth][request]', {
    ...context,
    body: typeof init.body === 'string' ? sanitizeAuthLog(JSON.parse(init.body)) : undefined,
    hasAuthorization: !!(init.headers as Record<string, string>)?.Authorization,
  })
  debugLog?.({
    level: 'info',
    message: 'Peticion al backend: URL real y datos enviados (secretos ocultos).',
    details: { ...context, body: typeof init.body === 'string' ? sanitizeAuthLog(JSON.parse(init.body)) : undefined },
  })
  try {
    const response = await fetch(`${baseUrl}${path}`, init)
    let payload: unknown
    try {
      payload = sanitizeAuthLog(await response.clone().json())
    } catch {
      payload = '[Respuesta vacia o no JSON; contenido omitido]'
      debugLog?.({
        level: 'warning',
        message: 'El servidor no devolvio JSON valido. Puede ser una respuesta vacia, HTML de un proxy o un endpoint incorrecto; la app espera JSON.',
        details: { ...context, status: response.status, contentType: response.headers.get('content-type') },
      })
    }
    const details = {
      ...context,
      responseUrl: response.url || context.finalUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      requestId: response.headers.get('x-request-id'),
      durationMs: Date.now() - startedAt,
      body: payload,
    }
    if (response.ok) console.info('[API][auth][response]', details)
    else console.warn('[API][auth][response]', details)
    debugLog?.({
      level: response.ok ? 'success' : 'error',
      message: response.ok
        ? 'El servidor respondio exitosamente. Sigue validar que el contenido sirva para crear la sesion.'
        : response.status >= 500
          ? 'Fallo del servidor o infraestructura (HTTP 5xx). Revisa los logs del backend con esta URL y hora.'
          : response.status === 401 || response.status === 403
            ? 'El servidor rechazo la autenticacion o el acceso. Revisa credenciales y el mensaje recibido; esto no demuestra un fallo de la app.'
            : response.status === 404
              ? 'Ruta no encontrada. Revisa que la URL configurada y el endpoint coincidan con el backend desplegado.'
              : 'El servidor rechazo la peticion. Compara los datos enviados con el mensaje y las validaciones del backend.',
      details,
    })
    return response
  } catch (error) {
    debugLog?.({
      level: 'error',
      message: 'No se pudo completar la conexion o lectura de la respuesta. Sin respuesta HTTP no se puede culpar al backend: revisa internet, DNS, TLS, URL y disponibilidad (CORS si es web).',
      details: { ...context, durationMs: Date.now() - startedAt, reason: error instanceof Error ? error.message : String(error) },
    })
    console.error('[API][auth][network-error]', {
      ...context,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

const previewToken = (token?: string) =>
  token ? '[OCULTO]' : 'SIN_TOKEN'

type AuthTokenRefreshHandler = () => Promise<string | null>

let authTokenRefreshHandler: AuthTokenRefreshHandler | null = null
let authTokenRefreshPromise: Promise<string | null> | null = null
let lastRefreshInputToken: string | null = null
let lastRefreshOutputToken: string | null = null
const pendingJsonGetRequests = new Map<string, Promise<unknown>>()
const requestMonitor = new Map<string, { total: number; windowCount: number; windowStart: number }>()
const REQUEST_MONITOR_WINDOW_MS = 10_000
const REQUEST_MONITOR_WARNING_THRESHOLD = 3

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

function logRequestMonitor(
  source: 'json' | 'raw',
  baseUrl: string,
  path: string,
  method: HttpMethod,
  token?: string | null,
) {
  const now = Date.now()
  const key = `${method} ${baseUrl}${path}`
  const current = requestMonitor.get(key)
  const next = current && now - current.windowStart <= REQUEST_MONITOR_WINDOW_MS
    ? {
        total: current.total + 1,
        windowCount: current.windowCount + 1,
        windowStart: current.windowStart,
      }
    : {
        total: (current?.total ?? 0) + 1,
        windowCount: 1,
        windowStart: now,
      }

  requestMonitor.set(key, next)

  console.info('[API][request-monitor]', {
    source,
    method,
    path,
    total: next.total,
    windowCount: next.windowCount,
    windowSeconds: REQUEST_MONITOR_WINDOW_MS / 1000,
    tokenPreview: previewToken(token ?? undefined),
  })

  if (next.windowCount > REQUEST_MONITOR_WARNING_THRESHOLD) {
    console.warn('[API][request-loop-suspect]', {
      source,
      method,
      path,
      repeatedInWindow: next.windowCount,
      windowSeconds: REQUEST_MONITOR_WINDOW_MS / 1000,
      total: next.total,
    })
  }
}

// Google OAuth failures must not rotate the app session and restart its effects.
async function isGoogleCalendarAuthFailure(response: Response, baseUrl: string, path: string, method: HttpMethod) {
  if (response.ok || baseUrl !== API_URLS.CORE || !path.startsWith('/dates/')) return false
  let payload: unknown
  try {
    payload = await response.clone().json()
  } catch {
    return false
  }
  const code = getGoogleCalendarAuthError(payload)
  if (!code) return false
  console.info('[Google Calendar][oauth-rejected]', {
    timestamp: new Date().toISOString(),
    method,
    path,
    baseUrl,
    status: response.status,
    googleError: code,
    requestId: response.headers.get('x-request-id'),
    appSessionRefreshSkipped: true,
    diagnostic: code === 'unauthorized_client' || code === 'invalid_client'
      ? 'El backend reporta un rechazo del cliente OAuth. Revisar en el backend las credenciales desplegadas y el cliente que emitio el refresh token; esta respuesta no identifica la causa exacta.'
      : 'Google rechazo la autorizacion guardada. Revisar los logs OAuth del backend; puede requerir reconexion.',
  })
  return true
}

export async function fetchWithAuthRetry(
  baseUrl: string,
  path: string,
  options: AuthenticatedFetchOptions = {},
): Promise<Response> {
  const { method = 'GET', body, headers = {}, token } = options
  logRequestMonitor('raw', baseUrl, path, method, token)

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

  const googleAuthFailure = await isGoogleCalendarAuthFailure(response, baseUrl, path, method)
  const canRefreshAuth =
    !googleAuthFailure &&
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
function getJsonRequestDedupeKey(
  baseUrl: string,
  path: string,
  options: ApiClientOptions,
) {
  const method = options.method ?? 'GET'
  if (method !== 'GET' || options.body !== undefined || options.debugLog || options.signal) {
    return null
  }

  return JSON.stringify({
    baseUrl,
    path,
    token: options.token ?? null,
    headers: options.headers ?? {},
  })
}

export async function apiClient<T>(
  baseUrl: string,
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const dedupeKey = getJsonRequestDedupeKey(baseUrl, path, options)
  if (!dedupeKey) return apiClientRequest<T>(baseUrl, path, options)

  const pendingRequest = pendingJsonGetRequests.get(dedupeKey)
  if (pendingRequest) {
    console.info('[API][deduped-get]', { path, baseUrl })
    return pendingRequest as Promise<T>
  }

  const request = apiClientRequest<T>(baseUrl, path, options).finally(() => {
    pendingJsonGetRequests.delete(dedupeKey)
  })
  pendingJsonGetRequests.set(dedupeKey, request)
  return request
}

async function apiClientRequest<T>(
  baseUrl: string,
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token, debugLog, signal } = options
  logRequestMonitor('json', baseUrl, path, method, token)

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

  let response: Response
  try {
    response = await fetchWithAuthDiagnostics(baseUrl, path, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    }, debugLog)
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

  if (!response.ok) {
    const googleAuthFailure = await isGoogleCalendarAuthFailure(response, baseUrl, path, method)
    const canRefreshAuth =
      !googleAuthFailure &&
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
        const retryResponse = await fetchWithAuthDiagnostics(baseUrl, path, {
          method,
          headers: buildRequestHeaders(refreshedToken),
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        }, debugLog)

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
      details = sanitizeAuthLog(await response.clone().json())
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
