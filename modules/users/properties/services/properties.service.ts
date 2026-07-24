import { coreApi } from '@/lib/api'
import {
  mapApiPropertyToProperty,
  type PropertyCatalogItemResponse,
} from '@/lib/api/endpoints/catalog'
import type { Property } from '@/lib/types'

const AVAILABLE_PROPERTIES_ENDPOINT = '/users/properties/available'

export async function getAvailableModuleProperties(token?: string | null): Promise<Property[]> {
  const data = await coreApi<PropertyCatalogItemResponse[]>(AVAILABLE_PROPERTIES_ENDPOINT, {
    method: 'GET',
    token: token ?? undefined,
  })

  return data.map(item => {
    const property = mapApiPropertyToProperty(item)
    const parkingAmenity = item.parking ? `Estacionamiento ${item.parking}` : null
    const amenities = parkingAmenity
      ? [...property.amenities, parkingAmenity]
      : property.amenities

    return {
      ...property,
      amenities,
      features: amenities,
    }
  })
}
