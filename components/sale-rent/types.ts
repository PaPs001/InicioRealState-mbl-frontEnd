export type StepType =
  | 'transaction-type'
  | 'listing-source'
  | 'select-property'
  | 'internal-price'
  | 'property-type'
  | 'property-details'
  | 'property-location'
  | 'property-amenities'
  | 'property-measurements'
  | 'property-photos'
  | 'property-pricing'
  | 'property-name'
  | 'owner-info'
  | 'external-agent-info'
  | 'client-info'
  | 'documents'
  | 'summary'

export type ScreenMode = 'records' | 'new'

export type DocumentFiles = Record<string, { name: string; uri: string } | null>

export type ExistingClient = {
  id: string
  name: string
  phone: string
  email: string
}
