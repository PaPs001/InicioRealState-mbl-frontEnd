import { useAuth } from '../AuthContext'
import type { PropertyDomain } from './types'

export function usePropertyDomain(): PropertyDomain {
  const {
    userProperties,
    availableProperties,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    getPropertyById,
    loadCatalogProperties,
  } = useAuth()

  return {
    userProperties,
    availableProperties,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    getPropertyById,
    loadCatalogProperties,
  }
}

export default usePropertyDomain
