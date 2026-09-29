import { useCallback, useMemo, useRef, useState } from 'react'

import type { Property } from '@/lib/types'
import {
  findPropertyById,
  getAvailableProperties,
  loadCatalogPropertiesFromCore,
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
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)
  const isLoadingCatalogRef = useRef(false)

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

  const getPropertyById = useCallback(
    (id: string) =>
      findPropertyById({
        id,
        catalogProperties,
      }),
    [catalogProperties],
  )

  const loadCatalogProperties = useCallback(async () => {
    if (!authToken) {
      setHasLoadedCatalog(false)
      setCatalogProperties([])
      return
    }
    if (isLoadingCatalogRef.current) return

    isLoadingCatalogRef.current = true
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
      isLoadingCatalogRef.current = false
    }
  }, [authToken])

  const resetPropertyState = useCallback(() => {
    setCatalogProperties([])
    setHasLoadedCatalog(false)
  }, [])

  return {
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    userProperties,
    availableProperties,
    getPropertyById,
    loadCatalogProperties,
    resetPropertyState,
  }
}

export default usePropertyState
