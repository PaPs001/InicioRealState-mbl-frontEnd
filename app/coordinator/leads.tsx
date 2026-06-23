import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, CalendarDays, ChevronRight, Clock3, MessageSquareText, Search, UserRound, Users } from 'lucide-react-native'
import { getBackendLeadFollowUps, getBackendLeadRecords, getLeadAgents } from '@/lib/api'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import type { LeadFollowUp, PropertyLead, User } from '@/lib/types'
import { styles } from './leads.styles'

type AdvisorLeadGroup = {
  id: string
  name: string
  email?: string
  phone?: string
  total: number
  active: number
  rent: number
  sale: number
  leads: PropertyLead[]
  isFallback?: boolean
}

export default function CoordinatorLeadsScreen() {
  const { authToken } = useSessionDomain()
  const { getPropertyById } = usePropertyDomain()
  const [leads, setLeads] = useState<PropertyLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<PropertyLead | null>(null)
  const [selectedFollowUp, setSelectedFollowUp] = useState<LeadFollowUp | null>(null)
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([])
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false)
  const [followUpsError, setFollowUpsError] = useState<string | null>(null)

  const advisors = useMemo(() => getLeadAgents(), [])

  const loadLeads = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setIsLoading(true)
    if (mode === 'refresh') setIsRefreshing(true)
    setErrorMessage(null)

    try {
      const records = await getBackendLeadRecords(authToken, { includeFollowUps: true })
      setLeads(records)
    } catch (error) {
      console.error('Error cargando leads del coordinador:', error)
      setErrorMessage('No se pudieron cargar los leads')
      setLeads([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [authToken])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const advisorGroups = useMemo(() => buildAdvisorGroups(leads, advisors), [advisors, leads])
  const selectedAdvisor = useMemo(
    () => advisorGroups.find((advisor) => advisor.id === selectedAdvisorId) ?? null,
    [advisorGroups, selectedAdvisorId],
  )

  const filteredAdvisorGroups = useMemo(() => {
    const query = normalizeSearch(searchQuery)
    if (!query || selectedAdvisorId) return advisorGroups

    return advisorGroups.filter((advisor) =>
      [
        advisor.name,
        advisor.email,
        advisor.phone,
        advisor.id,
        ...advisor.leads.flatMap((lead) => [
          lead.name,
          lead.phone,
          lead.email,
          lead.source,
          getPropertyById(lead.propertyId)?.title,
        ]),
      ].filter(Boolean).some((value) => normalizeSearch(String(value)).includes(query)),
    )
  }, [advisorGroups, getPropertyById, searchQuery, selectedAdvisorId])

  const filteredAdvisorLeads = useMemo(() => {
    if (!selectedAdvisor) return []
    const query = normalizeSearch(searchQuery)
    if (!query) return selectedAdvisor.leads

    return selectedAdvisor.leads.filter((lead) =>
      [
        lead.name,
        lead.phone,
        lead.email,
        lead.source,
        lead.status,
        getPropertyById(lead.propertyId)?.title,
      ].filter(Boolean).some((value) => normalizeSearch(String(value)).includes(query)),
    )
  }, [getPropertyById, searchQuery, selectedAdvisor])

  const summary = useMemo(() => ({
    advisors: filteredAdvisorGroups.length,
    total: filteredAdvisorGroups.reduce((total, advisor) => total + advisor.total, 0),
    active: filteredAdvisorGroups.reduce((total, advisor) => total + advisor.active, 0),
    rent: filteredAdvisorGroups.reduce((total, advisor) => total + advisor.rent, 0),
  }), [filteredAdvisorGroups])

  const openAdvisor = (advisor: AdvisorLeadGroup) => {
    setSelectedAdvisorId(advisor.id)
    setSelectedLead(null)
    setSelectedFollowUp(null)
    setFollowUps([])
    setFollowUpsError(null)
    setSearchQuery('')
  }

  const goBackToAdvisors = () => {
    setSelectedAdvisorId(null)
    setSelectedLead(null)
    setSelectedFollowUp(null)
    setFollowUps([])
    setFollowUpsError(null)
    setSearchQuery('')
  }

  const goBackToAdvisorLeads = () => {
    setSelectedLead(null)
    setSelectedFollowUp(null)
    setFollowUps([])
    setFollowUpsError(null)
  }

  const openLeadFollowUps = async (lead: PropertyLead) => {
    setSelectedLead(lead)
    setSelectedFollowUp(null)
    setFollowUps(lead.followUps ?? [])
    setFollowUpsError(null)

    if (lead.followUps) {
      setIsLoadingFollowUps(false)
      return
    }

    setIsLoadingFollowUps(true)

    try {
      const records = await getBackendLeadFollowUps(lead.id, authToken)
      setFollowUps(records)
    } catch (error) {
      console.error('Error cargando seguimientos del lead:', error)
      setFollowUpsError('No se pudieron cargar los seguimientos')
    } finally {
      setIsLoadingFollowUps(false)
    }
  }

  const refreshCurrentView = () => loadLeads('refresh')

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {selectedFollowUp && selectedLead ? (
          <FollowUpDetailView
            followUp={selectedFollowUp}
            lead={selectedLead}
            onBack={() => setSelectedFollowUp(null)}
          />
        ) : selectedLead ? (
          <FollowUpsView
            followUps={followUps}
            isLoading={isLoadingFollowUps}
            lead={selectedLead}
            onBack={goBackToAdvisorLeads}
            errorMessage={followUpsError}
            onFollowUpPress={setSelectedFollowUp}
          />
        ) : selectedAdvisor ? (
          <AdvisorLeadsView
            advisor={selectedAdvisor}
            getPropertyName={(propertyId) => getPropertyById(propertyId)?.title}
            isRefreshing={isRefreshing}
            leads={filteredAdvisorLeads}
            onBack={goBackToAdvisors}
            onLeadPress={openLeadFollowUps}
            onRefresh={refreshCurrentView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : (
          <AdvisorsView
            advisors={filteredAdvisorGroups}
            errorMessage={errorMessage}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onAdvisorPress={openAdvisor}
            onRefresh={refreshCurrentView}
            onRetry={() => loadLeads('refresh')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            summary={summary}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

function AdvisorsView({
  advisors,
  errorMessage,
  isLoading,
  isRefreshing,
  onAdvisorPress,
  onRefresh,
  onRetry,
  searchQuery,
  setSearchQuery,
  summary,
}: {
  advisors: AdvisorLeadGroup[]
  errorMessage: string | null
  isLoading: boolean
  isRefreshing: boolean
  onAdvisorPress: (advisor: AdvisorLeadGroup) => void
  onRefresh: () => void
  onRetry: () => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  summary: { advisors: number; total: number; active: number; rent: number }
}) {
  return (
    <>
      <Text style={styles.title}>Asesores</Text>
      <Text style={styles.subtitle}>Selecciona un asesor para revisar sus leads</Text>

      <View style={styles.summaryRow}>
        <SummaryTile label="Asesores" value={summary.advisors} />
        <SummaryTile label="Leads" value={summary.total} />
        <SummaryTile label="Activos" value={summary.active} />
        <SummaryTile label="Renta" value={summary.rent} />
      </View>

      <SearchBox
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar asesor o lead"
      />

      {errorMessage ? (
        <TouchableOpacity style={styles.errorBox} activeOpacity={0.85} onPress={onRetry}>
          <Text style={styles.errorText}>{errorMessage}. Toca para reintentar.</Text>
        </TouchableOpacity>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#0c6740" />
          <Text style={styles.loadingText}>Cargando asesores...</Text>
        </View>
      ) : (
        <FlatList
          data={advisors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AdvisorCard advisor={item} onPress={() => onAdvisorPress(item)} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0c6740" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={42} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>Sin asesores para revisar</Text>
            </View>
          }
        />
      )}
    </>
  )
}

function AdvisorLeadsView({
  advisor,
  getPropertyName,
  isRefreshing,
  leads,
  onBack,
  onLeadPress,
  onRefresh,
  searchQuery,
  setSearchQuery,
}: {
  advisor: AdvisorLeadGroup
  getPropertyName: (propertyId: string) => string | undefined
  isRefreshing: boolean
  leads: PropertyLead[]
  onBack: () => void
  onLeadPress: (lead: PropertyLead) => void
  onRefresh: () => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}) {
  return (
    <>
      <ScreenHeader
        title={advisor.name}
        subtitle={`${advisor.active} activos · ${advisor.total} leads`}
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <SummaryTile label="Leads" value={advisor.total} />
        <SummaryTile label="Activos" value={advisor.active} />
        <SummaryTile label="Renta" value={advisor.rent} />
        <SummaryTile label="Venta" value={advisor.sale} />
      </View>

      <SearchBox
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar lead o propiedad"
      />

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeadRow lead={item} propertyName={getPropertyName(item.propertyId)} onPress={() => onLeadPress(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0c6740" />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <UserRound size={42} color="#c8c1b8" />
            <Text style={styles.emptyStateText}>Sin leads para este asesor</Text>
          </View>
        }
      />
    </>
  )
}

function FollowUpsView({
  errorMessage,
  followUps,
  isLoading,
  lead,
  onBack,
  onFollowUpPress,
}: {
  errorMessage: string | null
  followUps: LeadFollowUp[]
  isLoading: boolean
  lead: PropertyLead
  onBack: () => void
  onFollowUpPress: (followUp: LeadFollowUp) => void
}) {
  return (
    <>
      <ScreenHeader
        title={lead.name}
        subtitle={lead.phone || 'Sin telefono'}
        onBack={onBack}
      />

      <View style={styles.leadDetailCard}>
        <Text style={styles.leadDetailTitle}>Seguimientos</Text>
        <Text style={styles.leadDetailMeta}>
          {lead.searchIntent === 'rent' ? 'Renta' : 'Venta'} · {lead.status}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.followLoadingState}>
          <ActivityIndicator color="#0c6740" />
          <Text style={styles.loadingText}>Cargando seguimientos...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.followErrorText}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={followUps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FollowUpRow followUp={item} onPress={() => onFollowUpPress(item)} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.followListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyFollowState}>
              <MessageSquareText size={38} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>Sin seguimientos para revisar</Text>
            </View>
          }
        />
      )}
    </>
  )
}

function FollowUpDetailView({
  followUp,
  lead,
  onBack,
}: {
  followUp: LeadFollowUp
  lead: PropertyLead
  onBack: () => void
}) {
  return (
    <>
      <ScreenHeader
        title="Detalle del seguimiento"
        subtitle={lead.name}
        onBack={onBack}
      />

      <View style={styles.followDetailCard}>
        <DetailRow label="Lead" value={lead.name} />
        <DetailRow label="Telefono" value={lead.phone || 'Sin telefono'} />
        <DetailRow label="Fecha contacto" value={formatDate(followUp.date)} />
        <DetailRow label="Tipo contacto" value={formatContactType(followUp.type)} />
        <DetailRow label="Resultado" value={followUp.result || 'Sin resultado'} />
        <DetailRow label="Resumen" value={followUp.notes} multiline />
        <DetailRow label="Siguiente accion" value={followUp.nextAction || 'Sin siguiente accion'} multiline />
        <DetailRow label="Proximo contacto" value={followUp.nextActionDate ? formatDate(followUp.nextActionDate) : 'Sin fecha'} />
        <DetailRow label="Numero seguimiento" value={followUp.followNumber || 'Sin numero'} />
        <DetailRow label="ID seguimiento" value={followUp.id} />
        <DetailRow label="ID lead" value={followUp.leadId || lead.id} />
        <DetailRow label="ID cliente" value={followUp.clientId || 'Sin cliente'} />
      </View>
    </>
  )
}

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.screenHeader}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
        <ArrowLeft size={20} color="#19191f" />
      </TouchableOpacity>
      <View style={styles.screenHeaderCopy}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  )
}

