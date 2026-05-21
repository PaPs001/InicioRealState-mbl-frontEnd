import { apiFetch } from './apiFetchData'

export interface CreateUserPropertyPayload {
  id: string
  propertyType: 'house' | 'apartment' | 'land'
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

export async function createUserProperty(
  payload: CreateUserPropertyPayload,
  token: string
): Promise<unknown> {
  return apiFetch('/users/add-property', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  })
}
