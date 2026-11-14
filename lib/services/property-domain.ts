import {
  Filters,
  getFiltersProperties,
} from '@/lib/api/endpoints/catalog'
import type { Property } from '@/lib/types'

export async function loadCatalogPropertiesWithFilter(filters: Filters, token?: string, signal?: AbortSignal){
  return getFiltersProperties(filters, token, signal)
}
{/**
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

*/}
