/**
 * Endpoints de autenticacion y usuarios
 */

import { API_BUILD_CONFIG, API_URLS, coreApi, fetchWithAuthRetry, type ApiDebugLogEntry } from '../client'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
  BackendUserRole,
} from '@/lib/types'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const apiError = error as { message?: string; error?: string }
    return apiError.message || apiError.error || fallback
  }

  return fallback
}

export type BackendProfileImagePayload = {
  image: {
    uri: string
    name: string
    type: string
  }
}

export type UploadImageDocumentType = 'profilephoto' | 'agentpresentation'

export type UploadProfileImageResponse = {
  url: string
  key?: string
  filename?: string
  storageKey?: string
  contentType?: string
  size?: number
  originalName?: string
  documentType?: string
  status?: string
}

export type UploadedFilesResponse = {
  userId?: string
  files?: Record<string, unknown>
}

export type BackendCurrentUser = {
  _id?: string
  id?: string
  email: string
  name: string
  phone?: string
  country?: string
  role?: BackendUserRole
  roles?: BackendUserRole[]
  permissions?: string[]
  investment?: boolean
  tenant?: boolean
  avatar?: string
  profilePhotoKey?: string
  agentPresentationKey?: string
  agentpresentation?: boolean
  agentPresentation?: boolean
  agentLeadNotion?: {
    name: string
    status: boolean
  }
  files?: Record<string, unknown>
}

function getBackendProfilePhotoKey(user?: BackendCurrentUser): string | undefined {
  if (typeof user?.profilePhotoKey === 'string' && user.profilePhotoKey.length > 0) {
    return user.profilePhotoKey
  }

  const profilePhoto = user?.files?.profilephoto
  if (!profilePhoto || typeof profilePhoto !== 'object' || Array.isArray(profilePhoto)) {
    return undefined
  }

  const file = profilePhoto as Record<string, unknown>
  const key = [file.key, file.storageKey]
    .find(value => typeof value === 'string' && value.length > 0)

  return typeof key === 'string' ? key : undefined
}

function getBackendAgentPresentationKey(user?: BackendCurrentUser): string | undefined {
  if (typeof user?.agentPresentationKey === 'string' && user.agentPresentationKey.length > 0) {
    return user.agentPresentationKey
  }

  const presentation = user?.files?.agentpresentation
  if (!presentation || typeof presentation !== 'object' || Array.isArray(presentation)) {
    return undefined
  }

  const file = presentation as Record<string, unknown>
  const key = [file.key, file.storageKey]
    .find(value => typeof value === 'string' && value.length > 0)

  return typeof key === 'string' ? key : undefined
}

