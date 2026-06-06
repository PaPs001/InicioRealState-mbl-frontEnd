import { mockProperties, mockSaleRentRegistrations, mockUsers } from '@/lib/mock-data'

export type PendingReviewRecord = {
  agentName: string
  amount: number
  clientName: string
  commissionAmount: number
  createdDate: string
  id: string
  propertyTitle: string
  status: 'pending_review'
  type: 'sale' | 'rent'
}

export function getPendingReviewRegistrations(): PendingReviewRecord[] {
  return mockSaleRentRegistrations
    .filter((registration) => registration.status === 'pending_review')
    .map((registration) => {
      const property = mockProperties.find((item) => item.id === registration.propertyId)
      const agent = mockUsers.find((user) => user.id === registration.agentId)

      return {
        id: registration.id,
        type: registration.type,
        propertyTitle: property?.title ?? 'Propiedad sin asignar',
        agentName: agent?.name ?? 'Asesor no asignado',
        clientName: registration.clientName,
        amount: registration.transactionAmount,
        commissionAmount: registration.commissionAmount,
        status: 'pending_review',
        createdDate: registration.createdDate,
      }
    })
}
