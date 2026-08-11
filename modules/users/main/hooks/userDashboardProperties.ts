import { useEffect, useMemo, useRef } from 'react'

import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import type { Property } from '@/lib/types'
import { getPropertyDisplayName } from '@/components/userDashboard/dashboard-formatters'

type AppointmentPropertyType = 'renta' | 'venta' | 'general' | string | null | undefined

type PropertySummary = {
  propertyCount: number
  opportunityAmount: number
}

function getDashboardPropertySource(
  catalogProperties: Property[],
  availableProperties: Property[],
) {
  return catalogProperties.length > 0 ? catalogProperties : availableProperties
}

function isRentAppointmentProperty(property: Property) {
  return (
    property.listingType === 'rent' ||
    property.status === 'for_rent' ||
    property.status === 'pending_rent' ||
    Boolean(property.monthlyRent)
  )
}

function isSaleAppointmentProperty(property: Property) {
  return (
    property.listingType === 'sale' ||
    property.status === 'for_sale' ||
    property.status === 'pending_sale'
  )
}

function buildAppointmentPropertyOptions(properties: Property[]) {
  const propertiesById = new Map<string, Property>()

  properties.forEach((property) => {
    const propertyId = property.id || property._id
    if (propertyId && !propertiesById.has(propertyId)) {
      propertiesById.set(propertyId, property)
    }
  })

  return Array.from(propertiesById.values()).sort((current, next) =>
    getPropertyDisplayName(current).localeCompare(getPropertyDisplayName(next)),
  )
}

function getRentSummary(properties: Property[]): PropertySummary {
  const rentProperties = properties.filter(
    (property) =>
      property.status === 'for_rent' || property.status === 'pending_rent',
  )
  const totalRent = rentProperties.reduce(
    (sum, property) => sum + (property.monthlyRent ?? property.price ?? 0),
    0,
  )

  return {
    propertyCount: rentProperties.length,
    opportunityAmount: totalRent * 0.05,
  }
}

function getSaleSummary(properties: Property[]): PropertySummary {
  const saleProperties = properties.filter(
    (property) =>
      property.status === 'for_sale' || property.status === 'pending_sale',
  )
  const totalSale = saleProperties.reduce(
    (sum, property) => sum + (property.monthlyRent ?? property.price ?? 0),
    0,
  )

  return {
    propertyCount: saleProperties.length,
    opportunityAmount: totalSale * 0.5,
  }
}

export function useDashboardProperties(appointmentType?: AppointmentPropertyType) {
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const hasRequestedInitialCatalogRef = useRef(false)

  useEffect(() => {
    if (hasLoadedCatalog || isCatalogLoading || hasRequestedInitialCatalogRef.current) return

    hasRequestedInitialCatalogRef.current = true
    console.info('[DashboardProperties][initial-load]', { service: 'catalog-properties' })
    void loadCatalogProperties()
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const dashboardProperties = useMemo(
    () => getDashboardPropertySource(catalogProperties, availableProperties),
    [availableProperties, catalogProperties],
  )

  const rentSummary = useMemo(
    () => getRentSummary(dashboardProperties),
    [dashboardProperties],
  )

  const saleSummary = useMemo(
    () => getSaleSummary(dashboardProperties),
    [dashboardProperties],
  )

  const appointmentPropertyOptions = useMemo(
    () => buildAppointmentPropertyOptions(dashboardProperties),
    [dashboardProperties],
  )

  const filteredAppointmentPropertyOptions = useMemo(() => {
    const normalizedAppointmentType = appointmentType?.trim().toLowerCase() || 'general'

    if (normalizedAppointmentType === 'renta') {
      return appointmentPropertyOptions.filter(isRentAppointmentProperty)
    }

    if (normalizedAppointmentType === 'venta') {
      return appointmentPropertyOptions.filter(isSaleAppointmentProperty)
    }

    return appointmentPropertyOptions
  }, [appointmentPropertyOptions, appointmentType])

  return {
    appointmentPropertyOptions,
    availableProperties,
    catalogProperties,
    filteredAppointmentPropertyOptions,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
    rentSummary,
    saleSummary,
  }
}