function mapBackendRolesToSystemRole(roles?: BackendUserRole[], role?: BackendUserRole): BackendUserRole {
  if (roles?.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (roles?.includes('COORDINATOR')) {
    return 'COORDINATOR'
  }

  if (roles?.includes('AGENT')) {
    return 'AGENT'
  }

  return role ?? 'CLIENT'
}

function mapBackendAuthUser(user?: BackendCurrentUser): User | undefined {
  if (!user) return undefined

  const roles = user.roles ?? (user.role ? [user.role] : ['CLIENT'])
  const resolvedId = user.id ?? user._id ?? ''

  console.info('[auth][map-user]', {
    rawKeys: Object.keys(user),
    rawId: user.id ?? null,
    rawMongoId: user._id ?? null,
    resolvedId,
    email: user.email ?? null,
    role: user.role ?? null,
    roles,
    hasPermissions: Array.isArray(user.permissions),
    investment: user.investment ?? null,
    tenant: user.tenant ?? null,
  })

  return {
    id: resolvedId,
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    country: user.country ?? null,
    systemRole: mapBackendRolesToSystemRole(roles, user.role),
    roles,
    investment: user.investment ?? false,
    tenant: user.tenant ?? false,
    permissions: user.permissions,
    avatar: user.avatar,
    profilePhotoKey: getBackendProfilePhotoKey(user),
    agentPresentationKey: getBackendAgentPresentationKey(user),
    agentpresentation: Boolean(user.agentpresentation ?? user.agentPresentation),
    agentLeadNotion: user.agentLeadNotion,
    createdAt: new Date().toISOString(),
  }
}

type RegisterApiPayload =
  | User
  | {
      user?: User
      data?: User | { user?: User }
      message?: string
    }

type LoginApiPayload = {
  accessToken?: string
  refreshToken?: string
  investment?: boolean
  tenant?: boolean
  roles?: BackendUserRole[] | BackendUserRole
  agentpresentation?: boolean
  agentPresentation?: boolean
  agentLeadNotion?: {
    name: string
    status: boolean
  }
  user?: BackendCurrentUser
  data?: {
    accessToken?: string
    refreshToken?: string
    investment?: boolean
    tenant?: boolean
    roles?: BackendUserRole[] | BackendUserRole
    agentpresentation?: boolean
    agentPresentation?: boolean
    agentLeadNotion?: {
      name: string
      status: boolean
    }
    user?: BackendCurrentUser
  }
}

function extractRegisteredUser(payload: RegisterApiPayload): User | undefined {
  if ('id' in payload && 'email' in payload) {
    return mapBackendAuthUser(payload as BackendCurrentUser)
  }

  if (payload.user) {
    return mapBackendAuthUser(payload.user as BackendCurrentUser)
  }

  if (payload.data && 'id' in payload.data && 'email' in payload.data) {
    return mapBackendAuthUser(payload.data as BackendCurrentUser)
  }

  return mapBackendAuthUser(payload.data?.user as BackendCurrentUser | undefined)
}

function extractLoginAccessToken(payload: LoginApiPayload): string | undefined {
  return payload.accessToken ?? payload.data?.accessToken
}

function extractLoginRefreshToken(payload: LoginApiPayload): string | undefined {
  return payload.refreshToken ?? payload.data?.refreshToken
}

function extractLoginUser(payload: LoginApiPayload): BackendCurrentUser | undefined {
  const rawUser = payload.user ?? payload.data?.user
  if (!rawUser) return undefined

  // Extract agentLeadNotion from root or data level
  const agentLeadNotion = payload.agentLeadNotion ?? payload.data?.agentLeadNotion ?? rawUser.agentLeadNotion

  const presentationValue = Boolean(
    rawUser.agentpresentation ??
      rawUser.agentPresentation ??
      payload.agentpresentation ??
      payload.agentPresentation ??
      payload.data?.agentpresentation ??
      payload.data?.agentPresentation ??
      false,
  )

  return {
    ...rawUser,
    agentpresentation: presentationValue,
    agentPresentation: presentationValue,
    agentLeadNotion,
  }
}

const previewToken = (token?: string) =>
  token ? `${token.slice(0, 12)}...${token.slice(-6)}` : 'SIN_TOKEN'

function describeToken(token?: string) {
  return token
    ? {
        present: true,
        type: typeof token,
        length: token.length,
        preview: previewToken(token),
      }
    : {
        present: false,
        type: 'undefined',
        length: 0,
        preview: 'SIN_TOKEN',
      }
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) return 'array'
  if (value === null) return 'null'
  return typeof value
}

function sanitizeLoginPayload(payload: LoginApiPayload) {
  return {
    root: {
      keys: Object.keys(payload),
      accessToken: describeToken(payload.accessToken),
      refreshToken: describeToken(payload.refreshToken),
      hasUser: !!payload.user,
      userKeys: payload.user ? Object.keys(payload.user) : [],
      user: payload.user ?? null,
      investment: payload.investment ?? null,
      tenant: payload.tenant ?? null,
      roles: payload.roles ?? null,
    },
    data: payload.data
      ? {
          keys: Object.keys(payload.data),
          accessToken: describeToken(payload.data.accessToken),
          refreshToken: describeToken(payload.data.refreshToken),
          hasUser: !!payload.data.user,
          userKeys: payload.data.user ? Object.keys(payload.data.user) : [],
          user: payload.data.user ?? null,
        }
      : null,
  }
}

