/**
 * Constantes de la aplicacion
 */

// API
export const API_BASE_URL = 'https://core-api-smoky-ten.vercel.app'
export const API_NOTIFICATIONS_URL = 'https://inicio-notifications-service.vercel.app'
export const API_TIMEOUT = 30000

// Paginacion
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Validaciones
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
}

// Roles de usuario
export const USER_ROLES = {
  INVESTOR: 'investor',
  SEARCHING: 'searching',
  TENANT: 'tenant',
  AGENT: 'agent',
  ADMIN: 'admin',
} as const

// Estados de propiedad
export const PROPERTY_STATUS = {
  OWNED: 'owned',
  FOR_SALE: 'for_sale',
  FOR_RENT: 'for_rent',
  RENTED: 'rented',
  AVAILABLE: 'available',
  PENDING_SALE: 'pending_sale',
  PENDING_RENT: 'pending_rent',
} as const

// Estados de lead
export const LEAD_STATUS = {
  NUEVO: 'nuevo',
  CONTACTADO: 'contactado',
  CITA_AGENDADA: 'cita_agendada',
  VISITADO: 'visitado',
  NEGOCIANDO: 'negociando',
  CERRADO: 'cerrado',
  DESCARTADO: 'descartado',
} as const

// Estados de campana
export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  ONBOARDING_COMPLETE: 'onboarding_complete',
}

// Rutas de navegacion
export const ROUTES = {
  // Auth
  LOGIN: '/login-new',
  REGISTER: '/register',
  CREATE_ACCOUNT: '/create-account',
  LOGOUT_TRANSITION: '/logout-transition',
  
  // Tabs
  HOME: '/(tabs)',
  PROFILE: '/(tabs)/profile',
  
  // Screens
  CATALOG: '/catalog-screen',
  FAVORITES: '/favorites-screen',
  APPOINTMENTS: '/appointments-screen',
  MESSAGES: '/messages-screen',
  NOTIFICATIONS: '/notifications-screen',
  MY_PROPERTIES: '/my-properties-screen',
  ADD_PROPERTY: '/add-property-screen',
  PROPERTY_DETAIL: '/property-detail-screen',
  EARNINGS: '/earnings-screen',
  CAMPAIGNS: '/campaigns-screen',
}
