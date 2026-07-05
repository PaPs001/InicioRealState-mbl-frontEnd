import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  Mic,
  Plus,
  Radio,
  Search,
  UserRound,
} from 'lucide-react-native'
import {
  coordinatorRentAssistantActions,
  coordinatorRentFollowupChannels,
  type CoordinatorRentFollowupAlert,
  type CoordinatorRentFollowupChannel,
} from '@/lib/mock/coordinator-rent-followups'
import { getBackendLeadRecords } from '@/lib/api'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import type { LeadFollowUp, PropertyLead } from '@/lib/types'
import { LeadDetailView, LeadFollowUpHistoryView } from './leads'
import { styles } from './rent-followups.styles'

const LEADS_PAGE_SIZE = 20

type RentFollowupMetric = {
  id: string
  label: string
  value: number
  color: string
}

type AgentLeadGroup = {
  id: string
  name: string
  leads: PropertyLead[]
  active: number
  followUps: number
  overdue: number
}

export default function CoordinatorRentFollowupsScreen() {
  const { authToken, currentUser } = useSessionDomain()
  const { getPropertyById } = usePropertyDomain()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<CoordinatorRentFollowupChannel>('Todos')
  const [isAssistantOpen, setIsAssistantOpen] = useState(true)
  const [selectedLead, setSelectedLead] = useState<PropertyLead | null>(null)
  const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false)
  const [leads, setLeads] = useState<PropertyLead[]>([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null)
  const [leadPage, setLeadPage] = useState(1)

  const loadLeads = useCallback(async () => {
    if (!authToken) {
      setLeads([])
      setIsLoadingLeads(false)
      return
    }

    setIsLoadingLeads(true)
    try {
      const records = await getBackendLeadRecords(authToken, { includeFollowUps: true })
      setLeads(records)
    } catch (error) {
      console.warn('No se pudieron cargar los leads reales de seguimientos de renta:', error)
      setLeads([])
    } finally {
      setIsLoadingLeads(false)
    }
  }, [authToken])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const displayedLeads = leads
  const advisorLabel = currentUser?.name?.trim() || currentUser?.email?.split('@')[0] || 'asesor'
  const agentGroups = useMemo(() => buildAgentLeadGroups(displayedLeads), [displayedLeads])
  const selectedAgentGroup = useMemo(
    () => agentGroups.find((group) => group.name === selectedAgentName) ?? null,
    [agentGroups, selectedAgentName],
  )
  const selectedAgentLeads = selectedAgentGroup?.leads ?? []

  const filteredLeads = useMemo(() => {
    const query = normalizeSearch(searchQuery)

    return selectedAgentLeads.filter((lead) => {
      const propertyName = getLeadPropertyName(lead, getPropertyById)
      const channel = getLeadChannel(lead)
      const source = getLeadSource(lead)
      const matchesChannel = selectedChannel === 'Todos' || channel === selectedChannel
      const matchesQuery = !query || [
        lead.name,
        propertyName,
        channel,
        source,
        lead.status,
        lead.phone,
        lead.email,
        lead.notes,
        getLastContactLabel(lead),
        getNextActionLabel(lead),
      ].filter(Boolean).some((value) => normalizeSearch(String(value)).includes(query))

      return matchesChannel && matchesQuery
    })
  }, [getPropertyById, searchQuery, selectedAgentLeads, selectedChannel])

  useEffect(() => {
    setLeadPage(1)
  }, [searchQuery, selectedAgentName, selectedChannel])

  const filteredAgentGroups = useMemo(() => {
    const query = normalizeSearch(searchQuery)
    if (!query) return agentGroups

    return agentGroups.filter((group) =>
      [
        group.name,
        String(group.leads.length),
        String(group.active),
        String(group.followUps),
      ].some((value) => normalizeSearch(value).includes(query)),
    )
  }, [agentGroups, searchQuery])

  const metricSource = selectedAgentGroup ? selectedAgentLeads : displayedLeads
  const metrics = useMemo(() => buildRentFollowupMetrics(metricSource), [metricSource])
  const alerts = useMemo(() => buildRentFollowupAlerts(metricSource), [metricSource])
  const totalLeadPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE))
  const currentLeadPage = Math.min(leadPage, totalLeadPages)
  const leadPageStart = (currentLeadPage - 1) * LEADS_PAGE_SIZE
  const paginatedLeads = filteredLeads.slice(leadPageStart, leadPageStart + LEADS_PAGE_SIZE)
  const leadPageFrom = filteredLeads.length > 0 ? leadPageStart + 1 : 0
  const leadPageTo = Math.min(leadPageStart + LEADS_PAGE_SIZE, filteredLeads.length)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {selectedLead ? (
          <View style={styles.detailContainer}>
            {isFollowUpHistoryOpen ? (
              <LeadFollowUpHistoryView
                followUps={selectedLead.followUps ?? []}
                lead={selectedLead}
                onBack={() => setIsFollowUpHistoryOpen(false)}
              />
            ) : (
              <LeadDetailView
                followUps={selectedLead.followUps ?? []}
                getPropertyName={() => getLeadPropertyName(selectedLead, getPropertyById)}
                lead={selectedLead}
                onBack={() => {
                  setSelectedLead(null)
                  setIsFollowUpHistoryOpen(false)
                }}
                onFollowUpPress={() => undefined}
                onViewAllFollowUps={() => setIsFollowUpHistoryOpen(true)}
              />
            )}
          </View>
        ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>INICIO</Text>
            <Text style={styles.brandSubtitle}>REAL ESTATE</Text>
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Seguimientos Rentas</Text>
              <Text style={styles.subtitle}>
                {isLoadingLeads
                  ? 'Cargando leads reales...'
                  : selectedAgentGroup
                    ? `Leads de ${selectedAgentGroup.name}`
                    : `Selecciona un asesor - ${advisorLabel}`}
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            {metrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <View style={[styles.metricDot, { backgroundColor: metric.color }]} />
                <View>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
                    {metric.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.searchRow}>
            <Search size={16} color="#b2b0b0" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={selectedAgentGroup ? 'Buscar por lead, propiedad o canal' : 'Buscar asesor'}
              placeholderTextColor="#b2b0b0"
            />
          </View>

          {selectedAgentGroup ? (
            <View style={styles.filterRow}>
              {coordinatorRentFollowupChannels.map((channel) => {
                const isActive = selectedChannel === channel
                return (
                  <TouchableOpacity
                    key={channel}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedChannel(channel)}
                  >
                    <Text
                      style={[styles.filterText, isActive && styles.filterTextActive]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.72}
                    >
                      {channel}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Alertas</Text>
          <View style={styles.alertList}>
            {alerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>{selectedAgentGroup ? 'Leads Prioritarios' : 'Asesores'}</Text>
          {!selectedAgentGroup ? (
            filteredAgentGroups.length > 0 ? (
              <View style={styles.leadList}>
                {filteredAgentGroups.map((group) => (
                  <AgentGroupCard
                    group={group}
                    key={group.id}
                    onPress={() => {
                      setSelectedAgentName(group.name)
                      setSearchQuery('')
                      setSelectedChannel('Todos')
                    }}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Search size={24} color="#c8c1b8" />
                <Text style={styles.emptyStateText}>Sin asesores para este filtro</Text>
              </View>
            )
          ) : filteredLeads.length > 0 ? (
            <>
              <View style={styles.paginationHeader}>
                <Text style={styles.paginationText}>
                  Mostrando {leadPageFrom}-{leadPageTo} de {filteredLeads.length}
                </Text>
                <Text style={styles.paginationText}>
                  Pagina {currentLeadPage} de {totalLeadPages}
                </Text>
              </View>
              <View style={styles.leadList}>
                {paginatedLeads.map((lead) => (
                  <PriorityLeadCard
                    getPropertyName={() => getLeadPropertyName(lead, getPropertyById)}
                    key={lead.id}
                    lead={lead}
                    onPress={() => {
                      setSelectedLead(lead)
                      setIsFollowUpHistoryOpen(false)
                    }}
                  />
                ))}
              </View>
              <View style={styles.paginationActions}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentLeadPage <= 1 && styles.paginationButtonDisabled]}
                  activeOpacity={0.85}
                  disabled={currentLeadPage <= 1}
                  onPress={() => setLeadPage((current) => Math.max(1, current - 1))}
                >
                  <Text style={[styles.paginationButtonText, currentLeadPage <= 1 && styles.paginationButtonTextDisabled]}>
                    Anterior
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paginationButton, currentLeadPage >= totalLeadPages && styles.paginationButtonDisabled]}
                  activeOpacity={0.85}
                  disabled={currentLeadPage >= totalLeadPages}
                  onPress={() => setLeadPage((current) => Math.min(totalLeadPages, current + 1))}
                >
                  <Text style={[styles.paginationButtonText, currentLeadPage >= totalLeadPages && styles.paginationButtonTextDisabled]}>
                    Siguiente
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Search size={24} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>Sin leads para este asesor o filtro</Text>
            </View>
          )}
        </ScrollView>
        )}

        {!selectedLead ? <View style={styles.assistantDock}>
          {isAssistantOpen ? (
            <View style={styles.assistantMenu}>
              {coordinatorRentAssistantActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.assistantAction,
                    index === coordinatorRentAssistantActions.length - 1 && styles.assistantActionLast,
                  ]}
                  activeOpacity={0.85}
                >
                  {getAssistantIcon(action.icon)}
                  <Text style={styles.assistantActionText} numberOfLines={1}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.assistantButton}
            activeOpacity={0.85}
            onPress={() => setIsAssistantOpen((current) => !current)}
          >
            <Text style={styles.assistantButtonText}>Asistente IA</Text>
            {isAssistantOpen ? <ChevronDown size={16} color="#ffffff" /> : <ChevronUp size={16} color="#ffffff" />}
          </TouchableOpacity>
        </View> : null}
      </View>
    </SafeAreaView>
  )
}

function AlertRow({ alert }: { alert: CoordinatorRentFollowupAlert }) {
  return (
    <TouchableOpacity style={styles.alertRow} activeOpacity={0.85}>
      {getAlertIcon(alert.icon)}
      <Text style={styles.alertText} numberOfLines={1}>{alert.message}</Text>
      <ChevronRight size={17} color="#000000" />
    </TouchableOpacity>
  )
}

function AgentGroupCard({ group, onPress }: { group: AgentLeadGroup; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadTopRow}>
        <Image source={{ uri: getAgentAvatarUrl(group.name) }} style={styles.leadAvatar} />
        <View style={styles.leadMain}>
          <Text style={styles.leadName} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.leadProperty} numberOfLines={1}>{group.leads.length} leads asignados</Text>
          <View style={styles.sourceRow}>
            <UserRound size={13} color="#0b57d0" />
            <Text style={styles.sourceText} numberOfLines={1}>{group.active} activos</Text>
            <Text style={styles.sourceText} numberOfLines={1}>{group.followUps} seguimientos</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText} numberOfLines={1}>{group.overdue} vencidos</Text>
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.footerCell}>
          <Text style={styles.footerLabel}>Total leads</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{group.leads.length}</Text>
        </View>
        <View style={[styles.footerCell, styles.footerCellMiddle]}>
          <Text style={styles.footerLabel}>En seguimiento</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{group.followUps}</Text>
        </View>
        <TouchableOpacity style={styles.followButton} activeOpacity={0.85} onPress={onPress}>
          <Text style={styles.followButtonText} numberOfLines={1}>Ver leads</Text>
          <ChevronRight size={12} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

function PriorityLeadCard({
  getPropertyName,
  lead,
  onPress,
}: {
  getPropertyName: () => string
  lead: PropertyLead
  onPress: () => void
}) {
  const channel = getLeadChannel(lead)
  const source = getLeadSource(lead)
  const propertyName = getPropertyName()

  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadTopRow}>
        <Image source={{ uri: getLeadAvatarUrl(lead) }} style={styles.leadAvatar} />
        <View style={styles.leadMain}>
          <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
          <Text style={styles.leadProperty} numberOfLines={1}>{propertyName}</Text>
          <View style={styles.sourceRow}>
            <Radio size={13} color="#0b57d0" />
            <Text style={styles.sourceText} numberOfLines={1}>{channel}</Text>
            <Text style={styles.sourceText} numberOfLines={1}>{source}</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText} numberOfLines={1}>{formatLeadStatus(lead.status)}</Text>
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.footerCell}>
          <Text style={styles.footerValue} numberOfLines={2}>{getLastContactLabel(lead)}</Text>
        </View>
        <View style={[styles.footerCell, styles.footerCellMiddle]}>
          <Text style={styles.footerLabel}>Proxima Accion</Text>
          <Text style={styles.footerValue} numberOfLines={2}>{getNextActionLabel(lead)}</Text>
        </View>
        <TouchableOpacity style={styles.followButton} activeOpacity={0.85} onPress={onPress}>
          <Text style={styles.followButtonText} numberOfLines={1}>Ver seguimiento</Text>
          <ChevronRight size={12} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