function compareLoginContract(payload: LoginApiPayload) {
  const accessToken = extractLoginAccessToken(payload)
  const refreshToken = extractLoginRefreshToken(payload)
  const rawUser = extractLoginUser(payload)

  return {
    expectedContractName: 'CredentialLoginResult desde /auth/login',
    expectedShape: {
      accessToken: 'string requerido',
      refreshToken: 'string opcional',
      user: {
        id: 'string requerido, o _id usable',
        email: 'string esperado',
        name: 'string esperado',
        role: 'CLIENT | AGENT | COORDINATOR | ADMIN opcional',
        roles: 'array opcional',
        investment: 'boolean opcional',
        tenant: 'boolean opcional',
      },
    },
    receivedShape: {
      accessToken: {
        present: !!accessToken,
        source: payload.accessToken ? 'root.accessToken' : payload.data?.accessToken ? 'data.accessToken' : 'missing',
        type: getValueType(accessToken),
      },
      refreshToken: {
        present: !!refreshToken,
        source: payload.refreshToken ? 'root.refreshToken' : payload.data?.refreshToken ? 'data.refreshToken' : 'missing',
        type: getValueType(refreshToken),
      },
      user: {
        present: !!rawUser,
        source: payload.user ? 'root.user' : payload.data?.user ? 'data.user' : 'missing',
        type: getValueType(rawUser),
        keys: rawUser ? Object.keys(rawUser) : [],
      },
    },
    missingRequiredFields: [
      !accessToken ? 'accessToken' : null,
      !rawUser ? 'user' : null,
    ].filter(Boolean),
    extraRootFields: Object.keys(payload).filter(key => !['accessToken', 'refreshToken', 'user', 'data'].includes(key)),
  }
}

export async function getCurrentUser(token: string): Promise<BackendCurrentUser> {
  return coreApi<BackendCurrentUser>('/users/me', {
    method: 'GET',
    token,
  })
}

