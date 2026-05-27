/**
 * Endpoints del catalogo de propiedades
 */

import { notificationsApi, coreApi } from '../client'
import type { Property } from '@/lib/types'

export interface PropertyCatalogItemResponse {
  _id: string
  address: string
  banner: boolean
  bed: string | null
  editedPhotos: string | null
  googleDriveImages: string | null
  id: string
  isALand: boolean
  list: 'sale' | 'rent' | string
  locationUrl: string | null
  maxPrice: number | null
  minPrice: number | null
  name: string
  offer: boolean
  originalPhotos: string | null
  owner: string | null
  parking: string | null
  priceData: string | null
  priceSpecial: number | null
  propertyAmenities: string | null
  propertyArea: string | null
  propertyDescription: string | null
  propertyDimensions: string | null
  propertyInformation: string | null
  propertyPayment: string | null
  propertyView: string | null
  status: string | null
  urlImage: string | null
  wc: string | null
  zonaText: string | null
}

function extractNumber(value: string | null | undefined): number {
  if (!value) return 0
  const match = value.match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function mapStatusToPropertyStatus(
  list: PropertyCatalogItemResponse['list'],
  status: PropertyCatalogItemResponse['status']
): Property['status'] {
  const normalizedStatus = (status || '').toLowerCase()
  if (normalizedStatus.includes('proceso')) {
    return list === 'rent' ? 'pending_rent' : 'pending_sale'
  }
  return list === 'rent' ? 'for_rent' : 'for_sale'
}

export function mapApiPropertyToProperty(item: PropertyCatalogItemResponse): Property {
  const parsedPrice = item.minPrice ?? item.maxPrice ?? item.priceSpecial ?? 0
  const area = extractNumber(item.propertyArea) || extractNumber(item.propertyDimensions)
  const bedrooms = extractNumber(item.bed)
  const bathrooms = extractNumber(item.wc)
  const amenities = (item.propertyAmenities || '')
    .split(/,|\n/)
    .map((value) => value.trim())
    .filter(Boolean)

  return {
    _id: item._id,
    id: item.id,
    title: item.name || 'Propiedad sin titulo',
    address: item.address || 'Sin direccion',
    city: item.zonaText || 'Sin ubicacion',
    price: parsedPrice,
    monthlyRent: item.list === 'rent' ? parsedPrice : undefined,
    type: item.isALand ? 'land' : 'apartment',
    bedrooms: item.isALand ? 0 : bedrooms,
    bathrooms: item.isALand ? 0 : bathrooms,
    sqMeters: area,
    size: area,
    images: item.urlImage ? [item.urlImage] : [],
    googleDriveImages: item.googleDriveImages || undefined,
    locationUrl: item.locationUrl || undefined,
    status: mapStatusToPropertyStatus(item.list, item.status),
    description: item.propertyDescription || item.name || 'Sin descripcion',
    amenities,
    features: amenities,
    createdAt: new Date().toISOString(),
  }
}

export async function getCatalogRentProperties(): Promise<Property[]> {
  try {
    const data = await notificationsApi<PropertyCatalogItemResponse[]>('/properties/list', {
      method: 'POST',
      body: { list: 'rent' }
    })

    return data
      .filter(item => (item.status || '').toLowerCase().includes('disponible'))
      .map(mapApiPropertyToProperty)
  } catch (error) {
    console.error('Error al obtener catalogo:', error)
    throw error
  }
}

export async function getCatalogPropertiesCoreAPI(token?: string): Promise<Property[]>{
  try {
    const data = await coreApi<PropertyCatalogItemResponse[]>('/users/properties/available', {
      method: 'GET',
      token,
    })
    return data
      .map(mapApiPropertyToProperty)
  } catch (error) {
    console.error('Error al obtener catalogo:', error)
    throw error
  }
}

export async function getCatalogSaleProperties(): Promise<Property[]> {
  try {
    const data = await notificationsApi<PropertyCatalogItemResponse[]>('/properties/list', {
      method: 'POST',
      body: { list: 'sale' }
    })

    return data
      .filter(item => (item.status || '').toLowerCase().includes('disponible'))
      .map(mapApiPropertyToProperty)
  } catch (error) {
    console.error('Error al obtener catalogo de venta:', error)
    throw error
  }
}

export async function getAllCatalogProperties(): Promise<Property[]> {
  try {
    const [rentProperties, saleProperties] = await Promise.all([
      getCatalogRentProperties(),
      getCatalogSaleProperties()
    ])
    return [...rentProperties, ...saleProperties]
  } catch (error) {
    console.error('Error al obtener todas las propiedades:', error)
    throw error
  }
}

export const AGENT_VISIBLE_STATUSES = [
  'apartada',
  'disponible', 
  'edición inicio',
  'alquilada inicio',
  'en proceso',
  'alquilada externo'
]

export async function getAgentCatalogRentProperties(): Promise<{ properties: Property[], rawData: PropertyCatalogItemResponse[] }> {
  try {
    const data = await notificationsApi<PropertyCatalogItemResponse[]>('/properties/list', {
      method: 'POST',
      body: { list: 'rent' }
    })

    const filteredData = data.filter(item => {
      const status = (item.status || '').toLowerCase()
      return AGENT_VISIBLE_STATUSES.some(s => status.includes(s.toLowerCase()))
    })

    return {
      properties: filteredData.map(mapApiPropertyToProperty),
      rawData: filteredData
    }
  } catch (error) {
    console.error('Error al obtener catalogo de asesores (renta):', error)
    throw error
  }
}

export async function getAgentCatalogSaleProperties(): Promise<{ properties: Property[], rawData: PropertyCatalogItemResponse[] }> {
  try {
    const data = await notificationsApi<PropertyCatalogItemResponse[]>('/properties/list', {
      method: 'POST',
      body: { list: 'sale' }
    })

    const filteredData = data.filter(item => {
      const status = (item.status || '').toLowerCase()
      return AGENT_VISIBLE_STATUSES.some(s => status.includes(s.toLowerCase()))
    })

    return {
      properties: filteredData.map(mapApiPropertyToProperty),
      rawData: filteredData
    }
  } catch (error) {
    console.error('Error al obtener catalogo de asesores (venta):', error)
    throw error
  }
}

export async function getAllAgentCatalogProperties(): Promise<{ properties: Property[], rawData: PropertyCatalogItemResponse[] }> {
  try {
    const [rentResult, saleResult] = await Promise.all([
      getAgentCatalogRentProperties(),
      getAgentCatalogSaleProperties()
    ])
    return {
      properties: [...rentResult.properties, ...saleResult.properties],
      rawData: [...rentResult.rawData, ...saleResult.rawData]
    }
  } catch (error) {
    console.error('Error al obtener catalogo completo de asesores:', error)
    throw error
  }
}

//favoritos
export async function addFavoriteProperty(propertyId: string, token?: string): Promise<void> {
  try {
    await coreApi('/users/favorites', {
      method: 'POST',
      body: { id: propertyId },
      token,
    })
  } catch (error) {
    console.error('Error al agregar propiedad a favoritos:', error)
    throw error
  }
}

export async function getFavoriteProperties(userID: string, token?: string): Promise<Property[]> {
  try {
    const data = await coreApi<PropertyCatalogItemResponse[]>('/users/favorites', {
      method: 'GET',
      headers: { ownerId: userID },
      token,
    })
    return data.map(mapApiPropertyToProperty)
  } catch (error) {
    console.error('Error al obtener propiedades favoritas:', error)
    throw error
  }
}

export async function deleteFavoriteProperties(propertyId: string, token?: string): Promise<void> {
  try {
    await coreApi(`/users/favorites/${propertyId}`, {
      method: 'DELETE',
      token,
    })
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    throw error
  }
}


