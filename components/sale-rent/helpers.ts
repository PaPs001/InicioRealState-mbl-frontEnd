import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import type { SaleRentRegistration } from '@/lib/types'

import { DOCUMENTS_LIST, STEP_TITLES } from './constants'
import type { StepType } from './types'

export function getStepTitle(step: StepType): string {
  return STEP_TITLES[step]
}

export function resolveInternalPriceAmount(
  priceOption: 'original' | 'min' | 'custom',
  customAmount: string,
  selectedPropertyRaw: PropertyCatalogItemResponse | null,
): number {
  if (priceOption === 'custom') return Number(customAmount || 0)
  if (priceOption === 'min') return Number(selectedPropertyRaw?.minPrice || 0)
  return Number(selectedPropertyRaw?.maxPrice || 0)
}

export function buildSaleRentRegistration(params: {
  clientComments: string
  clientEmail: string
  clientName: string
  clientPhone: string
  customAmount: string
  currentUserId?: string
  externalAgentName: string
  externalCommission: string
  listingSource: 'internal' | 'external' | null
  myCommission: string
  propertyDescription: string
  propertyPrice: string
  referralCode: string
  selectedDocuments: string[]
  selectedProperty: string | null
  selectedPropertyRaw: PropertyCatalogItemResponse | null
  totalCommission: string
  transactionType: 'sale' | 'rent'
}): SaleRentRegistration {
  const {
    clientComments,
    clientEmail,
    clientName,
    clientPhone,
    customAmount,
    currentUserId,
    externalAgentName,
    externalCommission,
    listingSource,
    myCommission,
    propertyDescription,
    propertyPrice,
    referralCode,
    selectedDocuments,
    selectedProperty,
    selectedPropertyRaw,
    totalCommission,
    transactionType,
  } = params

  return {
    id: `reg-local-${Date.now()}`,
    propertyId: selectedProperty || 'prop-2',
    agentId: currentUserId || 'user-4',
    type: transactionType,
    transactionAmount: Number(customAmount || propertyPrice || selectedPropertyRaw?.maxPrice || 0),
    originalPrice: selectedPropertyRaw?.maxPrice || Number(propertyPrice || 0) || undefined,
    startDate: transactionType === 'rent' ? '2026-06-02' : undefined,
    endDate: transactionType === 'rent' ? '2027-06-01' : undefined,
    duration: transactionType === 'rent' ? 12 : undefined,
    commissionRate: Number(totalCommission || 5),
    commissionAmount: Number(myCommission || externalCommission || totalCommission || 0),
    isExternalProperty: listingSource === 'external',
    isSharedCommission: !!externalAgentName.trim(),
    sharedAgentName: externalAgentName || undefined,
    sharedCommissionRate: externalCommission ? Number(externalCommission) : undefined,
    agentCommission: myCommission ? Number(myCommission) : undefined,
    referralCode: referralCode || undefined,
    referralValid: !!referralCode,
    clientName,
    clientPhone,
    clientEmail: clientEmail || undefined,
    documents: [],
    pendingDocuments: DOCUMENTS_LIST
      .filter(doc => doc.required && !selectedDocuments.includes(doc.id))
      .map(doc => doc.label),
    status: 'pending_review',
    createdDate: new Date().toISOString().slice(0, 10),
    notes: clientComments || propertyDescription || undefined,
  }
}

export function appendRegistration(
  localRegistrations: SaleRentRegistration[],
  registration: SaleRentRegistration,
): SaleRentRegistration[] {
  return [registration, ...localRegistrations]
}
