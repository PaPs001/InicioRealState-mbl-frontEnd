import { getAuthMockUserById, getPropertyRecordById } from '@/lib/api'
import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import type { SaleRentRegistration } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export function getRecordPropertyTitle(
  record: SaleRentRegistration,
  agentCatalogRawData: PropertyCatalogItemResponse[],
) {
  const catalogProperty = agentCatalogRawData.find((item) => item.id === record.propertyId)
  const property = getPropertyRecordById(record.propertyId)

  return (
    catalogProperty?.name ||
    property?.title ||
    property?.address ||
    catalogProperty?.address ||
    record.clientName
  )
}

export function getRecordAgentName(agentId?: string | null) {
  if (!agentId) {
    return 'Sin asesor asignado'
  }

  return getAuthMockUserById(agentId)?.name ?? 'Sin asesor asignado'
}

export function getRecordStatusLabel(status: SaleRentRegistration['status']) {
  if (status === 'approved') return 'Aprobado'
  if (status === 'rejected') return 'Rechazado'
  return 'En revision'
}

export function formatRecordAmount(amount: number) {
  return formatCurrency(amount)
}

export function formatRecordDate(date: string) {
  return formatDate(date)
}
