import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Property } from '@/lib/types'
import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import {
  addFavoritePropertyForUser,
  findPropertyById,
  getAvailableProperties,
  loadAgentCatalogPropertiesFromApi,
  loadCatalogPropertiesFromApi,
  loadCatalogPropertiesFromCore,
  loadFavoritePropertiesFromApi,
  removeFavoritePropertyForUser,
} from '@/lib/services/property-domain'
import { getUserProperties } from '@/lib/services/user-properties'

type PropertyStateParams = {
  authToken: string | null
  currentUserId?: string | null
  isAdmin: boolean
  isAgent: boolean
}

export function usePropertyState(params: PropertyStateParams) {
  const { authToken, currentUserId, isAdmin, isAgent } = params
  const [favorites, setFavorites] = useState<string[]>([])
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([])
  const [agentCatalogProperties, setAgentCatalogProperties] = useState<Property[]>([])
  const [agentCatalogRawData, setAgentCatalogRawData] = useState<PropertyCatalogItemResponse[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [isAgentCatalogLoading, setIsAgentCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)
  const [hasLoadedAgentCatalog, setHasLoadedAgentCatalog] = useState(false)
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])

  const userProperties = useMemo(() => getUserProperties(currentUserId), [currentUserId])

  const availableProperties = useMemo(
    () =>
      getAvailableProperties({
        catalogProperties,
        currentUserId,
        hasLoadedCatalog,
        isAdmin,
        isAgent,
      }),
    [catalogProperties, currentUserId, hasLoadedCatalog, isAdmin, isAgent],
  )

  const loadFavoriteProperties = useCallback(async () => {
    if (!currentUserId) {
      setFavoriteProperties([])
      setFavorites([])
      return
    }

    try {
      console.log('loadFavoriteProperties payload:', {
        userId: currentUserId,
        token: authToken,
      })
      const data = await loadFavoritePropertiesFromApi(currentUserId, authToken ?? undefined)
      setFavoriteProperties(data.favoriteProperties)
      setFavorites(data.favoriteIds)
    } catch (error) {
      console.error('Error cargando los datos mi buen amigo', error)
      setFavoriteProperties([])
      setFavorites([])
    }
  }, [authToken, currentUserId])

  useEffect(() => {
    loadFavoriteProperties()
  }, [loadFavoriteProperties])

  const getPropertyById = useCallback(
    (id: string) =>
      findPropertyById({
        id,
        favoriteProperties,
        agentCatalogProperties,
        catalogProperties,
      }),
    [agentCatalogProperties, catalogProperties, favoriteProperties],
  )

  const addNewFavoriteProperty = useCallback(
    async (propertyId: string) => {
      console.log('addFavoriteProperty payload:', {
        propertyId,
        token: authToken,
      })

      const result = await addFavoritePropertyForUser({
        currentFavorites: favorites,
        currentUserId,
        property: getPropertyById(propertyId),
        propertyId,
        token: authToken,
      })

      setFavorites(result.favoriteIds)
      setFavoriteProperties(result.favoritePropertiesUpdater)
    },
    [authToken, currentUserId, favorites, getPropertyById],
  )

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (favorites.includes(propertyId)) {
        console.log('deleteFavoriteProperties payload:', {
          propertyId,
          token: authToken,
        })

        const result = await removeFavoritePropertyForUser({
          currentFavorites: favorites,
          currentUserId,
          propertyId,
          token: authToken,
        })

        setFavorites(result.favoriteIds)
        setFavoriteProperties(result.favoritePropertiesUpdater)
        return
      }

      await addNewFavoriteProperty(propertyId)
    },
    [addNewFavoriteProperty, authToken, currentUserId, favorites],
  )

  const isFavorite = useCallback((propertyId: string) => favorites.includes(propertyId), [favorites])

  const loadCatalogProperties = useCallback(async () => {
    setIsCatalogLoading(true)
    setHasLoadedCatalog(true)
    try {
      const properties = await loadCatalogPropertiesFromApi()
      setCatalogProperties(properties)
    } catch (error) {
      console.error('Error loading catalog properties:', error)
      setCatalogProperties([])
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  const newLoadCatalogProperties = useCallback(async () => {
    if (!authToken) {
      setHasLoadedCatalog(false)
      setCatalogProperties([])
      return
    }

    setIsCatalogLoading(true)
    try {
      const properties = await loadCatalogPropertiesFromCore(authToken)
      setCatalogProperties(properties)
      setHasLoadedCatalog(true)
    } catch (error) {
      console.error('Error loading catalog properties:', error)
      setCatalogProperties([])
      setHasLoadedCatalog(false)
    } finally {
      setIsCatalogLoading(false)
    }
  }, [authToken])

  const loadAgentCatalogProperties = useCallback(async () => {
    setIsAgentCatalogLoading(true)
    setHasLoadedAgentCatalog(true)
    try {
      const { properties, rawData } = await loadAgentCatalogPropertiesFromApi()
      setAgentCatalogProperties(properties)
      setAgentCatalogRawData(rawData)
    } catch (error) {
      console.error('Error loading agent catalog properties:', error)
      setAgentCatalogProperties([])
      setAgentCatalogRawData([])
    } finally {
      setIsAgentCatalogLoading(false)
    }
  }, [])

  const replaceFavoriteIds = useCallback((nextFavorites: string[]) => {
    setFavorites(nextFavorites)
  }, [])

  const resetPropertyState = useCallback(() => {
    setFavorites([])
    setFavoriteProperties([])
  }, [])

  return {
    favorites,
    favoriteProperties,
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    userProperties,
    availableProperties,
    loadFavoriteProperties,
    addNewFavoriteProperty,
    toggleFavorite,
    isFavorite,
    getPropertyById,
    loadCatalogProperties,
    newLoadCatalogProperties,
    loadAgentCatalogProperties,
    replaceFavoriteIds,
    resetPropertyState,
  }
}

export default usePropertyState