function SearchBox({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.searchRow}>
      <Search size={18} color="#717171" />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#969696"
      />
    </View>
  )
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  )
}

function AdvisorCard({ advisor, onPress }: { advisor: AdvisorLeadGroup; onPress: () => void }) {
  const initials = getInitials(advisor.name)

  return (
    <TouchableOpacity style={styles.advisorCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.advisorAvatar}>
        <Text style={styles.advisorAvatarText}>{initials}</Text>
      </View>
      <View style={styles.advisorCardBody}>
        <Text style={styles.advisorName} numberOfLines={1}>{advisor.name}</Text>
        <Text style={styles.advisorMeta} numberOfLines={1}>
          {advisor.active} activos · {advisor.total} total
        </Text>
        <Text style={styles.advisorContact} numberOfLines={1}>
          {advisor.email || advisor.id}
        </Text>
      </View>
      <View style={styles.advisorCountBadge}>
        <Text style={styles.advisorCountText}>{advisor.total}</Text>
      </View>
      <ChevronRight size={18} color="#c2a661" />
    </TouchableOpacity>
  )
}

function LeadRow({ lead, propertyName, onPress }: { lead: PropertyLead; propertyName?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadAvatar}>
        <Text style={styles.leadAvatarText}>{lead.name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.leadBody}>
        <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
        <Text style={styles.leadMeta} numberOfLines={1}>
          {lead.searchIntent === 'rent' ? 'Renta' : 'Venta'} · {lead.status}
        </Text>
        <Text style={styles.leadProperty} numberOfLines={1}>{propertyName || lead.propertyId || 'Sin propiedad asignada'}</Text>
      </View>
      <ChevronRight size={18} color="#c2a661" />
    </TouchableOpacity>
  )
}

