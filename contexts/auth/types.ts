import type { BackendUser } from '@/lib/services/auth-session'
import type { Appointment, Notification, Property, PropertyLead, User } from '@/lib/types'

export interface AuthContextType {
  currentUser: User | null
  authToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isLoggedIn: boolean
  isInvestor: boolean
  isSearching: boolean
  isTenant: boolean
  isAgent: boolean
  isCoordinator: boolean
  isAdmin: boolean
  isClient: boolean
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuthSession: () => Promise<string | null>
  setCurrentUser: (user: BackendUser | User | null) => void
  setAuthSession: (user: BackendUser | User | null, token: string | null, refreshToken?: string | null) => Promise<void>
  userProperties: Property[]
  availableProperties: Property[]
  catalogProperties: Property[]
  isCatalogLoading: boolean
  hasLoadedCatalog: boolean
  userLeads: PropertyLead[]
  userAppointments: Appointment[]
  notifications: Notification[]
  getPropertyById: (id: string) => Property | undefined
  loadCatalogProperties: () => Promise<void>
  markNotificationAsRead: (id: string) => void
  markAllUserNotificationsAsRead: () => void
  unreadNotificationsCount: number
}

export type SessionDomain = Pick<
  AuthContextType,
  | 'currentUser'
  | 'authToken'
  | 'refreshToken'
  | 'isLoading'
  | 'isLoggedIn'
  | 'isInvestor'
  | 'isSearching'
  | 'isTenant'
  | 'isAgent'
  | 'isCoordinator'
  | 'isAdmin'
  | 'isClient'
  | 'login'
  | 'logout'
  | 'refreshAuthSession'
  | 'setCurrentUser'
  | 'setAuthSession'
>

export type PropertyDomain = Pick<
  AuthContextType,
  | 'userProperties'
  | 'availableProperties'
  | 'catalogProperties'
  | 'isCatalogLoading'
  | 'hasLoadedCatalog'
  | 'getPropertyById'
  | 'loadCatalogProperties'
>

export type ActivityDomain = Pick<
  AuthContextType,
  | 'userLeads'
  | 'userAppointments'
  | 'notifications'
  | 'markNotificationAsRead'
  | 'markAllUserNotificationsAsRead'
  | 'unreadNotificationsCount'
>
