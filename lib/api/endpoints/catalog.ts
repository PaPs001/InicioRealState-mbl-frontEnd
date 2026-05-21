/**
 * Endpoints del catalogo de propiedades
 */

import { notificationsApi } from '../client'
import type { Property } from '@/lib/types'

// Tipos de respuesta del API
export interface PropertyCatalogItemResponse {
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

// Utilidades de mapeo
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
    images: item.urlImage ? [item.urlImage] : [],
    status: mapStatusToPropertyStatus(item.list, item.status),
    description: item.propertyDescription || item.name || 'Sin descripcion',
    amenities,
    features: amenities,
    createdAt: new Date().toISOString(),
  }
}

// Obtener catalogo de propiedades en renta
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

// Obtener catalogo de propiedades en venta
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

// Obtener todas las propiedades del catalogo
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
