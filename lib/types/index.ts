/**
 * Tipos centralizados del proyecto
 * 
 * Uso:
 * import { User, Property, Appointment } from '@/lib/types'
 * import type { UserRole, PropertyStatus } from '@/lib/types'
 */

// User & Auth
export * from './user'

// Properties
export * from './property'

// Leads & Agents
export * from './leads'

// Communication
export * from './communication'

// Campaigns
export * from './campaign'

// Common types
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface FilterOptions {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
