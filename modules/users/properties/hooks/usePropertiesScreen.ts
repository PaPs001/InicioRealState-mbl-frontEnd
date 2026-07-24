import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Property } from '@/lib/types'
import { getAvailableModuleProperties } from '../services/properties.service'

function normalizeText(value?: string | null) {
  return (value ?? '').trim().toLowerCase()
}

function getPropertySearchText(property: Property) {
  return [
    property.id,
    property._id,
    property.title,
    property.address,
    property.city,
    property.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function usePropertiesScreen(authToken?: string | null) {
  const [properties, setProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    if (!authToken) {
      setProperties([])
      setErrorMessage('No hay una sesion activa para cargar propiedades.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const nextProperties = await getAvailableModuleProperties(authToken)
      setProperties(nextProperties)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No se pudieron cargar las propiedades.'

      setProperties([])
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const filteredProperties = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery)

    if (!normalizedQuery) {
      return properties
    }

    return properties.filter(property => getPropertySearchText(property).includes(normalizedQuery))
  }, [properties, searchQuery])

  return {
    errorMessage,
    filteredProperties,
    isLoading,
    properties,
    reload: loadProperties,
    searchQuery,
    setSearchQuery,
  }
}
