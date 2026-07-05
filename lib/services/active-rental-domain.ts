import type { ActiveRental, Property, User } from '@/lib/types'

export type ActiveRentalSnapshot = {
  rental: ActiveRental | null
  property: Property | null
  landlord: User | null
  agent: User | null
  tenant: User | null
  daysUntilPayment: number
}

export function getDaysUntilRentalPayment(paymentDay: number) {
  const today = new Date()
  const paymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)

  if (paymentDate < today) {
    paymentDate.setMonth(paymentDate.getMonth() + 1)
  }

  const diffTime = paymentDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getActiveRentalSnapshotByTenantId(tenantId?: string | null): ActiveRentalSnapshot {
  return {
    rental: null,
    property: null,
    landlord: null,
    agent: null,
    tenant: null,
    daysUntilPayment: 0,
  }
}

export function getActiveRentalSnapshotByPropertyId(propertyId?: string | null): ActiveRentalSnapshot {
  return getActiveRentalSnapshotByTenantId(propertyId)
}