export function validateRegistrationData(data: RegisterRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres')
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('El correo electronico es invalido')
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push('El telefono debe tener al menos 10 digitos')
  }

  if (!data.password || data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
    errors.push('La contrasena debe tener al menos 8 caracteres e incluir letras y numeros')
  }

  if (!Array.isArray(data.roles) || data.roles.length !== 1 || !['CLIENT', 'AGENT', 'COORDINATOR'].includes(data.roles[0])) {
    errors.push('El rol de usuario es invalido')
  }

  return { valid: errors.length === 0, errors }
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const validation = validateRegistrationData(data)
    if (!validation.valid) {
      return {
        success: false,
        message: 'Datos de registro invalidos',
        error: validation.errors.join(', ')
      }
    }

    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      country: data.country?.trim() || null,
      password: data.password,
      emailVerificationToken: data.emailVerificationToken,
      roles: data.roles,
      investment: data.investment,
      tenant: data.tenant,
      aboutUser: data.aboutUser,
    }

    console.log('[auth][register] payload', payload)

    const result = await coreApi<RegisterApiPayload>('/auth/register', {
      method: 'POST',
      body: payload
    })

    const user = extractRegisteredUser(result)

    console.log('[auth][register] response', result)

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user
    }
  } catch (error) {
    console.error('Error en registerUser:', error)
    return {
      success: false,
      message: 'Error al registrar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function loginUser(
  data: LoginRequest,
  debugLog?: (entry: ApiDebugLogEntry) => void
): Promise<LoginResponse> {
  try {
    if (!data.email || !data.password) {
      debugLog?.({
        level: 'warning',
        message: 'No se envio el login porque faltan email o contrasena.',
        details: {
          hasEmail: !!data.email,
          hasPassword: !!data.password,
        },
      })
      return {
        success: false,
        message: 'Email y contraseña son requeridos',
        error: 'Datos incompletos'
      }
    }

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    }

    console.log('[auth][login] payload', {
      email: payload.email,
      passwordLength: payload.password.length,
    })
    debugLog?.({
      level: 'info',
      message: 'Credenciales listas para enviar. La contrasena no se muestra, solo su longitud.',
      details: {
        email: payload.email,
        passwordLength: payload.password.length,
      },
    })
    debugLog?.({
      level: 'info',
      message: 'Contrato de login esperado por este build antes de llamar al backend.',
      details: {
        apiBuildConfig: API_BUILD_CONFIG,
        endpoint: '/auth/login',
        expectedContract: compareLoginContract({}),
      },
    })

    const result = await coreApi<LoginApiPayload>('/auth/login', {
      method: 'POST',
      body: payload,
      debugLog,
    })

    const contractComparison = compareLoginContract(result)
    debugLog?.({
      level: contractComparison.missingRequiredFields.length ? 'warning' : 'success',
      message: contractComparison.missingRequiredFields.length
        ? 'Comparacion del contrato: la respuesta no coincide con lo que la app esperaba.'
        : 'Comparacion del contrato: la respuesta coincide con lo que la app esperaba.',
      details: contractComparison,
    })
    debugLog?.({
      level: 'info',
      message: 'Datos reales recibidos desde /auth/login, sanitizados para mostrar en pantalla.',
      details: sanitizeLoginPayload(result),
    })
    debugLog?.({
      level: 'info',
      message: 'La API respondio JSON; revisando si trae token y usuario.',
      details: {
        rootKeys: Object.keys(result),
        dataKeys: result.data ? Object.keys(result.data) : [],
        hasRootAccessToken: !!result.accessToken,
        hasRootRefreshToken: !!result.refreshToken,
        hasDataAccessToken: !!result.data?.accessToken,
        hasDataRefreshToken: !!result.data?.refreshToken,
        hasRootUser: !!result.user,
        hasDataUser: !!result.data?.user,
      },
    })
    console.info('[auth][login] raw response shape', {
      rootKeys: Object.keys(result),
      dataKeys: result.data ? Object.keys(result.data) : [],
      hasRootAccessToken: !!result.accessToken,
      hasRootRefreshToken: !!result.refreshToken,
      hasDataAccessToken: !!result.data?.accessToken,
      hasDataRefreshToken: !!result.data?.refreshToken,
      hasRootUser: !!result.user,
      hasDataUser: !!result.data?.user,
    })

    const accessToken = extractLoginAccessToken(result)
    const refreshToken = extractLoginRefreshToken(result)
    const rawUser = extractLoginUser(result)
    const user = mapBackendAuthUser(rawUser)

    debugLog?.({
      level: accessToken && user ? 'success' : 'error',
      message: accessToken && user
        ? 'La respuesta trae token y usuario; el login puede continuar.'
        : 'La respuesta no trae token o usuario suficiente para abrir sesion.',
      details: {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        userId: user?.id ?? null,
        rawUserKeys: rawUser ? Object.keys(rawUser) : [],
        systemRole: user?.systemRole ?? null,
        roles: user?.roles ?? null,
        investment: user?.investment ?? null,
        tenant: user?.tenant ?? null,
      },
    })

    return {
      success: !!accessToken,
      message: 'Sesion iniciada exitosamente',
      accessToken,
      refreshToken,
      user,
      error: accessToken ? undefined : 'La API no devolvio un token de sesion',
    }
  } catch (error) {
    debugLog?.({
      level: 'error',
      message: 'loginUser recibio un error antes de poder crear la sesion.',
      details: {
        message: getApiErrorMessage(error, 'Credenciales invalidas'),
      },
    })
    console.error('Error en loginUser:', error)
    return {
      success: false,
      message: 'Error al iniciar sesion',
      error: getApiErrorMessage(error, 'Credenciales invalidas')
    }
  }
}

