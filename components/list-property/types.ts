import type { ListingType } from './constants'

export type ListPropertyStepParams = {
  step: number
  address: string
  listingType: ListingType | null
  price: string
  property: {
    address: string
    city: string
    currentValue?: number | null
    title: string
  }
  skipPhotos: boolean
  onChangeAddress: (value: string) => void
  onChangeListingType: (value: ListingType) => void
  onChangePrice: (value: string) => void
  onConfirm: (confirmed: boolean) => void
  onToggleSkipPhotos: () => void
}
