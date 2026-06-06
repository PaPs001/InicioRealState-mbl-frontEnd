import type { ReactNode } from 'react'

import { ListingAddressStep } from './ListingAddressStep'
import { ListingPhotosStep } from './ListingPhotosStep'
import { ListingPriceStep } from './ListingPriceStep'
import { ListingSummaryStep } from './ListingSummaryStep'
import { ListingTypeStep } from './ListingTypeStep'
import type { ListPropertyStepParams } from './types'

export function renderListPropertyStep(params: ListPropertyStepParams): ReactNode {
  const {
    address,
    listingType,
    price,
    property,
    skipPhotos,
    step,
    onChangeAddress,
    onChangeListingType,
    onChangePrice,
    onConfirm,
    onToggleSkipPhotos,
  } = params

  const stepRegistry: Record<number, ReactNode> = {
    1: <ListingTypeStep listingType={listingType} onChange={onChangeListingType} />,
    2: (
      <ListingPriceStep
        listingType={listingType}
        price={price}
        propertyCurrentValue={property.currentValue}
        onChangePrice={onChangePrice}
      />
    ),
    3: <ListingPhotosStep skipPhotos={skipPhotos} onToggleSkipPhotos={onToggleSkipPhotos} />,
    4: (
      <ListingAddressStep
        address={address}
        propertyAddress={property.address}
        propertyCity={property.city}
        onChangeAddress={onChangeAddress}
      />
    ),
    5: (
      <ListingSummaryStep
        address={address}
        listingType={listingType}
        price={price}
        propertyAddress={property.address}
        propertyTitle={property.title}
        skipPhotos={skipPhotos}
        onConfirm={onConfirm}
      />
    ),
  }

  return stepRegistry[step] ?? null
}
