import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  ImageIcon,
  Mail,
  Mic,
  MessageCircle,
  MessageSquareText,
  NotebookPen,
  Phone,
  Repeat2,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react-native'
import { getBackendLeadRecords } from '@/lib/api'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import type { LeadFollowUp, PropertyLead } from '@/lib/types'
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
  const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false)
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([])

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

  const advisorGroups = useMemo(() => buildAdvisorGroups(leads), [leads])
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
    setSearchQuery('')
  }

  const goBackToAdvisors = () => {
    setSelectedAdvisorId(null)
    setSelectedLead(null)
    setSelectedFollowUp(null)
    setFollowUps([])
    setSearchQuery('')
  }

  const goBackToAdvisorLeads = () => {
    setSelectedLead(null)
    setSelectedFollowUp(null)
    setIsFollowUpHistoryOpen(false)
    setFollowUps([])
  }

  const openLeadFollowUps = (lead: PropertyLead) => {
    setSelectedLead(lead)
    setSelectedFollowUp(null)
    setIsFollowUpHistoryOpen(false)
    setFollowUps(lead.followUps ?? [])
  }

  const refreshCurrentView = () => loadLeads('refresh')

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={selectedLead && !selectedFollowUp ? styles.subScreenContainer : styles.container}>
        {selectedFollowUp && selectedLead ? (
          <FollowUpDetailView
            followUp={selectedFollowUp}
            lead={selectedLead}
            onBack={() => setSelectedFollowUp(null)}
          />
        ) : selectedLead && isFollowUpHistoryOpen ? (
          <LeadFollowUpHistoryView
            followUps={followUps}
            lead={selectedLead}
            onBack={() => setIsFollowUpHistoryOpen(false)}
            onFollowUpPress={setSelectedFollowUp}
          />
        ) : selectedLead ? (
          <LeadDetailView
            followUps={followUps}
            getPropertyName={(propertyId) => getPropertyById(propertyId)?.title}
            lead={selectedLead}
            onBack={goBackToAdvisorLeads}
            onFollowUpPress={setSelectedFollowUp}
            onViewAllFollowUps={() => setIsFollowUpHistoryOpen(true)}
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

export function LeadDetailView({
  followUps,
  getPropertyName,
  lead,
  onBack,
  onFollowUpPress,
  onViewAllFollowUps,
}: {
  followUps: LeadFollowUp[]
  getPropertyName: (propertyId: string) => string | undefined
  lead: PropertyLead
  onBack: () => void
  onFollowUpPress: (followUp: LeadFollowUp) => void
  onViewAllFollowUps?: () => void
}) {
  useHideBottomNav()

  const propertyName = getPropertyName(lead.propertyId) || lead.propertyId || 'Sin propiedad asignada'
  const latestFollowUp = getLatestFollowUp(followUps)
  const preferredAction = latestFollowUp?.nextAction || 'Enviar WhatsApp'
  const preferredActionDate = latestFollowUp?.nextActionDate || latestFollowUp?.date

  return (
    <View style={styles.detailScreen}>
      <ScreenHeader
        title="Detalle del lead"
        subtitle={`Seguimiento de ${lead.name}`}
        onBack={onBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leadDetailContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{lead.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName} numberOfLines={1}>{lead.name}</Text>
              <Text style={styles.profileProperty} numberOfLines={1}>{propertyName}</Text>
              <View style={styles.stageBadge}>
                <View style={styles.stageDot} />
                <Text style={styles.stageText}>{formatLeadStatus(lead.status)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sourceRow}>
            <InfoPill label={lead.source || 'Backend'} />
            <InfoPill label={lead.searchIntent === 'rent' ? 'Renta' : 'Venta'} />
          </View>

          <View style={styles.infoGrid}>
            <DetailMetric icon={<Phone size={13} color="#0c6740" />} value={lead.phone || 'Sin telefono'} />
            <DetailMetric icon={<Mail size={13} color="#0c6740" />} value={lead.email || 'Sin correo'} />
            <DetailMetric icon={<CreditCard size={13} color="#0c6740" />} value="Presupuesto sin registrar" />
            <DetailMetric icon={<CalendarDays size={13} color="#0c6740" />} value={formatDate(lead.createdDate)} />
            <DetailMetric icon={<MessageCircle size={13} color="#0c6740" />} value={lead.notes || 'Sin notas iniciales'} wide />
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Proxima accion</Text>
          <TouchableOpacity
            style={styles.nextActionCard}
            activeOpacity={0.85}
            disabled={!latestFollowUp && followUps.length === 0}
            onPress={() => onFollowUpPress(latestFollowUp ?? followUps[0])}
          >
            <View style={styles.nextActionIcon}>
              <CalendarDays size={21} color="#ffffff" />
            </View>
            <View style={styles.nextActionCopy}>
              <Text style={styles.nextActionTitle} numberOfLines={1}>{preferredAction}</Text>
              <Text style={styles.nextActionMeta} numberOfLines={1}>
                {preferredActionDate ? formatDate(preferredActionDate) : 'Sin fecha programada'}
              </Text>
              <Text style={styles.nextActionAdvisor} numberOfLines={1}>
                Asesor: {lead.assignedAgentName || lead.advisorId || 'Sin asesor'}
              </Text>
            </View>
            <ChevronRight size={18} color="#19191f" />
          </TouchableOpacity>

          <View style={styles.quickActionsGrid}>
            <QuickAction icon={<MessageCircle size={19} color="#0c6740" />} label="WhatsApp" onPress={() => openWhatsApp(lead.phone)} />
            <QuickAction icon={<Phone size={19} color="#0c6740" />} label="Llamar" onPress={() => openPhoneCall(lead.phone)} />
            <QuickAction icon={<CalendarPlus size={19} color="#0c6740" />} label="Agendar cita" onPress={() => showPendingAction('Agendar cita')} />
            <QuickAction icon={<Repeat2 size={19} color="#0c6740" />} label="Cambiar etapa" onPress={() => showPendingAction('Cambiar etapa')} />
          </View>
        </View>

        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Sparkles size={15} color="#c78d1c" />
            <Text style={styles.aiTitle}>Acompañamiento de IA</Text>
          </View>
          <View style={styles.emptyFollowState}>
            <Bot size={34} color="#c8c1b8" />
            <Text style={styles.emptyStateText}>Muy pronto </Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.detailSectionTitle}>Historial de seguimiento</Text>
          {followUps.length > 0 ? (
            <View style={styles.timelineList}>
              {followUps.slice(0, 5).map((followUp, index) => (
                <TimelineRow
                  followUp={followUp}
                  isLast={index === Math.min(followUps.length, 5) - 1}
                  key={followUp.id}
                  onPress={() => onFollowUpPress(followUp)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyFollowState}>
              <MessageSquareText size={34} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>Sin seguimientos para revisar </Text>
            </View>
          )}
        </View>

        <View style={styles.detailBottomActions}>
          <TouchableOpacity style={styles.secondaryDetailButton} activeOpacity={0.85} onPress={onViewAllFollowUps ?? (() => showPendingAction('Ver seguimientos'))}>
            <Text style={styles.secondaryDetailButtonText}>Ver seguimientos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiDetailButton} activeOpacity={0.85} onPress={() => showPendingAction('Usar IA')}>
            <Sparkles size={13} color="#c78d1c" />
            <Text style={styles.aiDetailButtonText}>Usar IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryDetailButton} activeOpacity={0.85} onPress={() => showPendingAction('Registrar seguimiento')}>
            <Text style={styles.primaryDetailButtonText}>Registrar seguimiento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export function LeadFollowUpHistoryView({
  followUps,
  lead,
  onBack,
  onFollowUpPress,
}: {
  followUps: LeadFollowUp[]
  lead: PropertyLead
  onBack: () => void
  onFollowUpPress?: (followUp: LeadFollowUp) => void
}) {
  useHideBottomNav()

  const entries = buildHistoryEntries(followUps, lead)

  return (
    <View style={styles.historyScreen}>
      <ScreenHeader
        title="Historial de seguimiento importnate"
        subtitle={`Conversacion y acciones de ${lead.name}`}
        onBack={onBack}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyFilterContent}
        style={styles.historyFilterScroll}
      >
        <HistoryFilterChip active icon={<SlidersHorizontal size={15} color="#ffffff" />} label="Todos" />
        <HistoryFilterChip icon={<MessageCircle size={15} color="#0c6740" />} label="Mensajes" />
        <HistoryFilterChip icon={<Phone size={15} color="#0c6740" />} label="Llamadas" />
        <HistoryFilterChip icon={<Sparkles size={15} color="#c78d1c" />} label="IA" />
        <HistoryFilterChip icon={<FileText size={15} color="#0c6740" />} label="Archivos" />
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.fullHistoryContent}>
        {entries.map((entry, index) => (
          <FullHistoryRow
            entry={entry}
            isLast={index === entries.length - 1}
            key={entry.id}
            onPress={() => entry.followUp && onFollowUpPress?.(entry.followUp)}
          />
        ))}
      </ScrollView>

      <View style={styles.historyActionDock}>
        <View style={styles.historyQuickActions}>
          <HistoryActionButton icon={<NotebookPen size={14} color="#0c6740" />} label="Agregar nota" />
          <HistoryActionButton icon={<Mic size={14} color="#0c6740" />} label="Dictar audio" />
          <HistoryActionButton icon={<ImageIcon size={14} color="#0c6740" />} label="Subir imagen" />
          <HistoryActionButton icon={<Sparkles size={14} color="#ffffff" />} label="Asistente IA" primary />
        </View>
        <TouchableOpacity style={styles.addActivityButton} activeOpacity={0.85} onPress={() => showPendingAction('Agregar actividad')}>
          <Text style={styles.addActivityText}>+ Agregar actividad</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function FollowUpsView({
  followUps,
  lead,
  onBack,
  onFollowUpPress,
}: {
  followUps: LeadFollowUp[]
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

function buildAdvisorGroups(leads: PropertyLead[]): AdvisorLeadGroup[] {
  return Array.from(
    leads.reduce<Map<string, PropertyLead[]>>((groups, lead) => {
      const advisorId = getLeadAdvisorId(lead) || 'sin-asesor'
      groups.set(advisorId, [...(groups.get(advisorId) ?? []), lead])
      return groups
    }, new Map()).entries(),
  )
    .map(([advisorId, advisorLeads]) => createAdvisorGroup(advisorId, getAdvisorName(advisorId, advisorLeads), advisorLeads))
    .filter((advisor) => advisor.total > 0)
    .sort((current, next) => current.name.localeCompare(next.name, 'es'))
}

function createAdvisorGroup(id: string, name: string, leads: PropertyLead[]): AdvisorLeadGroup {
  return {
    id,
    name,
    total: leads.length,
    active: leads.filter((lead) => !['cerrado', 'descartado'].includes(lead.status)).length,
    rent: leads.filter((lead) => lead.searchIntent === 'rent').length,
    sale: leads.filter((lead) => lead.searchIntent === 'sale').length,
    leads,
  }
}

function getLeadAdvisorId(lead: PropertyLead) {
  return lead.advisorId || lead.agentId
}

function getAdvisorName(advisorId: string, leads: PropertyLead[]) {
  return leads.find((lead) => lead.assignedAgentName)?.assignedAgentName || advisorId || 'Sin asesor'
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

function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText} numberOfLines={1}>{label}</Text>
    </View>
  )
}

function DetailMetric({ icon, value, wide = false }: { icon: ReactNode; value: string; wide?: boolean }) {
  return (
    <View style={[styles.detailMetric, wide && styles.detailMetricWide]}>
      {icon}
      <Text style={styles.detailMetricText} numberOfLines={wide ? 2 : 1}>{value}</Text>
    </View>
  )
}

function QuickAction({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.85} onPress={onPress}>
      {icon}
      <Text style={styles.quickActionText} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )
}

function AiSuggestionRow({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <View style={styles.aiSuggestionRow}>
      <View style={styles.aiSuggestionIcon}>{icon}</View>
      <View style={styles.aiSuggestionCopy}>
        <Text style={styles.aiSuggestionTitle}>{title}</Text>
        <Text style={styles.aiSuggestionBody} numberOfLines={2}>{body}</Text>
      </View>
    </View>
  )
}

function TimelineRow({ followUp, isLast, onPress }: { followUp: LeadFollowUp; isLast: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.timelineRow} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot}>
          <MessageSquareText size={12} color="#ffffff" />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineCopy}>
        <View style={styles.timelineTitleRow}>
          <Text style={styles.timelineDate}>{formatRelativeFollowDate(followUp.date)}</Text>
          <Text style={styles.timelineType}>{formatContactType(followUp.type)}</Text>
          <Text style={styles.timelineTime}>{formatTime(followUp.date)}</Text>
        </View>
        <Text style={styles.timelineNotes} numberOfLines={2}>{followUp.notes}</Text>
      </View>
    </TouchableOpacity>
  )
}

type FullHistoryEntry = {
  id: string
  label: string
  time: string
  tag: string
  body: string
  icon: 'message' | 'call' | 'note' | 'ia' | 'file' | 'calendar'
  attachment?: string
  followUp?: LeadFollowUp
}

function HistoryFilterChip({ active = false, icon, label }: { active?: boolean; icon: ReactNode; label: string }) {
  return (
    <TouchableOpacity style={[styles.historyFilterChip, active && styles.historyFilterChipActive]} activeOpacity={0.85}>
      {icon}
      <Text style={[styles.historyFilterText, active && styles.historyFilterTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function FullHistoryRow({ entry, isLast, onPress }: { entry: FullHistoryEntry; isLast: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fullHistoryRow} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.fullHistoryRail}>
        <View style={styles.fullHistorySmallDot} />
        <View style={styles.fullHistoryIcon}>{getFullHistoryIcon(entry.icon)}</View>
        {!isLast ? <View style={styles.fullHistoryLine} /> : null}
      </View>
      <View style={styles.fullHistoryCard}>
        <View style={styles.fullHistoryMetaRow}>
          <View style={styles.fullHistoryTimeGroup}>
            <Text style={styles.fullHistoryDate}>{entry.label}</Text>
            <Text style={styles.fullHistoryTime}>{entry.time}</Text>
          </View>
          <View style={[styles.fullHistoryTag, entry.icon === 'note' && styles.fullHistoryTagWarm]}>
            <Text style={[styles.fullHistoryTagText, entry.icon === 'note' && styles.fullHistoryTagWarmText]}>{entry.tag}</Text>
          </View>
        </View>
        <View style={styles.fullHistoryBodyBox}>
          <Text style={styles.fullHistoryBodyText} numberOfLines={4}>{entry.body}</Text>
          {entry.attachment ? (
            <View style={styles.attachmentRow}>
              <FileText size={14} color="#0c6740" />
              <Text style={styles.attachmentText} numberOfLines={1}>{entry.attachment}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function HistoryActionButton({ icon, label, primary = false }: { icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <TouchableOpacity style={[styles.historyActionButton, primary && styles.historyActionButtonPrimary]} activeOpacity={0.85} onPress={() => showPendingAction(label)}>
      {icon}
      <Text style={[styles.historyActionText, primary && styles.historyActionTextPrimary]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
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

function getLatestFollowUp(followUps: LeadFollowUp[]) {
  return [...followUps].sort((current, next) => getDateTime(next.date) - getDateTime(current.date))[0]
}

function buildHistoryEntries(followUps: LeadFollowUp[], lead: PropertyLead): FullHistoryEntry[] {
  const sortedFollowUps = [...followUps].sort((current, next) => getDateTime(next.date) - getDateTime(current.date))
  const entries = sortedFollowUps.map((followUp, index) => {
    const icon = getHistoryEntryIcon(followUp, index)
    return {
      id: followUp.id,
      label: formatRelativeFollowDate(followUp.date),
      time: formatTime(followUp.date) || 'Sin hora',
      tag: getHistoryEntryTag(followUp, icon),
      body: followUp.notes || followUp.nextAction || 'Seguimiento sin notas',
      icon,
      attachment: icon === 'file' ? `evidencia_${lead.name.replace(/\s+/g, '_')}.jpg` : undefined,
      followUp,
    }
  })

  if (entries.length > 0) return entries

  return [
    {
      id: `${lead.id}-created`,
      label: formatRelativeFollowDate(lead.createdDate),
      time: formatTime(lead.createdDate) || 'Sin hora',
      tag: 'Lead recibido',
      body: `${lead.name} ingreso desde ${lead.source || 'Backend'} para ${lead.searchIntent === 'rent' ? 'renta' : 'venta'}.`,
      icon: 'message',
    },
  ]
}

function getHistoryEntryIcon(followUp: LeadFollowUp, index: number): FullHistoryEntry['icon'] {
  const result = (followUp.result || '').toLowerCase()
  if (followUp.type === 'call') return 'call'
  if (result.includes('appointment') || result.includes('scheduled')) return 'calendar'
  if (result.includes('document') || index === 3) return 'file'
  if (followUp.notes.toLowerCase().includes('ia') || index % 4 === 2) return 'ia'
  if (followUp.type === 'meeting' || followUp.type === 'visit') return 'note'
  return 'message'
}

function getHistoryEntryTag(followUp: LeadFollowUp, icon: FullHistoryEntry['icon']) {
  if (icon === 'call') return 'Llamada'
  if (icon === 'calendar') return 'Cita agendada'
  if (icon === 'file') return 'Archivo'
  if (icon === 'ia') return 'IA - Dictado por IA'
  if (icon === 'note') return 'Manual'
  return followUp.type === 'whatsapp' ? 'WhatsApp' : formatContactType(followUp.type)
}

function getFullHistoryIcon(icon: FullHistoryEntry['icon']) {
  if (icon === 'call') return <Phone size={15} color="#ffffff" />
  if (icon === 'calendar') return <CalendarDays size={15} color="#ffffff" />
  if (icon === 'file') return <FileText size={15} color="#ffffff" />
  if (icon === 'ia') return <Sparkles size={15} color="#ffffff" />
  if (icon === 'note') return <NotebookPen size={15} color="#ffffff" />
  return <MessageCircle size={15} color="#ffffff" />
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

function formatRelativeFollowDate(value?: string) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startValue = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((startToday - startValue) / 86400000)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays > 1 && diffDays < 7) return `Hace ${diffDays} dias`
  return formatDate(value)
}

function formatTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) {
    Alert.alert('Sin telefono', 'Este lead no tiene telefono registrado.')
    return
  }
  Linking.openURL(`https://wa.me/${digits}`).catch(() => {
    Alert.alert('No se pudo abrir WhatsApp', 'Revisa que WhatsApp este disponible en el dispositivo.')
  })
}

function openPhoneCall(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  if (!digits) {
    Alert.alert('Sin telefono', 'Este lead no tiene telefono registrado.')
    return
  }
  Linking.openURL(`tel:${digits}`).catch(() => {
    Alert.alert('No se pudo llamar', 'Revisa que el dispositivo pueda realizar llamadas.')
  })
}

function showPendingAction(action: string) {
  Alert.alert(action, 'Esta accion visual ya esta en la pantalla; falta conectar su flujo operativo.')
}
