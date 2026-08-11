import {
  getAllAgentCatalogProperties,
  getAllCatalogProperties,
  getCatalogPropertiesCoreAPI,
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
  agentCatalogProperties: Property[]
  catalogProperties: Property[]
}): Property | undefined {
  const { agentCatalogProperties, catalogProperties, id } = params

  return (
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

export function getPropertyAgentName(property?: Property | null) {
  if (!property?.agentId) {
    return 'Sin asesor'
  }

  return property.agentId ? 'Asesor asignado' : 'Sin asesor'
}

export function getPropertyOwnerName(property?: Property | null) {
  if (!property?.ownerId) {
    return 'Sin propietario asignado'
  }

  return property.ownerId ? 'Propietario asignado' : 'Sin propietario asignado'
}
