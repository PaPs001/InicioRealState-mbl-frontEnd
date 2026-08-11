import { useCallback, useMemo, useRef, useState } from 'react'

import type { Property } from '@/lib/types'
import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import {
  findPropertyById,
  getAvailableProperties,
  loadAgentCatalogPropertiesFromApi,
  loadCatalogPropertiesFromApi,
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
  const [agentCatalogProperties, setAgentCatalogProperties] = useState<Property[]>([])
  const [agentCatalogRawData, setAgentCatalogRawData] = useState<PropertyCatalogItemResponse[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [isAgentCatalogLoading, setIsAgentCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)
  const [hasLoadedAgentCatalog, setHasLoadedAgentCatalog] = useState(false)
  const isLoadingCatalogRef = useRef(false)
  const isLoadingAgentCatalogRef = useRef(false)

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
        agentCatalogProperties,
        catalogProperties,
      }),
    [agentCatalogProperties, catalogProperties],
  )

  const loadCatalogProperties = useCallback(async () => {
    if (isLoadingCatalogRef.current) return
    isLoadingCatalogRef.current = true
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
      isLoadingCatalogRef.current = false
    }
  }, [])

  const newLoadCatalogProperties = useCallback(async () => {
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

  const loadAgentCatalogProperties = useCallback(async () => {
    if (isLoadingAgentCatalogRef.current) return
    isLoadingAgentCatalogRef.current = true
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
      isLoadingAgentCatalogRef.current = false
    }
  }, [])

  const resetPropertyState = useCallback(() => {
    setCatalogProperties([])
    setAgentCatalogProperties([])
    setAgentCatalogRawData([])
    setHasLoadedCatalog(false)
    setHasLoadedAgentCatalog(false)
  }, [])

  return {
    catalogProperties,
    agentCatalogProperties,
    agentCatalogRawData,
    isCatalogLoading,
    isAgentCatalogLoading,
    hasLoadedCatalog,
    hasLoadedAgentCatalog,
    userProperties,
    availableProperties,
    getPropertyById,
    loadCatalogProperties,
    newLoadCatalogProperties,
    loadAgentCatalogProperties,
    resetPropertyState,
  }
}

export default usePropertyState
