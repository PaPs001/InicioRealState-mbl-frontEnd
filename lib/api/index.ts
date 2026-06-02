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

export { apiClient, coreApi, notificationsApi, API_URLS } from './client'

import * as auth from './endpoints/auth'
import * as catalog from './endpoints/catalog'
import * as properties from './endpoints/properties'

export const api = {
  auth,
  catalog,
  properties,
} as const

export {
  registerUser,
  loginUser,
  checkEmailExists,
  updateUserProfile,
  validateRegistrationData,
} from './endpoints/auth'

export {
  getCatalogRentProperties,
  getCatalogSaleProperties,
  getAllCatalogProperties,
  mapApiPropertyToProperty,
  type PropertyCatalogItemResponse,
} from './endpoints/catalog'

export {
  createUserProperty,
  getUserProperties,
  updateUserProperty,
  deleteUserProperty,
  type CreateUserPropertyPayload,
} from './endpoints/properties'
