/**
 * Endpoints de propiedades de usuario
 */

import { coreApi } from '../client'
import type { Property } from '@/lib/types'

export interface CreateUserPropertyPayload {
  id: string
  propertyType: 'house' | 'department' | 'lot'
  name: string
  banner: boolean
  urlImage: string | null
  offer: boolean
  zonaText: string
  googleDriveImages: string | null
  propertyView: string | null
  propertyPayment: string | null
  propertyInformation: string | null
  propertyDescription: string | null
  locationUrl: string | null
  isALand: boolean
  propertyArea: string | null
  propertyDimensions: string | null
  propertyAmenities: string | null
  priceData: string | null
  priceSpecial: number | null
  minPrice: number | null
  maxPrice: number | null
  status: string
  parking: string | null
  wc: string | null
  bed: string | null
  address: string
  originalPhotos: string | null
  editedPhotos: string | null
  list: string
}

// Crear propiedad de usuario
export async function createUserProperty(
  payload: CreateUserPropertyPayload,
  token: string
): Promise<unknown> {
  return coreApi('/users/add-property', {
    method: 'POST',
    token,
    body: payload,
  })
}

// Obtener propiedades de usuario
export async function getUserProperties(
  userId: string,
  token: string
): Promise<unknown[]> {
  return coreApi(`/users/${userId}/properties`, {
    method: 'GET',
    token,
  })
}

// Actualizar propiedad de usuario
export async function updateUserProperty(
  propertyId: string,
  payload: Partial<CreateUserPropertyPayload>,
  token: string
): Promise<unknown> {
  return coreApi(`/users/properties/${propertyId}`, {
    method: 'PUT',
    token,
    body: payload,
  })
}

// Eliminar propiedad de usuario
export async function deleteUserProperty(
  propertyId: string,
  token: string
): Promise<unknown> {
  return coreApi(`/users/properties/${propertyId}`, {
    method: 'DELETE',
    token,
  })
}

export function getPropertyRecordById(propertyId?: string | null): Property | null {
  if (!propertyId) {
    return null
  }

  return null
}