function buildAdvisorGroups(leads: PropertyLead[], advisors: User[]): AdvisorLeadGroup[] {
  const advisorGroups = advisors.map((advisor) => createAdvisorGroup(advisor.id, advisor.name, advisor, getLeadsByAdvisorId(leads, advisor.id)))
  const knownAdvisorIds = new Set(advisors.map((advisor) => advisor.id))

  const externalGroups = Array.from(
    leads
      .filter((lead) => {
        const advisorId = getLeadAdvisorId(lead)
        return advisorId && !knownAdvisorIds.has(advisorId)
      })
      .reduce<Map<string, PropertyLead[]>>((groups, lead) => {
        const advisorId = getLeadAdvisorId(lead)
        if (!advisorId) return groups
        groups.set(advisorId, [...(groups.get(advisorId) ?? []), lead])
        return groups
      }, new Map())
      .entries(),
  ).map(([advisorId, advisorLeads]) => {
    const advisorName = advisorLeads.find((lead) => lead.assignedAgentName)?.assignedAgentName || advisorId
    return createAdvisorGroup(advisorId, advisorName, undefined, advisorLeads, true)
  })

  return [...advisorGroups, ...externalGroups]
    .filter((advisor) => advisor.total > 1)
    .sort((current, next) => current.name.localeCompare(next.name, 'es'))
}

