import { useEffect, useMemo } from 'react'
import { useActivityDomain } from './use-activity-domain'
import { usePropertyDomain } from './use-property-domain'
import { useSessionDomain } from './use-session-domain'
import {
  getAppointmentSummary,
  getHomeSubGreeting,
  getHomeTheme,
  getLeadSummary,
  getPortfolioSummary,
  getTenantDashboardSnapshot,
  getVisibleAvailableProperties,
} from '@/lib/services/home-dashboard'

export function useHomeDashboard() {
  const session = useSessionDomain()
  const property = usePropertyDomain()
  const activity = useActivityDomain()

  useEffect(() => {
    if ((session.isAgent || session.isAdmin) && !property.hasLoadedCatalog && !property.isCatalogLoading) {
      property.loadCatalogProperties()
    }
  }, [
    property.hasLoadedCatalog,
    property.isCatalogLoading,
    property.loadCatalogProperties,
    session.isAdmin,
    session.isAgent,
  ])

  const portfolioSummary = useMemo(
    () => getPortfolioSummary(property.userProperties),
    [property.userProperties],
  )
  const leadSummary = useMemo(() => getLeadSummary(activity.userLeads), [activity.userLeads])
  const appointmentSummary = useMemo(
    () => getAppointmentSummary(activity.userAppointments),
    [activity.userAppointments],
  )
  const visibleAvailableProperties = useMemo(
    () => getVisibleAvailableProperties(property.availableProperties, property.hasLoadedCatalog),
    [property.availableProperties, property.hasLoadedCatalog],
  )
  const theme = useMemo(
    () =>
      getHomeTheme({
        isClient: session.isClient,
        isInvestor: session.isInvestor,
        isSearching: session.isSearching,
        isTenant: session.isTenant,
      }),
    [session.isClient, session.isInvestor, session.isSearching, session.isTenant],
  )
  const subGreeting = useMemo(
    () =>
      getHomeSubGreeting({
        isInvestor: session.isInvestor,
        isSearching: session.isSearching,
        isTenant: session.isTenant,
      }),
    [session.isInvestor, session.isSearching, session.isTenant],
  )
  const tenantDashboard = useMemo(
    () => getTenantDashboardSnapshot(session.currentUser),
    [session.currentUser],
  )

  const refreshHomeData = async () => {
    if (session.isAgent || session.isAdmin) {
      await property.loadCatalogProperties()
    }
  }

  return {
    ...session,
    ...property,
    ...activity,
    theme,
    subGreeting,
    visibleAvailableProperties,
    totalValue: portfolioSummary.totalValue,
    totalGains: portfolioSummary.totalGains,
    projectedValue: portfolioSummary.projectedValue,
    pendingLeads: leadSummary.pendingLeads,
    negotiatingLeads: leadSummary.negotiatingLeads,
    pendingAppointments: appointmentSummary.pendingAppointments,
    tenantRental: tenantDashboard.rental,
    tenantProperty: tenantDashboard.property,
    tenantLandlord: tenantDashboard.landlord,
    tenantAgent: tenantDashboard.agent,
    daysUntilPayment: tenantDashboard.daysUntilPayment,
    refreshHomeData,
  }
}

export default useHomeDashboard