export async function refreshAuthTokens(refreshToken: string): Promise<LoginResponse> {
  try {
    const result = await coreApi<LoginApiPayload>('/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken,
      },
    })

    const accessToken = extractLoginAccessToken(result)
    const nextRefreshToken = extractLoginRefreshToken(result)
    const rawUser = extractLoginUser(result)
    const user = mapBackendAuthUser(rawUser)

    console.info('[auth][refresh] response', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!nextRefreshToken,
      userId: user?.id ?? null,
      systemRole: user?.systemRole ?? null,
    })

    return {
      success: !!accessToken,
      message: 'Sesion renovada exitosamente',
      accessToken,
      refreshToken: nextRefreshToken,
      user,
      error: accessToken ? undefined : 'La API no devolvio un token renovado',
    }
  } catch (error) {
    console.error('Error en refreshAuthTokens:', error)
    return {
      success: false,
      message: 'Error al renovar sesion',
      error: getApiErrorMessage(error, 'No se pudo renovar la sesion'),
    }
  }
}

export type PasswordResetRequestInput = {
  email: string
}

export type PasswordResetRequestResponse = {
  ok: boolean
  email: string
  expiresAt?: string
  delivery?: {
    provider: string
    delivered: boolean
    data?: unknown
  }
}

export type PasswordResetVerifyInput = {
  email: string
  code: string
}

export type PasswordResetVerifyResponse = {
  ok: boolean
  email: string
  resetToken: string
}

export type PasswordResetConfirmInput = {
  resetToken: string
  password: string
}

export type PasswordResetConfirmResponse = {
  ok: boolean
}

export async function requestPasswordResetCode(input: PasswordResetRequestInput) {
  return coreApi<PasswordResetRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
    },
  })
}

export async function verifyPasswordResetCode(input: PasswordResetVerifyInput) {
  return coreApi<PasswordResetVerifyResponse>('/auth/password-reset/verify', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      code: input.code,
    },
  })
}

