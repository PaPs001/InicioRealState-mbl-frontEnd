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
  isALand: boolean | string | number | null
  isLand?: boolean | string | number | null
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
  propertyType?: string | null
  propertyView: string | null
  pool?: boolean | null
  residentialDevelopment?: string | null
  security24_7?: boolean | null
  solarPanel?: string | null
  status: string | null
  urlImage: string | null
  virtualRoute?: string | null
  wc: string | null
  zonaText: string | null
}

function normalizeValueToText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return undefined
}

function extractNumber(value: unknown): number {
  const textValue = normalizeValueToText(value)
  if (!textValue) return 0
  const match = textValue.match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function normalizeOptionalText(value: unknown): string | undefined {
  const normalizedValue = normalizeValueToText(value)?.trim()
  if (!normalizedValue) return undefined
  if (/^(sin dato|sin datos|n\/a|na|null|undefined)$/i.test(normalizedValue)) return undefined
  return normalizedValue
}

function isStringValue(value: string | undefined): value is string {
  return Boolean(value)
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

function isAvailableProperty(item: PropertyCatalogItemResponse): boolean {
  return normalizeOptionalText(item.status)?.toLowerCase().includes('disponible') ?? false
}

function normalizeListingType(list: PropertyCatalogItemResponse['list']): Property['listingType'] {
  if (list === 'rent') return 'rent'
  if (list === 'sale') return 'sale'
  return undefined
}

function normalizeBooleanFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1

  const normalizedValue = normalizeOptionalText(value)?.toLowerCase()
  return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'si' || normalizedValue === 'sí' || normalizedValue === 'yes'
}

function isLandProperty(item: PropertyCatalogItemResponse): boolean {
  if (normalizeBooleanFlag(item.isALand) || normalizeBooleanFlag(item.isLand)) return true

  const normalizedType = [
    normalizeOptionalText(item.propertyType),
    normalizeOptionalText(item.propertyInformation),
  ].filter(Boolean).join(' ').toLowerCase()

  return normalizedType.includes('terreno') || normalizedType.includes('land')
}

function getPropertyType(item: PropertyCatalogItemResponse): Property['type'] {
  const normalizedType = [
    normalizeOptionalText(item.propertyType),
    normalizeOptionalText(item.propertyInformation),
  ].filter(Boolean).join(' ').toLowerCase()

  if (isLandProperty(item)) {
    return 'land'
  }

  if (normalizedType.includes('casa') || normalizedType.includes('house')) {
    return 'house'
  }

  return 'apartment'
}

function isFurnishedProperty(item: PropertyCatalogItemResponse): boolean {
  const searchableText = [
    item.propertyAmenities,
    item.propertyInformation,
    item.propertyDescription,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/sin muebles|no amuebl/i.test(searchableText)) {
    return false
  }

  return /amuebl|mueble|equipad/i.test(searchableText)
}

function getFurnishedLabel(item: PropertyCatalogItemResponse): string | undefined {
  const values = [
    item.propertyAmenities,
    item.propertyInformation,
    item.propertyDescription,
  ]
    .map(normalizeOptionalText)
    .filter(Boolean) as string[]

  return values.find(value => /amuebl|mueble|equipad/i.test(value))
}

function buildAmenities(item: PropertyCatalogItemResponse): string[] {
  const amenities = (normalizeOptionalText(item.propertyAmenities) || '')
    .split(/,|\n/)
    .map(normalizeOptionalText)
    .filter(isStringValue)

  if (item.pool) {
    amenities.push('Alberca')
  }

  if (item.security24_7) {
    amenities.push('Seguridad 24/7')
  }

  const solarPanel = normalizeOptionalText(item.solarPanel)
  if (solarPanel && solarPanel.toLowerCase() !== 'no') {
    amenities.push('Panel solar')
  }

  const residentialDevelopment = normalizeOptionalText(item.residentialDevelopment)
  if (residentialDevelopment) {
    amenities.push(residentialDevelopment)
  }

  return Array.from(new Set(amenities))
}

export function mapApiPropertyToProperty(item: PropertyCatalogItemResponse): Property {
  const parsedPrice = item.minPrice ?? item.maxPrice ?? item.priceSpecial ?? 0
  const area = extractNumber(item.propertyArea) || extractNumber(item.propertyDimensions)
  const bedrooms = extractNumber(item.bed)
  const bathrooms = extractNumber(item.wc)
  const parking = extractNumber(item.parking)
  const amenities = buildAmenities(item)
  const listingType = normalizeListingType(item.list)
  const isLand = isLandProperty(item)

  return {
    _id: item._id,
    id: item.id,
    title: item.name || 'Propiedad sin titulo',
    address: item.address || 'Sin direccion',
    city: item.zonaText || 'Sin ubicacion',
    price: parsedPrice,
    priceLabel: normalizeOptionalText(item.priceData),
    monthlyRent: item.list === 'rent' ? parsedPrice : undefined,
    type: getPropertyType(item),
    listingType,
    bedrooms: isLand ? 0 : bedrooms,
    bathrooms: isLand ? 0 : bathrooms,
    parking: isLand ? 0 : parking,
    view: normalizeOptionalText(item.propertyView),
    isFurnished: isFurnishedProperty(item),
    furnishedLabel: getFurnishedLabel(item),
    solarPanelLabel: normalizeOptionalText(item.solarPanel)?.toLowerCase() === 'no'
      ? undefined
      : normalizeOptionalText(item.solarPanel),
    sqMeters: area,
    size: area,
    images: item.urlImage ? [item.urlImage] : [],
    googleDriveImages: normalizeOptionalText(item.googleDriveImages),
    locationUrl: normalizeOptionalText(item.locationUrl),
    status: mapStatusToPropertyStatus(item.list, item.status),
    description: normalizeOptionalText(item.propertyDescription) || normalizeOptionalText(item.name),
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
      .filter(isAvailableProperty)
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
