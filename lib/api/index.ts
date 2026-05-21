/**
 * API centralizada - Punto de entrada unico
 * 
 * Uso:
 * import { api } from '@/lib/api'
 * 
 * // Auth
 * const result = await api.auth.loginUser({ email, password })
 * const result = await api.auth.registerUser({ ... })
 * 
 * // Catalog
 * const properties = await api.catalog.getCatalogRentProperties()
 * 
 * // User Properties
 * await api.properties.createUserProperty(payload, token)
 */

// Re-exportar cliente para uso directo si es necesario
export { apiClient, coreApi, notificationsApi, API_URLS } from './client'

// Importar todos los endpoints
import * as auth from './endpoints/auth'
import * as catalog from './endpoints/catalog'
import * as properties from './endpoints/properties'

// Objeto API unificado
export const api = {
  auth,
  catalog,
  properties,
} as const

// Re-exportar funciones individuales para compatibilidad hacia atras
export {
  // Auth
  registerUser,
  loginUser,
  checkEmailExists,
  updateUserProfile,
  validateRegistrationData,
} from './endpoints/auth'

export {
  // Catalog
  getCatalogRentProperties,
  getCatalogSaleProperties,
  getAllCatalogProperties,
  mapApiPropertyToProperty,
  type PropertyCatalogItemResponse,
} from './endpoints/catalog'

export {
  // Properties
  createUserProperty,
  getUserProperties,
  updateUserProperty,
  deleteUserProperty,
  type CreateUserPropertyPayload,
} from './endpoints/properties'
