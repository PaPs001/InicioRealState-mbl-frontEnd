/**
 * Tipos de Usuario y Autenticacion
 */

export type BackendUserRole = 'CLIENT' | 'AGENT' | 'COORDINATOR' | 'ADMIN'
export interface User {
  id: string
  name: string
  email: string
  phone: string
  systemRole: BackendUserRole
  investment: boolean
  tenant: boolean
  permissions?: string[]
  referralCode?: string
  avatar?: string
  createdAt: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  role: BackendUserRole
  investment: boolean
  tenant: boolean
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
  investment?: boolean
  tenant?: boolean
  roles?: BackendUserRole[]
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
