import type { AppCapabilities, OperationMode } from './types'

export function getCapabilities(operationMode: OperationMode): AppCapabilities {
  const canViewRentals = operationMode === 'rent' || operationMode === 'both'
  const canViewSales = operationMode === 'sale' || operationMode === 'both'

  return {
    canViewRentals,
    canViewSales,
    canCreateRentalFollowUp: canViewRentals,
    canCreateSalesLead: canViewSales,
  }
}
