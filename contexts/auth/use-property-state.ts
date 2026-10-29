import type { Filters } from "@/lib/api/endpoints/catalog"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Property } from '@/lib/types'
import {
  findPropertyById,
  getAvailableProperties,
  loadCatalogPropertiesWithFilter,
} from '@/lib/services/property-domain'
import { getUserProperties } from '@/lib/services/user-properties'

const MAX_CACHED_PROPERTIES_PER_LIST = 15

type CatalogCacheEntry = {
  key: string
  properties: Property[]
}

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
  const [catalogFilters, setCatalogFilters] = useState<Filters | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const requestVersion = useRef(0)
  const activeKey = useRef<string | null>(null)
  // One filtered snapshot per listing type, with at most 15 properties each.
  const catalogCache = useRef<Partial<Record<'rent' | 'sale', CatalogCacheEntry>>>({})
  const pending = useRef<{ key: string; promise: Promise<boolean>; controller: AbortController } | null>(null)

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

  const resetPropertyState = useCallback(() => {
    requestVersion.current += 1
    pending.current?.controller.abort()
    activeKey.current = null
    catalogCache.current = {}
    pending.current = null
    setCatalogProperties([])
    setHasLoadedCatalog(false)
    setCatalogFilters(null)
    setCatalogError(null)
    setIsCatalogLoading(false)
  }, [])

  useEffect(() => { resetPropertyState() }, [authToken, resetPropertyState])
  useEffect(() => () => {
    requestVersion.current += 1
    pending.current?.controller.abort()
  }, [])

  const loadCatalogProperties = useCallback((filters: Filters = {}, force = false): Promise<boolean> => {
    if (!authToken) return Promise.resolve(false)
    const normalized = {
      list: filters.list || undefined,
      zone: filters.zone || undefined,
      equiped: filters.equiped || undefined,
    }
    const key = JSON.stringify(normalized)
    if (pending.current?.key === key) return pending.current.promise
    if (!force && !pending.current && activeKey.current === key) return Promise.resolve(true)
    const list = normalized.list === 'rent' || normalized.list === 'sale' ? normalized.list : null
    const cached = list ? catalogCache.current[list] : undefined
    if (!force && cached?.key === key) {
      requestVersion.current += 1
      pending.current?.controller.abort()
      pending.current = null
      activeKey.current = key
      setCatalogProperties(cached.properties)
      setCatalogFilters(normalized)
      setHasLoadedCatalog(true)
      setCatalogError(null)
      setIsCatalogLoading(false)
      return Promise.resolve(true)
    }
    const version = ++requestVersion.current
    pending.current?.controller.abort()
    const controller = new AbortController()
    setIsCatalogLoading(true)
    setCatalogError(null)
    const promise = (async () => {
      try {
        const properties = await loadCatalogPropertiesWithFilter(normalized, authToken, controller.signal)
        if (version !== requestVersion.current) return false
        setCatalogProperties(properties)
        setCatalogFilters(normalized)
        setHasLoadedCatalog(true)
        activeKey.current = key
        if (list) {
          catalogCache.current[list] = {
            key,
            properties: properties.slice(0, MAX_CACHED_PROPERTIES_PER_LIST),
          }
        }
        return true
      } catch {
        if (version === requestVersion.current) {
          setCatalogError('No se pudieron cargar las propiedades. Intenta nuevamente.')
        }
        return false
      } finally {
        if (version === requestVersion.current) {
          setIsCatalogLoading(false)
          pending.current = null
        }
      }
    })()
    pending.current = { key, promise, controller }
    return promise
  }, [authToken])

  return {
    catalogProperties,
    catalogFilters,
    catalogError,
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
