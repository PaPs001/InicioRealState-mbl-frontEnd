import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  createBackendLeadV2Record,
  createBackendLeadV2Status,
  deleteBackendLeadV2Status,
  getBackendLeadV2Records,
  getBackendLeadV2Statuses,
  setBackendLeadV2NextAction,
  setBackendLeadV2Status,
  getBackendLeadV2Followings,
  type BackendLeadV2FollowingRecord
} from '@/lib/api'
import {
  LEADS_PAGE_SIZE,
  coordinatorLeadV2Channels,
  emptyLeadV2CreateForm,
  type AgentLeadGroup,
  type CoordinatorLeadV2Channel,
  type LeadPropertyOption,
  type LeadV2CreateForm,
  type LeadV2ViewModel,
} from './types'
import {
  buildAgentLeadGroups,
  buildLeadV2Alerts,
  buildLeadV2Metrics,
  buildPropertyOptions,
  formatPropertyPrice,
  mapPropertyLeadToLeadV2ViewModel,
  normalizeSearch,
} from './lead-v2-utils'

type UseLeadsV2ScreenParams = {
  isAdviserRoute: boolean
  selectedLeadIdParam: string
}

export function useLeadsV2Screen({ isAdviserRoute, selectedLeadIdParam }: UseLeadsV2ScreenParams) {
  const { authToken } = useSessionDomain()
  const {
    availableProperties,
    catalogProperties,
    getPropertyById,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<CoordinatorLeadV2Channel>('Todos')
  const [isAssistantOpen, setIsAssistantOpen] = useState(true)
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadV2ViewModel | null>(null)
  const [leadPage, setLeadPage] = useState(1)
  const [leads, setLeads] = useState<LeadV2ViewModel[]>([])
  const [customLeadStatuses, setCustomLeadStatuses] = useState<string[]>([])
  const [isLoadingCustomLeadStatuses, setIsLoadingCustomLeadStatuses] = useState(false)
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false)
  const [createLeadForm, setCreateLeadForm] = useState<LeadV2CreateForm>(emptyLeadV2CreateForm)
  const [isCreatingLead, setIsCreatingLead] = useState(false)
  const [createLeadError, setCreateLeadError] = useState<string | null>(null)
  const [isSelectingProperty, setIsSelectingProperty] = useState(false)
  const [propertySearchQuery, setPropertySearchQuery] = useState('')
  const [dismissedRouteLeadId, setDismissedRouteLeadId] = useState<string | null>(null)
  const hasLoadedInitialLeadsRef = useRef(false)
  const hasLoadedInitialStatusesRef = useRef(false)
  const hasRequestedInitialCatalogRef = useRef(false)
  const propertyOptions = useMemo(() => buildPropertyOptions(catalogProperties, availableProperties), [availableProperties, catalogProperties])

  const [selectedLeadFollowings, setSelectedLeadFollowings] = useState<BackendLeadV2FollowingRecord[]>([])

  const [isLoadingSelectedLeadFollowings, setIsLoadingSelectedLeadFollowings,] = useState(false)

  const [ selectedLeadFollowingsError, setSelectedLeadFollowingsError,] = useState<string | null>(null)


  //esto es para seguimientos se cargara al mismo tiempo que el lead que se vaya a escoger OJO: si no se ha eliminado el servicio de carga de seguimientos de la pantalla seguimientos entonces se hara carga doble de seguimientos

  const loadSelectedLeadFollowings = useCallback(async () => {
    if (!authToken || !selectedLead?.id) {
      setSelectedLeadFollowings([])
      setSelectedLeadFollowingsError(null)
      setIsLoadingSelectedLeadFollowings(false)
      return
    }

    setIsLoadingSelectedLeadFollowings(true)
    setSelectedLeadFollowingsError(null)

    try {
      const records = await getBackendLeadV2Followings(
        selectedLead.id,
        authToken,
      )

      console.log(
        '[SelectedLeadFollowings]',
        JSON.stringify(records, null, 2),
      )

      setSelectedLeadFollowings(records)
    } catch (error) {
      console.warn(
        'No se pudieron cargar los seguimientos del lead:',
        error,
      )

      setSelectedLeadFollowings([])
      setSelectedLeadFollowingsError(
        'No se pudieron cargar los seguimientos',
      )
    } finally {
      setIsLoadingSelectedLeadFollowings(false)
    }
  }, [authToken, selectedLead?.id])

  useEffect(() => {
    loadSelectedLeadFollowings()
  }, [loadSelectedLeadFollowings])

  const mapLeadRecord = useCallback((lead: Parameters<typeof mapPropertyLeadToLeadV2ViewModel>[0]) => {
    const screenMode = isAdviserRoute ? 'advisor' : 'coordinator'
    const property = lead.propertyId
      ? getPropertyById(lead.propertyId) ?? propertyOptions.find((item) => item.id === lead.propertyId)
      : null
    const propertyName = property?.title || property?.address || property?.city
    return mapPropertyLeadToLeadV2ViewModel(lead, screenMode, propertyName)
  }, [getPropertyById, isAdviserRoute, propertyOptions])

  const replaceLeadRecord = useCallback((lead: Parameters<typeof mapLeadRecord>[0]) => {
    const nextLead = mapLeadRecord(lead)
    setLeads((currentLeads) => currentLeads.map((currentLead) => (
      currentLead.id === nextLead.id ? nextLead : currentLead
    )))
    setSelectedLead((currentLead) => currentLead?.id === nextLead.id ? nextLead : currentLead)
    return nextLead
  }, [mapLeadRecord])

  const loadCustomLeadStatuses = useCallback(async () => {
    if (!authToken || !isAdviserRoute) {
      setCustomLeadStatuses([])
      setIsLoadingCustomLeadStatuses(false)
      return
    }

    setIsLoadingCustomLeadStatuses(true)
    try {
      const statuses = await getBackendLeadV2Statuses(authToken)
      setCustomLeadStatuses(statuses)
    } catch (error) {
      console.warn('No se pudieron cargar los estados personalizados de leads:', error)
      setCustomLeadStatuses([])
    } finally {
      setIsLoadingCustomLeadStatuses(false)
    }
  }, [authToken, isAdviserRoute])
  const loadLeads = useCallback(async () => {
    if (!authToken) {
      setLeads([])
      setIsLoadingLeads(false)
      return
    }

    setIsLoadingLeads(true)
    setErrorMessage(null)
    try {
      const records = await getBackendLeadV2Records(authToken)
      setLeads(records.map(mapLeadRecord))
    } catch (error) {
      console.warn('No se pudieron cargar los leads v2:', error)
      setErrorMessage('No se pudieron cargar los leads')
      setLeads([])
    } finally {
      setIsLoadingLeads(false)
    }
  }, [authToken, mapLeadRecord])

  useEffect(() => {
    if (!authToken || hasLoadedInitialLeadsRef.current) return

    hasLoadedInitialLeadsRef.current = true
    console.info('[LeadsV2][initial-load]', { service: 'leads' })
    loadLeads()
  }, [authToken, loadLeads])

  useEffect(() => {
    if (!authToken || !isAdviserRoute || hasLoadedInitialStatusesRef.current) return

    hasLoadedInitialStatusesRef.current = true
    console.info('[LeadsV2][initial-load]', { service: 'custom-statuses' })
    loadCustomLeadStatuses()
  }, [authToken, isAdviserRoute, loadCustomLeadStatuses])

  useEffect(() => {
    if (hasLoadedCatalog || isCatalogLoading || hasRequestedInitialCatalogRef.current) return

    hasRequestedInitialCatalogRef.current = true
    console.info('[LeadsV2][initial-load]', { service: 'catalog-properties' })
    loadCatalogProperties()
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  useEffect(() => {
    if (!selectedLeadIdParam) {
      setDismissedRouteLeadId(null)
      return
    }
    if (selectedLeadIdParam === dismissedRouteLeadId) return
    if (!selectedLeadIdParam || selectedLead?.id === selectedLeadIdParam) return

    const leadFromRoute = leads.find((lead) => lead.id === selectedLeadIdParam)
    if (leadFromRoute) {
      setSelectedLead(leadFromRoute)
    }
  }, [dismissedRouteLeadId, leads, selectedLead?.id, selectedLeadIdParam])

  const agentGroups = useMemo(() => buildAgentLeadGroups(leads), [leads])
  const selectedAgentGroup = useMemo(
    () => agentGroups.find((group) => group.name === selectedAgentName) ?? null,
    [agentGroups, selectedAgentName],
  )
  const selectedAgentLeads = isAdviserRoute ? leads : selectedAgentGroup?.leads ?? []

  const filteredLeads = useMemo(() => {
    const query = normalizeSearch(searchQuery)

    return selectedAgentLeads.filter((lead) => {
      const matchesChannel = selectedChannel === 'Todos' || lead.channel === selectedChannel
      const matchesQuery = !query || [
        lead.name,
        lead.propertyName,
        lead.channel,
        lead.source,
        lead.status,
        lead.phone,
        lead.email,
        lead.lastContactLabel,
        lead.nextActionLabel,
      ].filter(Boolean).some((value) => normalizeSearch(String(value)).includes(query))

      return matchesChannel && matchesQuery
    })
  }, [searchQuery, selectedAgentLeads, selectedChannel])

  const filteredAgentGroups = useMemo(() => {
    const query = normalizeSearch(searchQuery)
    if (!query) return agentGroups

    return agentGroups.filter((group) =>
      [
        group.name,
        String(group.leads.length),
        String(group.active),
        String(group.followings),
      ].some((value) => normalizeSearch(value).includes(query)),
    )
  }, [agentGroups, searchQuery])

  const metricSource = isAdviserRoute || selectedAgentGroup ? selectedAgentLeads : leads
  const metrics = useMemo(() => buildLeadV2Metrics(metricSource), [metricSource])
  const alerts = useMemo(() => buildLeadV2Alerts(metricSource), [metricSource])
  const totalLeadPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE))
  const currentLeadPage = Math.min(leadPage, totalLeadPages)
  const leadPageStart = (currentLeadPage - 1) * LEADS_PAGE_SIZE
  const paginatedLeads = filteredLeads.slice(leadPageStart, leadPageStart + LEADS_PAGE_SIZE)
  const selectedProperty = useMemo(
    () => propertyOptions.find((property) => property.id === createLeadForm.propertyOfInterestId) ?? null,
    [createLeadForm.propertyOfInterestId, propertyOptions],
  )
  const filteredPropertyOptions = useMemo(() => {
    const query = normalizeSearch(propertySearchQuery)
    if (!query) return propertyOptions

    return propertyOptions.filter((property) =>
      [
        property.title,
        property.address,
        property.city,
        formatPropertyPrice(property),
      ].some((value) => normalizeSearch(String(value ?? '')).includes(query)),
    )
  }, [propertyOptions, propertySearchQuery])

  const selectAgentGroup = (group: AgentLeadGroup) => {
    setSelectedAgentName(group.name)
    setSearchQuery('')
    setSelectedChannel('Todos')
    setLeadPage(1)
  }

  const clearSelectedAgentGroup = () => {
    setSelectedAgentName(null)
    setSearchQuery('')
    setSelectedChannel('Todos')
    setLeadPage(1)
  }

  const updateCreateLeadField = (field: keyof LeadV2CreateForm, value: string) => {
    setCreateLeadForm((current) => ({ ...current, [field]: value }))
    setCreateLeadError(null)
  }

  const openCreateLeadModal = () => {
    setCreateLeadError(null)
    setIsCreateLeadModalOpen(true)
  }

  const closeCreateLeadModal = () => {
    if (isCreatingLead) return
    setIsCreateLeadModalOpen(false)
    setCreateLeadForm(emptyLeadV2CreateForm)
    setCreateLeadError(null)
    setIsSelectingProperty(false)
    setPropertySearchQuery('')
  }

  const selectPropertyForLead = (property: LeadPropertyOption) => {
    updateCreateLeadField('propertyOfInterestId', property.id)
    setIsSelectingProperty(false)
    setPropertySearchQuery('')
  }

  const createCustomLeadStatus = useCallback(async (status: string) => {
    if (!authToken) return []

    const statuses = await createBackendLeadV2Status(status, authToken)
    setCustomLeadStatuses(statuses)
    return statuses
  }, [authToken])

  const deleteCustomLeadStatus = useCallback(async (status: string) => {
    if (!authToken) return []

    const statuses = await deleteBackendLeadV2Status(status, authToken)
    setCustomLeadStatuses(statuses)
    return statuses
  }, [authToken])

  const applyCustomLeadStatus = useCallback(async (leadId: string, status: string) => {
    if (!authToken) return null

    const result = await setBackendLeadV2Status(leadId, { status }, authToken)
    setCustomLeadStatuses(result.statuses)
    return replaceLeadRecord(result.lead)
  }, [authToken, replaceLeadRecord])


  const applyLeadNextAction = useCallback(async (leadId: string, nextAction: string, nextActionAt: string) => {
    if (!authToken) return null

    const updatedLead = await setBackendLeadV2NextAction(leadId, { nextAction, nextActionAt }, authToken)
    return replaceLeadRecord(updatedLead)
  }, [authToken, replaceLeadRecord])
  const submitCreateLead = async () => {
    if (!authToken) {
      setCreateLeadError('No hay sesion activa para crear el lead.')
      return
    }

    setIsCreatingLead(true)
    setCreateLeadError(null)
    try {
      await createBackendLeadV2Record({
        fullName: createLeadForm.fullName,
        phone: createLeadForm.phone,
        email: createLeadForm.email,
        propertyOfInterestId: createLeadForm.propertyOfInterestId,
        origin: createLeadForm.origin || 'app',
        operation: createLeadForm.operation,
      }, authToken)
      setIsCreateLeadModalOpen(false)
      setCreateLeadForm(emptyLeadV2CreateForm)
      await loadLeads()
    } catch (error) {
      console.warn('No se pudo crear el lead v2:', error)
      setCreateLeadError('No se pudo crear el lead. Revisa la conexion e intenta de nuevo.')
    } finally {
      setIsCreatingLead(false)
    }
  }

  return {
    alerts,
    applyCustomLeadStatus,
    applyLeadNextAction,
    clearSelectedAgentGroup,
    closeCreateLeadModal,
    createLeadError,
    createCustomLeadStatus,
    createLeadForm,
    currentLeadPage,
    customLeadStatuses,
    deleteCustomLeadStatus,
    errorMessage,
    filteredAgentGroups,
    filteredPropertyOptions,
    getPropertyById,
    isAssistantOpen,
    isCatalogLoading,
    isCreateLeadModalOpen,
    isCreatingLead,
    isLoadingCustomLeadStatuses,
    isLoadingLeads,
    isSelectingProperty,
    loadCustomLeadStatuses,
    loadLeads,
    metrics,
    openCreateLeadModal,
    paginatedLeads,
    propertyOptions,
    propertySearchQuery,
    searchQuery,
    selectAgentGroup,
    selectPropertyForLead,
    selectedAgentGroup,
    selectedChannel,
    selectedLead,
    selectedProperty,
    setIsAssistantOpen,
    setIsSelectingProperty,
    setLeadPage,
    setPropertySearchQuery,
    setSearchQuery,
    setSelectedChannel,
    setSelectedLead,
    setDismissedRouteLeadId,
    submitCreateLead,
    totalLeadPages,
    updateCreateLeadField,
    selectedLeadFollowings,
    selectedLeadFollowingsError,
    isLoadingSelectedLeadFollowings,
    loadSelectedLeadFollowings
  }
}

export { coordinatorLeadV2Channels }
