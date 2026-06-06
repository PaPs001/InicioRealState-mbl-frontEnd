import { getDocumentContractRecords } from '@/lib/api'

export type RentalContractCard = {
  id: string
  tenantName: string
  ownerName: string
  startDate: string
  endDate: string
  propertyTitle: string
  statusLabel: string
}

export function getRentalContracts(): RentalContractCard[] {
  return getDocumentContractRecords()
}
