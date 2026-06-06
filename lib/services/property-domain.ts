import AsyncStorage from '@react-native-async-storage/async-storage'

import { getAuthMockUserById } from '@/lib/api'
import {
  addFavoriteProperty,
  deleteFavoriteProperties,
  getAllAgentCatalogProperties,
  getAllCatalogProperties,
  getCatalogPropertiesCoreAPI,
  getFavoriteProperties,
  type PropertyCatalogItemResponse,
} from '@/lib/api/endpoints/catalog'
import type { Property } from '@/lib/types'

type AvailablePropertiesParams = {
  catalogProperties: Property[]
  currentUserId?: string | null
  hasLoadedCatalog: boolean
  isAdmin: boolean
  isAgent: boolean
}

export function getAvailableProperties(params: AvailablePropertiesParams): Property[] {
  const { catalogProperties, currentUserId, hasLoadedCatalog, isAdmin, isAgent } = params

  const propertySource = hasLoadedCatalog ? catalogProperties : []

  return propertySource.filter(property => {
    if (property.ownerId === currentUserId) return false
    if (!isAgent && !isAdmin && (property.status === 'pending_sale' || property.status === 'pending_rent')) {
      return false
    }
    return true
  })
}

export function findPropertyById(params: {
  id: string
  favoriteProperties: Property[]
  agentCatalogProperties: Property[]
  catalogProperties: Property[]
}): Property | undefined {
  const { agentCatalogProperties, catalogProperties, favoriteProperties, id } = params

  return (
    favoriteProperties.find(property => property.id === id) ??
    agentCatalogProperties.find(property => property.id === id) ??
    catalogProperties.find(property => property.id === id)
  )
}

export async function loadCatalogPropertiesFromApi(): Promise<Property[]> {
  return getAllCatalogProperties()
}

export async function loadCatalogPropertiesFromCore(token?: string): Promise<Property[]> {
  return getCatalogPropertiesCoreAPI(token)
}

export async function loadAgentCatalogPropertiesFromApi(): Promise<{
  properties: Property[]
  rawData: PropertyCatalogItemResponse[]
}> {
  return getAllAgentCatalogProperties()
}

export async function loadFavoritePropertiesFromApi(userId: string, token?: string): Promise<{
  favoriteIds: string[]
  favoriteProperties: Property[]
}> {
  const favoriteProperties = await getFavoriteProperties(userId, token)

  return {
    favoriteIds: favoriteProperties.map(property => property.id),
    favoriteProperties,
  }
}

export async function addFavoritePropertyForUser(params: {
  currentFavorites: string[]
  currentUserId?: string | null
  property?: Property
  propertyId: string
  token?: string | null
}): Promise<{
  favoriteIds: string[]
  favoritePropertiesUpdater: (current: Property[]) => Property[]
}> {
  const { currentFavorites, currentUserId, property, propertyId, token } = params

  if (currentFavorites.includes(propertyId)) {
    return {
      favoriteIds: currentFavorites,
      favoritePropertiesUpdater: current => current,
    }
  }

  await addFavoriteProperty(propertyId, token ?? undefined)

  const favoriteIds = [...currentFavorites, propertyId]

  if (currentUserId) {
    await AsyncStorage.setItem(`favorites_${currentUserId}`, JSON.stringify(favoriteIds))
  }

  return {
    favoriteIds,
    favoritePropertiesUpdater: current => {
      if (!property || current.some(item => item.id === propertyId)) {
        return current
      }

      return [...current, property]
    },
  }
}

export async function removeFavoritePropertyForUser(params: {
  currentFavorites: string[]
  currentUserId?: string | null
  propertyId: string
  token?: string | null
}): Promise<{
  favoriteIds: string[]
  favoritePropertiesUpdater: (current: Property[]) => Property[]
}> {
  const { currentFavorites, currentUserId, propertyId, token } = params

  await deleteFavoriteProperties(propertyId, token ?? undefined)

  const favoriteIds = currentFavorites.filter(id => id !== propertyId)

  if (currentUserId) {
    await AsyncStorage.setItem(`favorites_${currentUserId}`, JSON.stringify(favoriteIds))
  }

  return {
    favoriteIds,
    favoritePropertiesUpdater: current => current.filter(property => property.id !== propertyId),
  }
}

export function getPropertyAgentName(property?: Property | null) {
  if (!property?.agentId) {
    return 'Sin asesor'
  }

  return getAuthMockUserById(property.agentId)?.name ?? 'Sin asesor'
}

export function getPropertyOwnerName(property?: Property | null) {
  if (!property?.ownerId) {
    return 'Sin propietario asignado'
  }

  return getAuthMockUserById(property.ownerId)?.name ?? 'Sin propietario asignado'
}