function getAlertIcon(icon: CoordinatorRentFollowupAlert['icon']) {
  if (icon === 'user') return <UserRound size={15} color="#ba544a" />
  if (icon === 'clock') return <Clock3 size={15} color="#ba544a" />
  return <AlertTriangle size={15} color="#ba544a" />
}

function getAssistantIcon(icon: 'mic' | 'wave' | 'plus') {
  if (icon === 'wave') return <Radio size={13} color="#8d8783" />
  if (icon === 'plus') return <Plus size={13} color="#8d8783" />
  return <Mic size={13} color="#8d8783" />
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

function buildAgentLeadGroups(leads: PropertyLead[]): AgentLeadGroup[] {
  const groups = leads.reduce<Map<string, PropertyLead[]>>((currentGroups, lead) => {
    const agentName = getLeadAgentName(lead)
    currentGroups.set(agentName, [...(currentGroups.get(agentName) ?? []), lead])
    return currentGroups
  }, new Map<string, PropertyLead[]>())

  return Array.from(groups.entries())
    .map(([name, agentLeads]) => {
      const active = agentLeads.filter((lead) => !['cerrado', 'descartado'].includes(lead.status))
      const followUps = agentLeads.reduce((total, lead) => total + (lead.followUps ?? []).length, 0)
      const overdue = agentLeads.filter((lead) => (lead.followUps ?? []).some(isOverdueFollowUp)).length

      return {
        id: normalizeSearch(name).replace(/\s+/g, '-'),
        name,
        leads: agentLeads,
        active: active.length,
        followUps,
        overdue,
      }
    })
    .sort((current, next) =>
      next.leads.length - current.leads.length ||
      current.name.localeCompare(next.name),
    )
}

function getLeadAgentName(lead: PropertyLead) {
  return lead.assignedAgentName || lead.advisorId || lead.agentId || 'Sin asesor'
}

function getAgentAvatarUrl(name: string) {
  const seed = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?name=${seed}&background=edf1e0&color=264721&size=128`
}

function buildRentFollowupMetrics(leads: PropertyLead[]): RentFollowupMetric[] {
  const activeLeads = leads.filter((lead) => !['cerrado', 'descartado'].includes(lead.status))
  const followedLeads = activeLeads.filter((lead) => (lead.followUps ?? []).length > 0)
  const lateLeads = activeLeads.filter((lead) => (lead.followUps ?? []).some(isOverdueFollowUp))
  const upcomingAppointments = activeLeads.filter((lead) =>
    (lead.followUps ?? []).some((followUp) => followUp.result === 'appointmentScheduled' || hasUpcomingFollowUpDate(followUp)),
  )

  return [
    { id: 'active-leads', label: 'Leads Activos', value: activeLeads.length, color: '#0d4f3f' },
    { id: 'followed-leads', label: 'En seguimiento', value: followedLeads.length, color: '#d09c3d' },
    { id: 'late-leads', label: 'Atrasados', value: lateLeads.length, color: '#c8655f' },
    { id: 'appointments', label: 'Citas proximas', value: upcomingAppointments.length, color: '#0a3f34' },
  ]
}

function buildRentFollowupAlerts(leads: PropertyLead[]): CoordinatorRentFollowupAlert[] {
  const activeLeads = leads.filter((lead) => !['cerrado', 'descartado'].includes(lead.status))
  const noMovement = activeLeads.filter((lead) => getDaysSinceLastContact(lead) >= 3)
  const withoutAdvisor = activeLeads.filter((lead) => !lead.advisorId && !lead.agentId && !lead.assignedAgentName)
  const overdueNext = activeLeads.filter((lead) => (lead.followUps ?? []).some(isOverdueFollowUp))
  const alerts = [
    noMovement.length ? { id: 'no-movement', icon: 'warning', message: `${noMovement.length} leads sin movimiento en 3 dias` } : null,
    withoutAdvisor.length ? { id: 'pending-agent', icon: 'user', message: `${withoutAdvisor.length} leads sin asesor confirmado` } : null,
    overdueNext.length ? { id: 'overdue-next', icon: 'clock', message: `${overdueNext.length} proximas acciones vencidas` } : null,
  ].filter(Boolean) as CoordinatorRentFollowupAlert[]

  return alerts.length > 0 ? alerts : [
    { id: 'no-alerts', icon: 'clock', message: 'Sin alertas pendientes por ahora' },
  ]
}

function getLeadPropertyName(lead: PropertyLead, getPropertyById: (id: string) => { title?: string; address?: string; city?: string } | undefined) {
  const property = lead.propertyId ? getPropertyById(lead.propertyId) : undefined
  return property?.title || property?.address || property?.city || lead.propertyId || 'Sin propiedad asignada'
}

function getLeadChannel(lead: PropertyLead): CoordinatorRentFollowupChannel {
  const source = `${lead.source ?? ''} ${lead.contactType ?? ''}`.toLowerCase()
  if (source.includes('manychat')) return 'Manychat'
  if (source.includes('google')) return 'Google Ads'
  if (source.includes('meta') || source.includes('facebook') || source.includes('instagram')) return 'Meta'
  if (source.includes('whatsapp') || source.includes('wa')) return 'Whatsapp'
  return 'Whatsapp'
}

function getLeadSource(lead: PropertyLead) {
  return lead.source || lead.contactType || lead.searchIntent || 'Origen no definido'
}

function getLeadAvatarUrl(lead: PropertyLead) {
  const seed = encodeURIComponent(lead.name || lead.id)
  return `https://ui-avatars.com/api/?name=${seed}&background=edf1e0&color=264721&size=128`
}

function getLastContactLabel(lead: PropertyLead) {
  const latest = getLatestFollowUp(lead)
  const date = latest?.date || lead.firstContactDate || lead.createdDate
  if (!date) return 'Sin contacto registrado'

  const days = getDaysSince(date)
  if (days === null) return 'Ultimo contacto sin fecha'
  if (days === 0) return 'Ultimo contacto hoy'
  if (days === 1) return 'Ultimo contacto ayer'
  return `Ultimo contacto hace ${days} dias`
}

function getNextActionLabel(lead: PropertyLead) {
  const nextFollowUp = (lead.followUps ?? [])
    .filter((followUp) => Boolean(followUp.nextAction || followUp.nextActionDate))
    .sort((current, next) => getDateTime(current.nextActionDate || current.date) - getDateTime(next.nextActionDate || next.date))[0]

  return nextFollowUp?.nextAction || lead.notes || 'Definir siguiente accion'
}

function getLatestFollowUp(lead: PropertyLead) {
  return [...(lead.followUps ?? [])].sort((current, next) => getDateTime(next.date) - getDateTime(current.date))[0]
}

function hasUpcomingFollowUpDate(followUp: LeadFollowUp) {
  const dateTime = getDateTime(followUp.nextActionDate || followUp.date)
  return dateTime > 0 && dateTime >= Date.now()
}

function isOverdueFollowUp(followUp: LeadFollowUp) {
  const dateTime = getDateTime(followUp.nextActionDate)
  return dateTime > 0 && dateTime < Date.now()
}

function getDaysSinceLastContact(lead: PropertyLead) {
  const latest = getLatestFollowUp(lead)
  return getDaysSince(latest?.date || lead.firstContactDate || lead.createdDate) ?? 0
}

function getDaysSince(value?: string) {
  const dateTime = getDateTime(value)
  if (dateTime <= 0) return null
  return Math.max(0, Math.floor((Date.now() - dateTime) / 86400000))
}

function getDateTime(value?: string) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatLeadStatus(status: PropertyLead['status']) {
  const labels: Record<PropertyLead['status'], string> = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    cita_agendada: 'Cita agendada',
    visitado: 'Visitado',
    negociando: 'En seguimiento',
    cerrado: 'Cerrado',
    descartado: 'Descartado',
  }

  return labels[status] ?? status
}
