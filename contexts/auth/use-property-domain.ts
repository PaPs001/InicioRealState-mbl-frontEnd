import { useAuth } from '../AuthContext'
import type { PropertyDomain } from './types'

export function usePropertyDomain(): PropertyDomain {
  const {
    userProperties,
    availableProperties,
    catalogProperties,
    catalogFilters,
    catalogError,
    isCatalogLoading,
    hasLoadedCatalog,
    getPropertyById,
    loadCatalogProperties,
  } = useAuth()

  return {
    userProperties,
    availableProperties,
    catalogProperties,
    catalogFilters,
    catalogError,
    isCatalogLoading,
    hasLoadedCatalog,
    getPropertyById,
    loadCatalogProperties,
  }
}

export default usePropertyDomain
