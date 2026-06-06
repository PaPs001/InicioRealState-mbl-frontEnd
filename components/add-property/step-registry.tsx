import type { ReactNode } from 'react'

import { AcquisitionTypeStep } from './AcquisitionTypeStep'
import { AmenitiesStep } from './AmenitiesStep'
import { BasicInfoStep } from './BasicInfoStep'
import { PhotosStep } from './PhotosStep'
import { PricingDetailsStep } from './PricingDetailsStep'
import { PropertyTypeStep } from './PropertyTypeStep'
import { ReviewStep } from './ReviewStep'
import type { AddPropertyStepParams } from './types'

export function renderAddPropertyStep(params: AddPropertyStepParams): ReactNode {
  const {
    step,
    acquisitionType,
    externalAgency,
    formData,
    handleAddPhoto,
    isDemoSession,
    photos,
    propertyType,
    selectedAmenities,
    setAcquisitionType,
    setExternalAgency,
    setFormData,
    setPropertyType,
    toggleAmenity,
  } = params

  const stepRegistry: Record<number, ReactNode> = {
    1: <PropertyTypeStep propertyType={propertyType} setPropertyType={setPropertyType} />,
    2: (
      <AcquisitionTypeStep
        acquisitionType={acquisitionType}
        externalAgency={externalAgency}
        setAcquisitionType={setAcquisitionType}
        setExternalAgency={setExternalAgency}
      />
    ),
    3: <BasicInfoStep formData={formData} propertyType={propertyType} setFormData={setFormData} />,
    4: <PricingDetailsStep formData={formData} setFormData={setFormData} />,
    5: <AmenitiesStep selectedAmenities={selectedAmenities} toggleAmenity={toggleAmenity} />,
    6: <PhotosStep photos={photos} handleAddPhoto={handleAddPhoto} />,
    7: <ReviewStep isDemoSession={isDemoSession} />,
  }

  return stepRegistry[step] ?? null
}
