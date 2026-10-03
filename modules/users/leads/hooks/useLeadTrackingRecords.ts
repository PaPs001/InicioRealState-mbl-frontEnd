import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { getBackendLeadV2Records } from '@/lib/api'
import type { PropertyLead } from '@/lib/types'

export function useLeadTrackingRecords() {
  const { authToken } = useSessionDomain()
  const [leads, setLeads] = useState<PropertyLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const request = useRef(0)
  const reload = useCallback(async () => {
    const current = ++request.current
    setError(null)
    setIsLoading(true)
    if (!authToken) {
      setLeads([])
      setIsLoading(false)
      return
    }
    try {
      const records = await getBackendLeadV2Records(authToken)
      if (current === request.current) setLeads(records)
    } catch {
      if (current === request.current) {
        setLeads([])
        setError('No se pudieron cargar los leads. Intenta nuevamente.')
      }
    } finally {
      if (current === request.current) setIsLoading(false)
    }
  }, [authToken])

  useFocusEffect(useCallback(() => {
    setLeads([])
    void reload()
    return () => { request.current += 1 }
  }, [reload]))

  return { leads, isLoading, error, reload }
}
