import type { Property } from '@/lib/types'

export type BuyerStep = 'name' | 'email' | 'phone' | 'password' | 'search-preferences' | 'loading' | 'suggestions'

export interface BuyerFormData {
  name: string
  email: string
  phone: string
  password: string
  searchType: 'buy' | 'rent' | ''
}

export interface BuyerInputStepContent {
  title: string
  subtitle: string
  hint: string
  icon: any
  placeholder: string
  value: string
  onChange: (text: string) => void
  keyboardType: 'default' | 'email-address' | 'phone-pad'
  secureTextEntry?: boolean
}

export type SuggestedProperty = Property
