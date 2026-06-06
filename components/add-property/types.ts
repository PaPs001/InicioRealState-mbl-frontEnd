import type { AcquisitionType, PropertyType } from './constants'

export type AddPropertyFormData = {
  title: string
  address: string
  city: string
  purchasePrice: string
  sqMeters: string
  bedrooms: string
  bathrooms: string
  description: string
}

export type AddPropertyStepParams = {
  step: number
  isDemoSession: boolean
  propertyType: PropertyType | null
  acquisitionType: AcquisitionType | null
  externalAgency: string
  selectedAmenities: string[]
  photos: string[]
  formData: AddPropertyFormData
  setPropertyType: (value: PropertyType) => void
  setAcquisitionType: (value: AcquisitionType | null) => void
  setExternalAgency: (value: string) => void
  setFormData: (value: AddPropertyFormData) => void
  toggleAmenity: (amenityId: string) => void
  handleAddPhoto: () => void
}
