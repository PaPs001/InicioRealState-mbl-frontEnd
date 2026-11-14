import { useAuth } from '../AuthContext'
import type { PropertyDomain } from './types'

export function usePropertyDomain(): PropertyDomain {
  const {
    userProperties,
    catalogProperties,
    catalogResetVersion,
    hasMoreCatalog,
    loadMoreCatalogProperties,
    retryCatalogPage,
    catalogFilters,
    catalogError,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
  } = useAuth()

  return {
    userProperties,
    catalogProperties,
    catalogResetVersion,
    hasMoreCatalog,
    loadMoreCatalogProperties,
    retryCatalogPage,
    catalogFilters,
    catalogError,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
  }
}

export default usePropertyDomain
