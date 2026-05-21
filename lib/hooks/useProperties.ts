/**
 * Hook para manejar propiedades con filtrado, busqueda y ordenamiento
 */
import { useMemo, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Property } from '@/lib/types'

export type PropertyFilter = 'all' | 'sale' | 'rent' | 'owned' | 'rented'
export type PropertySort = 'newest' | 'price_asc' | 'price_desc' | 'name'

interface UsePropertiesOptions {
  source?: 'catalog' | 'user' | 'favorites' | 'all'
  initialFilter?: PropertyFilter
  initialSort?: PropertySort
}

interface UsePropertiesResult {
  properties: Property[]
  filteredProperties: Property[]
  isLoading: boolean
  hasLoaded: boolean
  
  // Filtrado
  searchQuery: string
  setSearchQuery: (query: string) => void
  filter: PropertyFilter
  setFilter: (filter: PropertyFilter) => void
  sort: PropertySort
  setSort: (sort: PropertySort) => void
  
  // Acciones
  refresh: () => Promise<void>
  getPropertyById: (id: string) => Property | undefined
  
  // Favoritos
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
}

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const {
    source = 'catalog',
    initialFilter = 'all',
    initialSort = 'newest',
  } = options

  const {
    catalogProperties,
    userProperties,
    availableProperties,
    favorites,
    toggleFavorite,
    isFavorite,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
    getPropertyById,
  } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<PropertyFilter>(initialFilter)
  const [sort, setSort] = useState<PropertySort>(initialSort)

  // Seleccionar propiedades segun la fuente
  const properties = useMemo(() => {
    switch (source) {
      case 'catalog':
        return catalogProperties
      case 'user':
        return userProperties
      case 'favorites':
        const allProps = [...availableProperties, ...userProperties]
        return allProps.filter(p => favorites.includes(p.id))
      case 'all':
      default:
        return availableProperties
    }
  }, [source, catalogProperties, userProperties, availableProperties, favorites])

  // Filtrar propiedades
  const filteredProperties = useMemo(() => {
    let result = [...properties]

    // Filtrar por busqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      )
    }

    // Filtrar por tipo
    switch (filter) {
      case 'sale':
        result = result.filter(p => p.status === 'for_sale' || p.status === 'available')
        break
      case 'rent':
        result = result.filter(p => p.status === 'for_rent' || p.status === 'available')
        break
      case 'owned':
        result = result.filter(p => p.status === 'owned')
        break
      case 'rented':
        result = result.filter(p => p.status === 'rented')
        break
    }

    // Ordenar
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'newest':
      default:
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [properties, searchQuery, filter, sort])

  const refresh = useCallback(async () => {
    if (source === 'catalog' || source === 'all') {
      await loadCatalogProperties()
    }
  }, [source, loadCatalogProperties])

  return {
    properties,
    filteredProperties,
    isLoading: source === 'catalog' ? isCatalogLoading : false,
    hasLoaded: source === 'catalog' ? hasLoadedCatalog : true,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sort,
    setSort,
    refresh,
    getPropertyById,
    toggleFavorite,
    isFavorite,
  }
}

export default useProperties
