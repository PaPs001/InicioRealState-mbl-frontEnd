import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Eye, FileText, Flag, Home, LogOut, Settings } from 'lucide-react-native'

import LogoIRSPrincipal from '@/assets/logoIRSprincipal.svg'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { disconnectGoogleCalendar, getBackendLeadRecords, getGoogleCalendarAuthUrl, getGoogleCalendarConnectionStatus, getGoogleCalendarDates, getGoogleCalendars, getSelectedGoogleCalendars, saveSelectedGoogleCalendars, syncGoogleCalendars, type GoogleCalendarDate, type GoogleCalendarOption, type SelectedGoogleCalendar } from '@/lib/api'
import { adviserDashboardMock, type AdviserCampaignMetric, type AdviserCampaignProperty, type AdviserLeadAlert, type AdviserLeadMetric, type AdviserPriority, type AdviserProgressGoal, type AdviserQuickAccess } from '@/lib/mock/adviser-dashboard'
import type { LeadFollowUp, PropertyLead } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { styles } from './index.styles'

WebBrowser.maybeCompleteAuthSession()

type AppointmentPreviewItem = { id?: string; property: string; client: string; adviser: string; day: string; time: string; status: string; sortTime: number }

type LeadFollowUpEntry = { lead: PropertyLead; followUp: LeadFollowUp }

const toneColors = {
  neutral: { background: '#ffffff', border: '#e4e4e4', text: '#2a2d31' },
  success: { background: '#e5f8e9', border: '#b5dfbd', text: '#2c7a3f' },
  warning: { background: '#ecdab5', border: '#d8bd85', text: '#c27a20' },
  danger: { background: '#ffe1dd', border: '#ffc5bc', text: '#f05a64' },
} as const