function getLeadsByAdvisorId(leads: PropertyLead[], advisorId: string) {
  return leads.filter((lead) => getLeadAdvisorId(lead) === advisorId)
}

function createAdvisorGroup(id: string, name: string, advisor: User | undefined, leads: PropertyLead[], isFallback = false): AdvisorLeadGroup {
  return {
    id,
    name,
    email: advisor?.email,
    phone: advisor?.phone,
    total: leads.length,
    active: leads.filter((lead) => !['cerrado', 'descartado'].includes(lead.status)).length,
    rent: leads.filter((lead) => lead.searchIntent === 'rent').length,
    sale: leads.filter((lead) => lead.searchIntent === 'sale').length,
    leads,
    isFallback,
  }
}

function getLeadAdvisorId(lead: PropertyLead) {
  return lead.advisorId || lead.agentId
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || 'AS'
}

function DetailRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={multiline ? undefined : 2}>
        {value}
      </Text>
    </View>
  )
}

function FollowUpRow({ followUp, onPress }: { followUp: LeadFollowUp; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.followCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.followIcon}>
        <Clock3 size={17} color="#0c6740" />
      </View>
      <View style={styles.followBody}>
        <Text style={styles.followDate}>{formatDate(followUp.date)}</Text>
        <Text style={styles.followNotes}>{followUp.notes}</Text>
        {followUp.nextAction ? (
          <View style={styles.nextActionRow}>
            <CalendarDays size={13} color="#717171" />
            <Text style={styles.nextActionText} numberOfLines={2}>
              {followUp.nextAction}
              {followUp.nextActionDate ? ' · ' + formatDate(followUp.nextActionDate) : ''}
            </Text>
          </View>
        ) : null}
      </View>
      <ChevronRight size={17} color="#c2a661" />
    </TouchableOpacity>
  )
}

function formatContactType(value: LeadFollowUp['type']) {
  if (value === 'call') return 'Llamada'
  if (value === 'whatsapp') return 'WhatsApp'
  if (value === 'email') return 'Email'
  if (value === 'visit') return 'Pagina'
  if (value === 'meeting') return 'App'
  return value
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