export async function confirmPasswordReset(input: PasswordResetConfirmInput) {
  return coreApi<PasswordResetConfirmResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: {
      resetToken: input.resetToken,
      password: input.password,
    },
  })
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await coreApi<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() }
    })
    return result.exists || false
  } catch {
    return false
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>,
  token: string
): Promise<{ success: boolean; message: string; user?: User; error?: string }> {
  try {
    const result = await coreApi<{ user: User }>(`/auth/profile/${userId}`, {
      method: 'PUT',
      token,
      body: updates
    })

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: result.user
    }
  } catch (error) {
    console.error('Error en updateUserProfile:', error)
    return {
      success: false,
      message: 'Error al actualizar perfil',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function uploadProfileImage(
  payload: BackendProfileImagePayload,
  token: string,
  documentType: UploadImageDocumentType = 'profilephoto',
): Promise<UploadProfileImageResponse> {
  if (!payload.image.uri || !payload.image.name || !payload.image.type) {
    throw new Error('La imagen seleccionada no tiene datos validos para subirla.')
  }

  const formData = new FormData()
  formData.append('documentType', documentType)
  formData.append('file', {
    uri: payload.image.uri,
    name: payload.image.name,
    type: payload.image.type,
  } as unknown as Blob)

  const response = await fetchWithAuthRetry(API_URLS.CORE, '/uploads/', {
    method: 'POST',
    token,
    body: formData,
  })

  if (!response.ok) {
    let message = `No se pudo subir la imagen (${response.status})`
    try {
      const errorPayload = await response.json() as { message?: string; error?: string }
      message = errorPayload.message || errorPayload.error || message
    } catch {
      // La respuesta no contenia JSON util.
    }
    throw new Error(message)
  }

  const result = await response.json() as unknown
  const uploadedFile = getUploadedProfileFile(result, documentType)
  if (!uploadedFile?.url) {
    throw new Error('El servicio de archivos no devolvio la URL de la imagen.')
  }

  return uploadedFile
}

export async function getUploadedProfileImage(token: string): Promise<UploadProfileImageResponse | null> {
  const response = await fetchWithAuthRetry(API_URLS.CORE, '/uploads/', {
    method: 'GET',
    token,
  })

  if (!response.ok) {
    let message = `No se pudo obtener la foto de perfil (${response.status})`
    try {
      const errorPayload = await response.json() as { message?: string; error?: string }
      message = errorPayload.message || errorPayload.error || message
    } catch {
      // La respuesta no contenia JSON util.
    }
    throw new Error(message)
  }

  return getUploadedProfileFile(await response.json() as UploadedFilesResponse)
}

export async function getUploadedAgentPresentation(token: string): Promise<UploadProfileImageResponse | null> {
  const response = await fetchWithAuthRetry(API_URLS.CORE, '/uploads/', {
    method: 'GET',
    token,
  })

  if (!response.ok) {
    throw new Error(`No se pudo obtener la foto para el PDF (${response.status})`)
  }

  return getUploadedProfileFile(await response.json() as UploadedFilesResponse, 'agentpresentation')
}

async function deleteUploadedImage(
  token: string,
  documentType: UploadImageDocumentType,
): Promise<void> {
  const response = await fetchWithAuthRetry(
    API_URLS.CORE,
    `/uploads/?documentType=${documentType}`,
    {
      method: 'DELETE',
      token,
    },
  )

  if (!response.ok) {
    const imageLabel = documentType === 'agentpresentation'
      ? 'la imagen anterior del PDF'
      : 'la foto de perfil anterior'
    let message = `No se pudo borrar ${imageLabel} (${response.status})`
    try {
      const errorPayload = await response.json() as { message?: string; error?: string }
      message = errorPayload.message || errorPayload.error || message
    } catch {
      // La respuesta no contenia JSON util.
    }
    throw new Error(message)
  }
}

export async function deleteUploadedProfileImage(token: string): Promise<void> {
  return deleteUploadedImage(token, 'profilephoto')
}

export async function deleteUploadedAgentPresentationImage(token: string): Promise<void> {
  return deleteUploadedImage(token, 'agentpresentation')
}

function getUploadedProfileFile(
  payload: unknown,
  documentType: UploadImageDocumentType = 'profilephoto',
): UploadProfileImageResponse | null {
  if (!payload || typeof payload !== 'object') return null

  const root = payload as Record<string, unknown>
  const rootFiles = root.files && typeof root.files === 'object' && !Array.isArray(root.files)
    ? root.files as Record<string, unknown>
    : undefined
  const user = root.user && typeof root.user === 'object' && !Array.isArray(root.user)
    ? root.user as Record<string, unknown>
    : undefined
  const userFiles = user?.files && typeof user.files === 'object' && !Array.isArray(user.files)
    ? user.files as Record<string, unknown>
    : undefined
  const candidates = [
    root,
    root.data,
    root.file,
    root.upload,
    rootFiles?.[documentType],
    userFiles?.[documentType],
    Array.isArray(root.files) ? root.files[0] : root.files,
    Array.isArray(root.data) ? root.data[0] : undefined,
  ]

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
    const file = candidate as Record<string, unknown>
    const url = [file.url, file.secureUrl, file.fileUrl, file.location]
      .find(value => typeof value === 'string' && value.length > 0)
    if (typeof url === 'string') {
      const key = [file.key, file.storageKey]
        .find(value => typeof value === 'string' && value.length > 0)
      const filename = [file.filename, file.originalName]
        .find(value => typeof value === 'string' && value.length > 0)

      return {
        url,
        key: typeof key === 'string' ? key : undefined,
        filename: typeof filename === 'string' ? filename : undefined,
        storageKey: typeof key === 'string' ? key : undefined,
        contentType: typeof file.contentType === 'string' ? file.contentType : undefined,
        size: typeof file.size === 'number' ? file.size : undefined,
        originalName: typeof file.originalName === 'string' ? file.originalName : undefined,
        documentType: typeof file.documentType === 'string' ? file.documentType : undefined,
        status: typeof file.status === 'string' ? file.status : undefined,
      }
    }
  }

  return null
}