export default function AdviserHomeScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const { authToken, currentUser, logout } = useSessionDomain()
  const { availableProperties, catalogProperties, hasLoadedCatalog, isCatalogLoading, loadCatalogProperties } = usePropertyDomain()
  const data = adviserDashboardMock
  const advisorName = currentUser?.name?.trim() || currentUser?.email?.split('@')[0] || data.name
  const advisorInitials = getInitials(advisorName)
  const [leads, setLeads] = useState<PropertyLead[]>([])
  const [isLeadsLoading, setIsLeadsLoading] = useState(false)
  const [calendarAppointments, setCalendarAppointments] = useState<AppointmentPreviewItem[]>([])
  const [calendarMessage, setCalendarMessage] = useState('Conecta Google Calendar para cargar tus citas reales.')
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)
  const [isCalendarSettingsLoading, setIsCalendarSettingsLoading] = useState(false)
  const [isSavingCalendarSelection, setIsSavingCalendarSelection] = useState(false)
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendarOption[]>([])
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState<SelectedGoogleCalendar[]>([])

  useEffect(() => { if (!hasLoadedCatalog && !isCatalogLoading) loadCatalogProperties() }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const loadLeads = useCallback(async () => {
    if (!authToken) { setLeads([]); return }
    setIsLeadsLoading(true)
    try { setLeads(await getBackendLeadRecords(authToken, { includeFollowUps: true })) }
    catch (error) { console.warn('No se pudieron cargar los leads reales del asesor:', error); setLeads([]) }
    finally { setIsLeadsLoading(false) }
  }, [authToken])

  const loadCalendarDates = useCallback(async (options: { sync?: boolean } = {}) => {
    if (!authToken) { setCalendarAppointments([]); setIsGoogleConnected(false); setCalendarMessage('Inicia sesion para cargar tus citas reales.'); return }
    setIsCalendarLoading(true)
    try {
      const dates = await getGoogleCalendarDates(authToken, { sync: options.sync })
      const appointments = dates.map(mapGoogleDateToAppointment).sort((a, b) => a.sortTime - b.sortTime)
      setCalendarAppointments(appointments)
      setIsGoogleConnected(true)
      setCalendarMessage(appointments.length ? '' : 'No hay citas de Google para esta semana.')
    } catch (error) {
      console.warn('No se pudieron cargar las citas de Google Calendar para asesor:', error)
      setCalendarAppointments([]); setIsGoogleConnected(false); setCalendarMessage('Conecta Google Calendar para cargar tus citas reales.')
    } finally { setIsCalendarLoading(false) }
  }, [authToken])
  const loadGoogleCalendarSettings = useCallback(async () => {
    if (!authToken) { setGoogleCalendars([]); setSelectedGoogleCalendars([]); return }
    setIsCalendarSettingsLoading(true)
    try {
      const [calendars, selectedCalendars, status] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
        getGoogleCalendarConnectionStatus(authToken),
      ])
      setGoogleCalendars(calendars)
      setSelectedGoogleCalendars(selectedCalendars)
      setIsGoogleConnected(status.connected)
    } catch (error) { console.warn('No se pudieron cargar los calendarios del asesor:', error) }
    finally { setIsCalendarSettingsLoading(false) }
  }, [authToken])

  useEffect(() => { loadLeads() }, [loadLeads])
  useEffect(() => { loadCalendarDates({ sync: true }) }, [loadCalendarDates])
  useEffect(() => { loadGoogleCalendarSettings() }, [loadGoogleCalendarSettings])

  const rentSummary = useMemo(() => {
    const source = catalogProperties.length > 0 ? catalogProperties : availableProperties
    const rentProperties = source.filter(property => property.status === 'for_rent' || property.status === 'pending_rent')
    const totalRent = rentProperties.reduce((sum, property) => sum + (property.monthlyRent ?? property.price ?? 0), 0)
    return { propertyCount: rentProperties.length, opportunityAmount: totalRent * 0.05 }
  }, [availableProperties, catalogProperties])

  const leadSummary = useMemo(() => {
    const activeLeads = leads.filter(lead => !['cerrado', 'descartado'].includes(lead.status))
    const entries: LeadFollowUpEntry[] = leads.flatMap(lead => (lead.followUps ?? []).map(followUp => ({ lead, followUp })))
    const followUps = entries.map(entry => entry.followUp)
    const overdue = followUps.filter(isOverdueFollowUp)
    const upcoming = followUps.filter(hasUpcomingFollowUpDate)
    const noAnswer = followUps.filter(followUp => followUp.result === 'noAnswer')
    const appointments = followUps.filter(followUp => followUp.result === 'appointmentScheduled')
    const withFollowUps = activeLeads.filter(lead => (lead.followUps ?? []).length > 0)
    const withoutNext = activeLeads.filter(lead => !(lead.followUps ?? []).some(followUp => Boolean(followUp.nextActionDate)))
    return {
      followUps: followUps.length,
      overdueFollowUps: overdue.length,
      appointmentFollowUps: appointments.length,
      leadMetrics: [
        { id: 'active', value: activeLeads.length, label: 'Leads activos', tone: 'neutral' },
        { id: 'pending', value: followUps.length, label: 'Seguimientos', tone: 'warning' },
        { id: 'late', value: overdue.length, label: 'Atrasados', tone: overdue.length ? 'danger' : 'success' },
        { id: 'today', value: upcoming.length, label: 'Proximos', tone: 'warning' },
      ] satisfies AdviserLeadMetric[],
      leadFunnel: [
        { id: 'new', value: activeLeads.filter(lead => (lead.followUps ?? []).length === 0).length, label: 'Nuevos', tone: 'neutral' },
        { id: 'following', value: withFollowUps.length, label: 'En seguimiento', tone: 'neutral' },
        { id: 'closing', value: appointments.length, label: 'Por cerrar', tone: 'neutral' },
        { id: 'won', value: leads.filter(lead => lead.status === 'cerrado').length, label: 'Ganados', tone: 'success' },
        { id: 'lost', value: leads.filter(lead => lead.status === 'descartado').length, label: 'Perdidos', tone: 'neutral' },
      ] satisfies AdviserLeadMetric[],
      leadAlerts: [
        overdue.length ? { id: 'expired', message: `${overdue.length} seguimientos vencidos` } : null,
        noAnswer.length ? { id: 'no-answer', message: `${noAnswer.length} seguimientos sin respuesta` } : null,
        withoutNext.length ? { id: 'next-action', message: `${withoutNext.length} leads sin siguiente accion` } : null,
      ].filter(Boolean) as AdviserLeadAlert[],
    }
  }, [leads])

  const priorities = useMemo(() => [
    { id: 'closing', value: leadSummary.appointmentFollowUps, label: 'Citas por cerrar' },
    { id: 'followups', value: leadSummary.followUps, label: 'Seguimientos' },
    { id: 'properties', value: rentSummary.propertyCount, label: 'Propiedades activas' },
    { id: 'urgent', value: leadSummary.overdueFollowUps, label: 'Urgentes' },
  ] satisfies AdviserPriority[], [leadSummary, rentSummary.propertyCount])

  const handleLogout = () => Alert.alert('Cerrar sesion', 'Estas seguro que deseas cerrar sesion?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Cerrar sesion', style: 'destructive', onPress: async () => { await logout(); router.replace('/login/login' as never) } },
  ])

  const handleConnectGoogleCalendar = async () => {
    if (!authToken || isConnectingCalendar) return
    setIsConnectingCalendar(true)
    try {
      const returnTo = Linking.createURL(pathname.replace(/^\//, ''))
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      const result = await WebBrowser.openAuthSessionAsync(response.url, returnTo)
      if (result.type === 'success') await Promise.all([loadGoogleCalendarSettings(), loadCalendarDates({ sync: true })])
    } catch (error) { console.warn('No se pudo conectar Google Calendar en asesor:', error) }
    finally { setIsConnectingCalendar(false) }
  }

  const handleDisconnectGoogleCalendar = () => {
    if (!authToken || isDisconnectingCalendar) return
    Alert.alert('Desconectar Google', 'Quieres desconectar la cuenta de Google de esta sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desconectar', style: 'destructive', onPress: async () => {
        setIsDisconnectingCalendar(true)
        try { await disconnectGoogleCalendar(authToken); setGoogleCalendars([]); setSelectedGoogleCalendars([]); setCalendarAppointments([]); setIsGoogleConnected(false); setCalendarMessage('Google Calendar fue desconectado.') }
        catch (error) { console.warn('No se pudo desconectar Google Calendar en asesor:', error) }
        finally { setIsDisconnectingCalendar(false) }
      } },
    ])
  }

  const getCalendarSelection = (calendarId?: string) => selectedGoogleCalendars.find(calendar => calendar.calendarId === calendarId)
  const toggleGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return
    setSelectedGoogleCalendars(current => {
      const existing = current.find(item => item.calendarId === calendarId)
      if (existing) return current.map(item => item.calendarId === calendarId ? { ...item, enabled: item.enabled === false } : item)
      return [...current, { calendarId, summary: calendar.summary ?? '', enabled: true, appointmentType: getDefaultAppointmentType(calendar.summary), primaryForCreate: current.every(item => item.primaryForCreate !== true) }]
    })
  }
  const markPrimaryGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return
    setSelectedGoogleCalendars(current => {
      const next = current.some(item => item.calendarId === calendarId) ? current : [...current, { calendarId, summary: calendar.summary ?? '', enabled: true, appointmentType: getDefaultAppointmentType(calendar.summary) }]
      return next.map(item => ({ ...item, enabled: item.calendarId === calendarId ? true : item.enabled, primaryForCreate: item.calendarId === calendarId }))
    })
  }
  const handleSaveGoogleCalendarSelection = async () => {
    if (!authToken || isSavingCalendarSelection) return
    setIsSavingCalendarSelection(true)
    try {
      setSelectedGoogleCalendars(await saveSelectedGoogleCalendars(authToken, selectedGoogleCalendars))
      await syncGoogleCalendars(authToken)
      await Promise.all([loadGoogleCalendarSettings(), loadCalendarDates({ sync: true })])
      Alert.alert('Calendarios guardados', 'La seleccion fue guardada y las citas fueron sincronizadas.')
    } catch (error) { console.warn('No se pudo guardar la seleccion de calendarios del asesor:', error) }
    finally { setIsSavingCalendarSelection(false) }
  }
  if (isSettingsOpen) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.notification} activeOpacity={0.85} onPress={() => setIsSettingsOpen(false)}><ChevronLeft size={22} color="#315b41" /></TouchableOpacity>
            <View><Text style={styles.sectionHeaderTitle}>Configuracion</Text><Text style={styles.panelSubtitle}>Calendarios y conexion de Google</Text></View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.sectionHeaderTitle}>Google Calendar</Text>
            <Text style={styles.panelSubtitle}>Selecciona que calendarios usa el asesor.</Text>
            <TouchableOpacity style={isGoogleConnected ? styles.outlineButton : styles.centerButton} activeOpacity={0.85} disabled={isConnectingCalendar || isDisconnectingCalendar} onPress={isGoogleConnected ? handleDisconnectGoogleCalendar : handleConnectGoogleCalendar}>
              {isGoogleConnected ? <LogOut size={16} color="#006b43" /> : <CalendarDays size={17} color="#3d3b3b" />}
              <Text style={isGoogleConnected ? styles.outlineButtonText : styles.centerButtonText}>{isConnectingCalendar ? 'Abriendo Google...' : isDisconnectingCalendar ? 'Desconectando...' : isGoogleConnected ? 'Desconectar Google' : 'Conectar Google Calendar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.panel}>
            <View style={styles.sectionHeader}><Text style={styles.sectionHeaderTitle}>Calendarios conectados</Text><TouchableOpacity activeOpacity={0.85} onPress={loadGoogleCalendarSettings}><Text style={styles.sectionAction}>{isCalendarSettingsLoading ? 'Cargando' : 'Actualizar'}</Text></TouchableOpacity></View>
            {googleCalendars.length === 0 ? <Text style={styles.panelSubtitle}>No hay calendarios disponibles.</Text> : (
              <View style={styles.quickGrid}>{googleCalendars.map(calendar => {
                const selection = getCalendarSelection(calendar.calendarId)
                const isEnabled = selection?.enabled === true
                const isPrimary = selection?.primaryForCreate === true
                return (
                  <TouchableOpacity key={calendar.calendarId} style={styles.quickButton} activeOpacity={0.85} onPress={() => toggleGoogleCalendar(calendar)}>
                    <CalendarDays size={15} color={isEnabled ? '#006b43' : '#c89c4c'} />
                    <Text style={styles.quickText} numberOfLines={2}>{calendar.summary || 'Calendario'}</Text>
                    <Text style={styles.sectionAction}>{isEnabled ? 'Activo' : 'Off'}</Text>
                    <TouchableOpacity activeOpacity={0.85} onPress={() => markPrimaryGoogleCalendar(calendar)}><Text style={styles.sectionAction}>{isPrimary ? 'Principal' : 'Usar'}</Text></TouchableOpacity>
                  </TouchableOpacity>
                )
              })}</View>
            )}
            <TouchableOpacity style={styles.centerButton} activeOpacity={0.85} onPress={handleSaveGoogleCalendarSelection} disabled={isSavingCalendarSelection}><Settings size={17} color="#3d3b3b" /><Text style={styles.centerButtonText}>{isSavingCalendarSelection ? 'Guardando...' : 'Guardar calendarios'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}><LogoIRSPrincipal width={146} height={48} /></View>
        <View style={styles.topRow}>
          <Text style={styles.roleLabel}>{data.role}</Text>
          <View style={styles.topActions}><TouchableOpacity style={styles.loginButton} onPress={handleLogout} activeOpacity={0.85}><Text style={styles.loginButtonText}>Salir</Text></TouchableOpacity><View style={styles.datePill}><Text style={styles.dateText}>{formatCurrentDashboardDate()}</Text></View></View>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}><View style={styles.avatar}><Text style={styles.avatarText}>{advisorInitials}</Text></View><View><Text style={styles.greeting}>Hola, {advisorName}</Text><Text style={styles.helper}>{data.headline}</Text></View></View>
          <TouchableOpacity style={styles.notification} activeOpacity={0.85} onPress={() => setIsSettingsOpen(true)}><Settings size={20} color="#c79443" /></TouchableOpacity>
        </View>
        <View style={styles.heroCards}>
          <TouchableOpacity style={styles.availableCard} activeOpacity={0.85} onPress={() => router.push('/userAdviser/properties' as never)}><Text style={styles.spacedLabel}>PROPIEDADES</Text><Text style={styles.availableValue}>{rentSummary.propertyCount}</Text><Text style={styles.spacedLabel}>DISPONIBLES</Text></TouchableOpacity>
          <View style={styles.earningsCard}><Text style={styles.earningsLabel}>OPORTUNIDAD DEL MES</Text><View style={styles.earningsValueRow}><Text style={styles.earningsValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{formatCurrency(rentSummary.opportunityAmount)}</Text><Text style={styles.currency}>MXN</Text></View><Text style={styles.earningsCaption}>Comision aprox.</Text></View>
        </View>
        <TouchableOpacity style={styles.listedButton} activeOpacity={0.85} onPress={() => router.push('/userAdviser/properties' as never)}><View style={styles.listedIcon}><Home size={26} color="#d4b66f" /></View><View style={styles.listedCopy}><Text style={styles.listedTitle}>Mis propiedades LISTADAS</Text><Text style={styles.listedMeta}>{rentSummary.propertyCount} Activas</Text></View><ChevronRight size={18} color="#2a2d31" /></TouchableOpacity>
        <Text style={styles.sectionTitle}>Prioridades de hoy</Text><View style={styles.prioritiesRow}>{priorities.map((priority, index) => <PriorityCard key={priority.id} priority={priority} highlight={index === priorities.length - 1} />)}</View>
        <Text style={styles.sectionTitle}>Tu avance</Text><View style={styles.goalsRow}>{data.goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}</View>
        <View style={[styles.panel, styles.appointmentsPanel]}>
          <View style={styles.sectionHeader}><Text style={styles.sectionHeaderTitle}>Citas de esta semana</Text><TouchableOpacity activeOpacity={0.85} onPress={() => setIsSettingsOpen(true)}><Text style={styles.sectionAction}>Configurar</Text></TouchableOpacity></View>
          <View style={styles.appointmentList}>{calendarAppointments.length === 0 ? <Text style={styles.panelSubtitle}>{isCalendarLoading ? 'Cargando citas reales...' : calendarMessage}</Text> : calendarAppointments.slice(0, 5).map(appointment => <AppointmentCard key={`${appointment.id ?? appointment.property}-${appointment.time}`} appointment={appointment} />)}</View>
          <TouchableOpacity style={styles.centerButton} activeOpacity={0.85} onPress={() => loadCalendarDates({ sync: true })} disabled={isCalendarLoading}><CalendarDays size={17} color="#3d3b3b" /><Text style={styles.centerButtonText}>{isCalendarLoading ? 'Cargando...' : 'Recargar calendario'}</Text></TouchableOpacity>
        </View>
        <View style={[styles.panel, styles.quickPanel]}><Text style={styles.sectionHeaderTitle}>Accesos rapidos</Text><View style={styles.quickGrid}>{data.quickAccess.map(item => <QuickAccessButton key={item.id} item={item} />)}</View></View>
        <View style={[styles.panel, styles.leadPanel]}>
          <View style={styles.sectionHeader}><View><Text style={styles.sectionHeaderTitle}>Seguimientos</Text><Text style={styles.panelSubtitle}>Panorama general de actividad de leads</Text></View><TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/userAdviser/rent-followups' as never)}><Text style={styles.sectionAction}>Ver mas</Text></TouchableOpacity></View>
          {isLeadsLoading ? <Text style={styles.panelSubtitle}>Cargando leads...</Text> : <><View style={styles.metricGrid}>{leadSummary.leadMetrics.map(metric => <LeadMetricCard key={metric.id} metric={metric} />)}</View><Text style={styles.subTitle}>Vista rapida</Text><View style={styles.funnelRow}>{leadSummary.leadFunnel.map(metric => <FunnelMetric key={metric.id} metric={metric} />)}</View>{(leadSummary.leadAlerts.length > 0 ? leadSummary.leadAlerts : data.leadAlerts).map(alert => <LeadAlertRow key={alert.id} alert={alert} />)}<TouchableOpacity style={styles.outlineButton} activeOpacity={0.85} onPress={() => router.push('/userAdviser/rent-followups' as never)}><Eye size={16} color="#006b43" /><Text style={styles.outlineButtonText}>Ver detalle</Text></TouchableOpacity></>}
        </View>
        <View style={[styles.panel, styles.campaignPanel]}>
          <View style={styles.sectionHeader}><View><Text style={styles.sectionHeaderTitle}>Campanas de renta</Text><Text style={styles.panelSubtitle}>Propiedades con publicidad</Text></View><Text style={styles.sectionAction}>Ver mas</Text></View>
          <View style={styles.campaignMetricGrid}>{data.campaignMetrics.map(metric => <CampaignMetricCard key={metric.id} metric={metric} />)}</View><View style={styles.campaignList}>{data.campaigns.map(campaign => <CampaignRow key={campaign.id} campaign={campaign} />)}</View><TouchableOpacity style={styles.centerButton} activeOpacity={0.85}><Text style={styles.centerButtonText}>Ver Campanas</Text><Flag size={17} color="#ffffff" /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
function PriorityCard({ priority, highlight }: { priority: AdviserPriority; highlight?: boolean }) {
  return <View style={styles.priorityCard}><Text style={[styles.priorityValue, highlight && styles.priorityValueGold]}>{priority.value}</Text><Text style={styles.priorityLabel}>{priority.label}</Text></View>
}
function GoalCard({ goal }: { goal: AdviserProgressGoal }) {
  const progress = Math.min(1, goal.current / goal.target)
  return <View style={styles.goalCard}><Text style={styles.goalTitle}>{goal.title}</Text><View style={styles.goalValueRow}><Text style={styles.goalValue}>{goal.current}/{goal.target}</Text><Text style={styles.goalUnit}>{goal.unit}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View><Text style={styles.goalCaption} numberOfLines={1}>{goal.caption}</Text></View>
}
function AppointmentCard({ appointment }: { appointment: AppointmentPreviewItem }) {
  return <View style={styles.appointmentCard}><View style={styles.appointmentCopy}><Text style={styles.appointmentTitle} numberOfLines={1}>{appointment.property}</Text><Text style={styles.appointmentMeta} numberOfLines={1}>Cliente: {appointment.client}</Text><Text style={styles.appointmentMeta} numberOfLines={1}>Asesor: {appointment.adviser}</Text></View><View style={styles.appointmentDate}><View style={styles.dayPill}><CalendarDays size={10} color="#ffffff" /><Text style={styles.appointmentDay} numberOfLines={1}>{appointment.day}</Text></View><Text style={styles.appointmentTime}>{appointment.time}</Text><View style={styles.statusPill}><Text style={styles.statusText}>{appointment.status}</Text></View></View><ChevronRight size={17} color="#d4b66f" /></View>
}
function QuickAccessButton({ item }: { item: AdviserQuickAccess }) {
  return <TouchableOpacity style={styles.quickButton} activeOpacity={0.85}><FileText size={15} color="#c89c4c" /><Text style={styles.quickText} numberOfLines={2}>{item.label}</Text><ChevronRight size={13} color="#2a2d31" /></TouchableOpacity>
}
function LeadMetricCard({ metric }: { metric: AdviserLeadMetric }) {
  const tone = toneColors[metric.tone]
  return <View style={[styles.metricCard, { backgroundColor: tone.background, borderColor: tone.border }]}><Text style={[styles.metricValue, { color: tone.text }]}>{metric.value}</Text><Text style={styles.metricLabel}>{metric.label}</Text></View>
}
function FunnelMetric({ metric }: { metric: AdviserLeadMetric }) {
  return <View style={styles.funnelItem}><Text style={styles.funnelValue}>{metric.value}</Text><Text style={styles.funnelLabel}>{metric.label}</Text></View>
}
function LeadAlertRow({ alert }: { alert: AdviserLeadAlert }) {
  return <View style={styles.alertRow}><Bell size={15} color="#e95454" /><Text style={styles.alertText} numberOfLines={1}>{alert.message}</Text><ChevronRight size={14} color="#2a2d31" /></View>
}
function CampaignMetricCard({ metric }: { metric: AdviserCampaignMetric }) {
  const tone = toneColors[metric.tone]
  return <View style={[styles.campaignMetric, { backgroundColor: tone.background, borderColor: tone.border }]}><Text style={[styles.campaignValue, { color: tone.text }]}>{metric.value}</Text><Text style={styles.campaignLabel}>{metric.label}</Text></View>
}
function CampaignRow({ campaign }: { campaign: AdviserCampaignProperty }) {
  const tone = toneColors[campaign.statusTone]
  return <TouchableOpacity style={styles.campaignRow} activeOpacity={0.85}><Image source={campaign.image} style={styles.campaignImage} resizeMode="cover" /><View style={styles.campaignCopy}><Text style={styles.campaignTitle} numberOfLines={1}>{campaign.title}</Text><Text style={styles.campaignDates} numberOfLines={1}>{campaign.dateRange}</Text><View style={[styles.campaignStatus, { backgroundColor: tone.background, borderColor: tone.border }]}><Text style={[styles.campaignStatusText, { color: tone.text }]}>{campaign.status}</Text></View></View><View style={styles.remainingBox}><Text style={styles.remainingLabel}>Publicidad restante:</Text><Text style={[styles.remainingValue, campaign.statusTone === 'danger' && { color: '#e95454' }]}>{campaign.remaining}</Text></View><ChevronRight size={14} color="#2a2d31" /></TouchableOpacity>
}
function mapGoogleDateToAppointment(date: GoogleCalendarDate): AppointmentPreviewItem {
  const startValue = date.startDateTime ?? undefined
  const descriptionLines = (date.description ?? '').split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  return { id: date._id, property: date.title || 'Cita programada', client: date.location || descriptionLines[0] || 'Pendiente', adviser: date.helpedBy || date.advisorId || 'Pendiente', day: formatCalendarDay(startValue), time: formatCalendarTime(startValue), status: getCalendarStatusLabel(date.status ?? undefined), sortTime: getCalendarSortTime(startValue) }
}
function getInitials(name: string) { const parts = name.trim().split(/\s+/).filter(Boolean); return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'AS' }
function formatCurrentDashboardDate() { return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()) }
function getDefaultAppointmentType(summary?: string) { const value = summary?.toLowerCase() ?? ''; if (value.includes('renta')) return 'renta'; if (value.includes('venta')) return 'venta'; if (value.includes('junta')) return 'sala_juntas'; return 'general' }
function getFollowUpDate(followUp: LeadFollowUp) { return followUp.nextActionDate || followUp.date }
function hasUpcomingFollowUpDate(followUp: LeadFollowUp) { const date = new Date(getFollowUpDate(followUp)); return !Number.isNaN(date.getTime()) && date >= new Date() }
function isOverdueFollowUp(followUp: LeadFollowUp) { if (!followUp.nextActionDate) return false; const date = new Date(followUp.nextActionDate); return !Number.isNaN(date.getTime()) && date < new Date() }
function formatCalendarDay(value?: string) { if (!value) return 'Fecha pendiente'; const date = new Date(value); if (Number.isNaN(date.getTime())) return 'Fecha pendiente'; const formatted = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }); return formatted.charAt(0).toUpperCase() + formatted.slice(1) }
function formatCalendarTime(value?: string) { if (!value) return 'Hora pendiente'; const date = new Date(value); if (Number.isNaN(date.getTime())) return 'Hora pendiente'; return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }
function getCalendarStatusLabel(status?: string) { if (status === 'confirmed') return 'Confirmada'; if (status === 'cancelled') return 'Cancelada'; if (status === 'tentative') return 'Tentativa'; return 'Pendiente' }
function getCalendarSortTime(value?: string) { if (!value) return Number.MAX_SAFE_INTEGER; const date = new Date(value); return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime() }
