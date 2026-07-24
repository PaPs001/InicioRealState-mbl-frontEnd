import {
  getPortfolioAgentRecord,
  getPortfolioOwnerProperties,
  getPortfolioPropertyEarningsRecord,
  getPortfolioPropertyRecord,
} from '@/lib/api'
import { getActiveRentalSnapshotByPropertyId } from '@/lib/services/active-rental-domain'
import type { ActiveRental, Property, PropertyEarnings, User } from '@/lib/types'

export type PortfolioPropertyDetail = {
  agent: User | null
  earnings: PropertyEarnings | null
  property: Property | null
  rental: ActiveRental | null
  tenant: User | null
}

export function getPortfolioPropertiesByOwner(ownerId?: string | null): Property[] {
  return getPortfolioOwnerProperties(ownerId)
}

export function getPortfolioPropertyDetail(propertyId?: string | null): PortfolioPropertyDetail {
  if (!propertyId) {
    return {
      agent: null,
      earnings: null,
      property: null,
      rental: null,
      tenant: null,
    }
  }

  const property = getPortfolioPropertyRecord(propertyId)
  const earnings = getPortfolioPropertyEarningsRecord(propertyId)
  const rentalSnapshot = property?.status === 'rented' ? getActiveRentalSnapshotByPropertyId(propertyId) : null
  const rental = rentalSnapshot?.property?.id === propertyId ? rentalSnapshot.rental : null
  const tenant = rentalSnapshot?.property?.id === propertyId ? rentalSnapshot.tenant : null
  const agent = getPortfolioAgentRecord(property?.agentId)

  return {
    agent,
    earnings,
    property,
    rental,
    tenant,
  }
}

export function getPortfolioPropertyIncomeProjection(property: Property) {
  const currentValue = property.currentValue || property.price

  return {
    estimatedMonthlyRent: currentValue * 0.006,
    estimatedAnnualAppreciation: currentValue * 0.1,
  }
}
