import {
  Filters,
  getFiltersProperties,
} from '@/lib/api/endpoints/catalog'
import type { Property } from '@/lib/types'

type AvailablePropertiesParams = {
  catalogProperties: Property[]
  currentUserId?: string | null
  hasLoadedCatalog: boolean
}

export function getAvailableProperties(params: AvailablePropertiesParams): Property[] {
  const { catalogProperties, currentUserId, hasLoadedCatalog } = params

  const propertySource = hasLoadedCatalog ? catalogProperties : []

  return propertySource.filter(property => property.ownerId !== currentUserId)
}

export function findPropertyById(params: {
  id: string
  catalogProperties: Property[]
}): Property | undefined {
  const { catalogProperties, id } = params

  return catalogProperties.find(property => property.id === id)
}

export async function loadCatalogPropertiesWithFilter(filters: Filters, token?: string, signal?: AbortSignal){
  return getFiltersProperties(filters, token, signal)
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
