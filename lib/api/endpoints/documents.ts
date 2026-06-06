import { mockProperties, mockSaleRentRegistrations, mockUsers } from '@/lib/mock-data'
import { getActiveRentalSnapshotByTenantId } from '@/lib/services/active-rental-domain'

export type DocumentContractRecord = {
  id: string
  tenantName: string
  ownerName: string
  startDate: string
  endDate: string
  propertyTitle: string
  statusLabel: string
}

export function getDocumentContractRecords(): DocumentContractRecord[] {
  const activeRentalSnapshot = getActiveRentalSnapshotByTenantId('tenant-1')
  const { rental, property: activeRentalProperty, tenant: activeRentalTenant, landlord: activeRentalOwner } =
    activeRentalSnapshot

  const establishedContracts: DocumentContractRecord[] = rental
    ? [
        {
          id: rental.id,
          tenantName: activeRentalTenant?.name || 'Inquilino no asignado',
          ownerName: activeRentalOwner?.name || 'Propietario no asignado',
          startDate: rental.startDate,
          endDate: rental.endDate,
          propertyTitle: activeRentalProperty?.title || 'Propiedad vinculada',
          statusLabel: 'Activo',
        },
      ]
    : []

  const approvedRegistrations = mockSaleRentRegistrations
    .filter((registration) => registration.type === 'rent' && registration.status === 'approved')
    .map((registration) => {
      const property = mockProperties.find((item) => item.id === registration.propertyId)
      const owner = property?.ownerId ? mockUsers.find((user) => user.id === property.ownerId) : undefined

      return {
        id: registration.id,
        tenantName: registration.clientName,
        ownerName: owner?.name || 'Propietario por confirmar',
        startDate: registration.startDate || registration.createdDate,
        endDate: registration.endDate || registration.createdDate,
        propertyTitle: property?.title || 'Propiedad externa',
        statusLabel: 'Establecido',
      } satisfies DocumentContractRecord
    })

  return [...establishedContracts, ...approvedRegistrations]
}
