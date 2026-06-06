import { mockActiveRental, mockProperties, mockUsers } from '@/lib/mock-data'
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
  if (!tenantId || mockActiveRental.tenantId !== tenantId) {
    return {
      rental: null,
      property: null,
      landlord: null,
      agent: null,
      tenant: null,
      daysUntilPayment: 0,
    }
  }

  const rental = mockActiveRental
  const property = mockProperties.find((item) => item.id === rental.propertyId) || null
  const landlord = mockUsers.find((item) => item.id === rental.landlordId) || null
  const agent = mockUsers.find((item) => item.id === rental.agentId) || null
  const tenant = mockUsers.find((item) => item.id === rental.tenantId) || null

  return {
    rental,
    property,
    landlord,
    agent,
    tenant,
    daysUntilPayment: getDaysUntilRentalPayment(rental.paymentDay),
  }
}

export function getActiveRentalSnapshotByPropertyId(propertyId?: string | null): ActiveRentalSnapshot {
  if (!propertyId || mockActiveRental.propertyId !== propertyId) {
    return {
      rental: null,
      property: null,
      landlord: null,
      agent: null,
      tenant: null,
      daysUntilPayment: 0,
    }
  }

  return getActiveRentalSnapshotByTenantId(mockActiveRental.tenantId)
}
