import type { Appointment, Property, PropertyLead } from '@/lib/types'
import type { AppTheme, ClientRole } from '@/lib/theme'
import { getAppThemeByRole } from '@/lib/theme'

export function getHomeClientRole(params: {
  isInvestor: boolean
  isTenant: boolean
}): ClientRole {
  const { isInvestor, isTenant } = params

  if (isInvestor) return 'investor'
  if (isTenant) return 'tenant'
  return 'searching'
}

export function getHomeTheme(params: {
  isClient: boolean
  isInvestor: boolean
  isTenant: boolean
  isSearching: boolean
}): AppTheme | null {
  const { isClient, isInvestor, isSearching, isTenant } = params

  if (!isClient) {
    return null
  }

  return getAppThemeByRole({
    isInvestor,
    isSearching,
    isTenant,
  })
}

export function getHomeSubGreeting(params: {
  isInvestor: boolean
  isSearching: boolean
  isTenant: boolean
}): string {
  const { isInvestor, isSearching, isTenant } = params

  if (isInvestor) return 'Bienvenido a tu panel de inversiones'
  if (isSearching) return 'Encuentra tu propiedad ideal'
  if (isTenant) return 'Bienvenido a tu espacio'
  return 'Bienvenido'
}

export function getPortfolioSummary(userProperties: Property[]) {
  const totalValue = userProperties.reduce((acc, property) => acc + (property.currentValue || property.price), 0)
  const totalGains = userProperties.reduce((acc, property) => {
    if (property.currentValue && property.currentValue > property.price) {
      return acc + (property.currentValue - property.price)
    }
    return acc
  }, 0)

  return {
    totalValue,
    totalGains,
    projectedValue: totalValue * 1.1,
  }
}

export function getLeadSummary(userLeads: PropertyLead[]) {
  return {
    pendingLeads: userLeads.filter((lead) => lead.status === 'nuevo').length,
    negotiatingLeads: userLeads.filter((lead) => lead.status === 'negociando').length,
  }
}

export function getAppointmentSummary(userAppointments: Appointment[]) {
  return {
    pendingAppointments: userAppointments.filter((appointment) => appointment.status === 'pending').length,
  }
}

export function getVisibleAvailableProperties(availableProperties: Property[], hasLoadedCatalog: boolean) {
  return hasLoadedCatalog ? availableProperties : []
}
