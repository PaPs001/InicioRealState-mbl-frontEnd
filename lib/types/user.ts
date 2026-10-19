/**
 * Tipos de Usuario y Autenticacion
 */

export type BackendUserRole = 'CLIENT' | 'AGENT' | 'COORDINATOR' | 'ADMIN'

export interface AgentLeadNotion {
  name: string
  status: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  country?: string | null
  systemRole: BackendUserRole
  roles?: BackendUserRole[]
  investment: boolean
  tenant: boolean
  permissions?: string[]
  referralCode?: string
  avatar?: string
  profilePhotoKey?: string
  agentPresentationKey?: string
  agentpresentation?: boolean
  agentPresentation?: boolean
  agentLeadNotion?: AgentLeadNotion
  createdAt: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  country?: string | null
  password: string
  emailVerificationToken?: string
  roles: BackendUserRole[]
  investment: boolean
  tenant: boolean
  aboutUser?: Record<string, unknown>
  referralCode?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
  user?: User
  error?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  error?: string
}
