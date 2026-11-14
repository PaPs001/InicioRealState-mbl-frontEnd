import type { Filters } from "@/lib/api/endpoints/catalog"
import type { BackendUser } from '@/lib/services/auth-session'
import type { Appointment, Notification, Property, PropertyLead, User } from '@/lib/types'
import type { PropertyCard2 } from "@/modules/users/properties/types/Property/property.model"

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
  hasMoreCatalog: boolean
  loadMoreCatalogProperties: () => Promise<boolean>
  retryCatalogPage: () => Promise<boolean>
  catalogResetVersion: number
  catalogProperties: PropertyCard2[]
  catalogFilters: Filters | null
  catalogError: string | null
  isCatalogLoading: boolean
  hasLoadedCatalog: boolean
  userLeads: PropertyLead[]
  userAppointments: Appointment[]
  notifications: Notification[]
  loadCatalogProperties: (filters?: Filters, force?: boolean) => Promise<boolean>
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
  | 'hasMoreCatalog'
  | 'loadMoreCatalogProperties'
  | 'retryCatalogPage'
  | 'catalogResetVersion'
  | 'catalogProperties'
  | 'catalogFilters'
  | 'catalogError'
  | 'isCatalogLoading'
  | 'hasLoadedCatalog'
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
