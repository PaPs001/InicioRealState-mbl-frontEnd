import { useAuth } from '../AuthContext'
import type { PropertyDomain } from './types'

export function usePropertyDomain(): PropertyDomain {
  const {
    userProperties,
    availableProperties,
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    favoriteProperties,
    favorites,
    loadFavoriteProperties,
    addNewFavoriteProperty,
    toggleFavorite,
    isFavorite,
    newLoadCatalogProperties,
    getPropertyById,
    loadCatalogProperties,
    loadAgentCatalogProperties,
  } = useAuth()

  return {
    userProperties,
    availableProperties,
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    favoriteProperties,
    favorites,
    loadFavoriteProperties,
    addNewFavoriteProperty,
    toggleFavorite,
    isFavorite,
    newLoadCatalogProperties,
    getPropertyById,
    loadCatalogProperties,
    loadAgentCatalogProperties,
  }
}

export default usePropertyDomain
