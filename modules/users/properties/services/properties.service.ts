import { coreApi } from '@/lib/api'
import {
  mapApiPropertyToProperty,
} from '@/lib/api/endpoints/catalog'
import type { Property, PropertyCatalogItemResponse, selectedPropertyBackendData } from '@/lib/types/property'

const AVAILABLE_PROPERTIES_ENDPOINT = '/users/properties/available'
const SELECTED_PROPERTY = '/users/properties/'

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

export async function getSelectedProperty( propertyId: string, token?: string | null): Promise<selectedPropertyBackendData>{
  const data = await coreApi<selectedPropertyBackendData>(`${SELECTED_PROPERTY}${encodeURIComponent(propertyId)}`, {
    method: 'POST',
    token: token ?? undefined,
  })

  return data
}
