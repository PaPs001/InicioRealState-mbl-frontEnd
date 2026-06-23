import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './index.styles'
import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { usePathname, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  disconnectGoogleCalendar,
  createGoogleCalendarDate,
  deleteGoogleCalendarDate,
  getBackendLeadRecords,
  getGoogleCalendars,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendarDates,
  getGoogleCalendarTasks,
  getSelectedGoogleCalendars,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  type CreateGoogleCalendarDatePayload,
  type GoogleCalendarDate,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar,
  type GoogleTask,
  type GoogleTaskList,
} from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  LogOut,
  PieChart,
  Plus,
  Settings,
  StopCircle,
  Trash2,
  X,
} from 'lucide-react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { LeadFollowUp, PropertyLead } from '@/lib/types'
WebBrowser.maybeCompleteAuthSession()

const priorities = [
  { value: '5', label: 'Apartados\nEn cierre' },
  { value: '3', label: 'Mensajes sin\nresponder' },
  { value: '2', label: 'Propiedades\nen edicion' },
  { value: '1', label: 'Incidencia \nurgente' },
  { value: '3', label: 'Campañas\nfinalizaron' },
  { value: '5', label: 'Citas hoy' },
]

const advisors = [
  { name: 'Carlos Trujeque', current: '2', target: '/5', status: 'Impulsar', tone: '#6d2b68' },
  { name: 'Jorge Sanchez', current: '5', target: '/6', status: 'Cerca de la meta', tone: '#25623c' },
  { name: 'Citlalli Tapia', current: '1', target: '/4', status: 'Atencion ', tone: '#704022' },
  { name: 'Victor Perea', current: '2', target: '/5', status: 'Impulsar', tone: '#2a326d' },
]

interface AppointmentPreviewItem {
  id?: string
  title: string
  lineOne: string
  lineTwo: string
  day: string
  time: string
  status: string
  sortTime: number
  canDelete: boolean
}

interface LeadFollowUpEntry {
  lead: PropertyLead
  followUp: LeadFollowUp
}

const campaignRows = [
  ['C13 CASA - VILLA PARADISO', '28 de abril de 2026 -> 10 de mayo de 2026', 'Por agotarse ', '$514', '#704022'],
  ['112 TORRE E COTO 6 - ALDEA HORTUS', '28 de abril de 2026 -> 10 de mayo de 2026', 'Excedido ', '-$105', '#6d2222'],
  ['CASA 305 LOS ENCANTOS 3', '28 de abril de 2026 -> 10 de mayo de 2026', 'Saludable', '$1,027', '#25623c'],
  ['401 TORRE 3 - SAUZ', '28 de abril de 2026 -> 10 de mayo de 2026', 'Saludable', '$2,002', '#25623c'],
]

function getDefaultTestStartDateTime() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

function getDefaultTestEndDateTime() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 30, 0, 0)
  return date.toISOString()
}

export default function CoordinatorRentUserScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const { authToken } = useSessionDomain()
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const [calendarAppointments, setCalendarAppointments] = useState<AppointmentPreviewItem[]>([])
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [isCalendarSettingsLoading, setIsCalendarSettingsLoading] = useState(false)
  const [isSavingCalendarSelection, setIsSavingCalendarSelection] = useState(false)
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendarOption[]>([])
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState<SelectedGoogleCalendar[]>([])
  const [googleConnectionStatus, setGoogleConnectionStatus] = useState<GoogleCalendarConnectionStatus | null>(null)
  const [isTestingCalendarAction, setIsTestingCalendarAction] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isCalendarSettingsScreenOpen, setIsCalendarSettingsScreenOpen] = useState(false)
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false)
  const [coordinatorLeads, setCoordinatorLeads] = useState<PropertyLead[]>([])
  const [isCoordinatorLeadsLoading, setIsCoordinatorLeadsLoading] = useState(false)
  const [testAppointmentForm, setTestAppointmentForm] = useState<CreateGoogleCalendarDatePayload>({
    title: 'Visita de prueba',
    description: 'Cita creada desde el panel temporal',
    location: 'Oficina Inicio Real Estate',
    startDateTime: getDefaultTestStartDateTime(),
    endDateTime: getDefaultTestEndDateTime(),
    timeZone: 'America/Mexico_City',
    appointmentType: 'venta',
    helpedBy: 'Alexa',
  })
  const [calendarMessage, setCalendarMessage] = useState('Conecta Google Calendar para cargar tus citas reales.')

  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const loadCoordinatorLeads = useCallback(async () => {
    if (!authToken) {
      setCoordinatorLeads([])
      return
    }

    setIsCoordinatorLeadsLoading(true)
    try {
      const leads = await getBackendLeadRecords(authToken, { includeFollowUps: true })
      setCoordinatorLeads(leads)
    } catch (error) {
      console.warn('No se pudieron cargar los leads reales del coordinador:', error)
      setCoordinatorLeads([])
    } finally {
      setIsCoordinatorLeadsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    loadCoordinatorLeads()
  }, [loadCoordinatorLeads])

  const refreshCurrentCoordinatorLeads = () => {
    loadCoordinatorLeads()
  }

  const loadCalendarDates = useCallback(async (options: { sync?: boolean } = {}) => {
    if (!authToken) {
      setCalendarAppointments([])
      setIsGoogleConnected(false)
      setCalendarMessage('Inicia sesion para cargar tus citas reales.')
      return
    }

    setIsCalendarLoading(true)
    try {
      const [datesResult, tasksResult] = await Promise.allSettled([
        getGoogleCalendarDates(authToken, { sync: options.sync }),
        getGoogleCalendarTasks(authToken),
      ])
      const dates = datesResult.status === 'fulfilled' ? datesResult.value : []
      const taskLists = tasksResult.status === 'fulfilled' ? tasksResult.value : []
      const appointments = [
        ...dates.map(mapGoogleDateToAppointment),
        ...mapGoogleTasksToAppointments(taskLists),
      ].sort((current, next) => current.sortTime - next.sortTime)

      if (datesResult.status === 'rejected') {
        console.warn('No se pudieron cargar los eventos de Google Calendar:', datesResult.reason)
      }
      if (tasksResult.status === 'rejected') {
        console.warn('No se pudieron cargar las tareas de Google:', tasksResult.reason)
      }

      setIsGoogleConnected(datesResult.status === 'fulfilled' || tasksResult.status === 'fulfilled')
      setCalendarAppointments(appointments)
      setCalendarMessage(appointments.length > 0 ? '' : 'No hay citas ni tareas de Google para esta semana.')
    } catch (error) {
      console.warn('No se pudieron cargar las citas de Google Calendar:', error)
      setCalendarAppointments([])
      setIsGoogleConnected(false)
      setCalendarMessage('Conecta Google Calendar para cargar tus citas reales.')
    } finally {
      setIsCalendarLoading(false)
    }
  }, [authToken])

  const loadGoogleCalendarSettings = useCallback(async () => {
    if (!authToken) {
      setGoogleCalendars([])
      setSelectedGoogleCalendars([])
      return
    }

    setIsCalendarSettingsLoading(true)
    try {
      const [calendars, selectedCalendars, connectionStatus] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
        getGoogleCalendarConnectionStatus(authToken),
      ])
      setGoogleCalendars(calendars)
      setSelectedGoogleCalendars(selectedCalendars)
      setGoogleConnectionStatus(connectionStatus)
    } catch (error) {
      console.warn('No se pudieron cargar los calendarios de Google:', error)
    } finally {
      setIsCalendarSettingsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    loadCalendarDates({ sync: true })
  }, [loadCalendarDates])

  useEffect(() => {
    loadGoogleCalendarSettings()
  }, [loadGoogleCalendarSettings])

  const rentSummary = useMemo(() => {
    const source = catalogProperties.length > 0 ? catalogProperties : availableProperties
    const rentProperties = source.filter(property =>
      property.status === 'for_rent' ||
      property.status === 'pending_rent',
    )
    const totalRent = rentProperties.reduce((sum, property) => {
      return sum + (property.monthlyRent ?? property.price ?? 0)
    }, 0)

    return {
      propertyCount: rentProperties.length,
      opportunityAmount: totalRent * 0.05,
    }
  }, [availableProperties, catalogProperties])

  const leadSummary = useMemo(() => {
    const activeLeads = coordinatorLeads.filter(lead => !['cerrado', 'descartado'].includes(lead.status))
    const followUpEntries: LeadFollowUpEntry[] = coordinatorLeads.flatMap(lead =>
      (lead.followUps ?? []).map(followUp => ({ lead, followUp })),
    )
    const followUps = followUpEntries.map(entry => entry.followUp)
    const upcomingFollowUps = followUps.filter(hasUpcomingFollowUpDate)
    const overdueFollowUps = followUps.filter(isOverdueFollowUp)
    const contactMadeFollowUps = followUps.filter(followUp => followUp.result === 'contactMade')
    const noAnswerFollowUps = followUps.filter(followUp => followUp.result === 'noAnswer')
    const appointmentFollowUps = followUps.filter(followUp => followUp.result === 'appointmentScheduled')
    const leadsWithFollowUps = activeLeads.filter(lead => (lead.followUps ?? []).length > 0)
    const leadsWithoutNextAction = activeLeads.filter(lead =>
      !(lead.followUps ?? []).some(followUp => Boolean(followUp.nextActionDate)),
    )
    const attentionLeads = activeLeads
      .map(lead => {
        const leadFollowUps = lead.followUps ?? []
        const lateCount = leadFollowUps.filter(isOverdueFollowUp).length
        const lastFollowUpDate = leadFollowUps
          .map(followUp => getFollowUpSortTime(followUp.date))
          .filter(time => time > 0)
          .sort((current, next) => next - current)[0] ?? 0

        return {
          lead,
          followUps: leadFollowUps.length,
          lateCount,
          lastFollowUpDate,
        }
      })
      .filter(item => item.followUps > 0 || item.lateCount > 0)
      .sort((current, next) =>
        next.lateCount - current.lateCount ||
        next.followUps - current.followUps ||
        next.lastFollowUpDate - current.lastFollowUpDate,
      )
      .slice(0, 3)

    const advisorWorkload = Array.from(
      activeLeads.reduce((groups, lead) => {
        const advisorId = lead.advisorId || lead.agentId || 'sin-asesor'
        const current = groups.get(advisorId) ?? {
          id: advisorId,
          name: lead.assignedAgentName || advisorId,
          leads: 0,
          followUps: 0,
          late: 0,
        }
        const leadFollowUps = lead.followUps ?? []
        current.leads += 1
        current.followUps += leadFollowUps.length
        current.late += leadFollowUps.filter(isOverdueFollowUp).length
        groups.set(advisorId, current)
        return groups
      }, new Map<string, { id: string; name: string; leads: number; followUps: number; late: number }>())
      .values(),
    )
      .sort((current, next) =>
        next.late - current.late ||
        next.followUps - current.followUps ||
        next.leads - current.leads,
      )
      .slice(0, 3)

    const alertRows = [
      overdueFollowUps.length > 0 ? `${overdueFollowUps.length} seguimientos vencidos requieren accion` : null,
      noAnswerFollowUps.length > 0 ? `${noAnswerFollowUps.length} seguimientos quedaron sin respuesta` : null,
      leadsWithoutNextAction.length > 0 ? `${leadsWithoutNextAction.length} leads no tienen proximo contacto` : null,
    ].filter(Boolean) as string[]

    return {
      activeLeads: activeLeads.length,
      followUps: followUps.length,
      overdueFollowUps: overdueFollowUps.length,
      upcomingFollowUps: upcomingFollowUps.length,
      contactMadeFollowUps: contactMadeFollowUps.length,
      noAnswerFollowUps: noAnswerFollowUps.length,
      appointmentFollowUps: appointmentFollowUps.length,
      leadsWithoutNextAction: leadsWithoutNextAction.length,
      alertRows,
      attentionLeads,
      advisorWorkload,
      funnel: [
        ['Nuevos', activeLeads.filter(lead => (lead.followUps ?? []).length === 0).length],
        ['En seguimiento', leadsWithFollowUps.length],
        ['Por cerrar', coordinatorLeads.filter(lead =>
          lead.status === 'negociando' ||
          (lead.followUps ?? []).some(followUp => ['appointmentScheduled', 'reserved', 'signed'].includes(followUp.result ?? '')),
        ).length],
        ['Ganados', coordinatorLeads.filter(lead => lead.status === 'cerrado').length],
        ['Perdidos', coordinatorLeads.filter(lead => lead.status === 'descartado').length],
      ] satisfies [string, number][],
    }
  }, [coordinatorLeads])

  const handleConnectGoogleCalendar = async () => {
    if (!authToken || isConnectingCalendar) {
      return
    }

    setIsConnectingCalendar(true)
    try {
      const currentScreenPath = pathname.replace(/^\//, '')
      const returnTo = Linking.createURL(currentScreenPath)
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      const result = await WebBrowser.openAuthSessionAsync(
        response.url,
        returnTo,
      )

      if (result.type === 'success') {
        await loadGoogleCalendarSettings()
        await loadCalendarDates()
      }
    } catch (error) {
      console.warn('No se pudo abrir la conexion con Google Calendar:', error)
    } finally {
      setIsConnectingCalendar(false)
    }
  }

  const handleDisconnectGoogleCalendar = () => {
    if (!authToken || isDisconnectingCalendar) {
      return
    }

    Alert.alert(
      'Desconectar Google',
      'Quieres desconectar la cuenta de Google de esta sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnectingCalendar(true)
            try {
              await disconnectGoogleCalendar(authToken)
              setCalendarAppointments([])
              setGoogleCalendars([])
              setSelectedGoogleCalendars([])
              setGoogleConnectionStatus(null)
              setIsGoogleConnected(false)
              setCalendarMessage('Google Calendar fue desconectado.')
            } catch (error) {
              console.warn('No se pudo desconectar Google Calendar:', error)
            } finally {
              setIsDisconnectingCalendar(false)
            }
          },
        },
      ],
    )
  }

  const getCalendarSelection = (calendarId?: string) =>
    selectedGoogleCalendars.find(calendar => calendar.calendarId === calendarId)

  const getDefaultAppointmentType = (summary?: string) => {
    const normalizedSummary = summary?.toLowerCase() ?? ''
    if (normalizedSummary.includes('renta')) return 'renta'
    if (normalizedSummary.includes('venta')) return 'venta'
    if (normalizedSummary.includes('junta')) return 'sala_juntas'
    return 'general'
  }

  const toggleGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedGoogleCalendars(currentCalendars => {
      const existingCalendar = currentCalendars.find(item => item.calendarId === calendarId)
      if (existingCalendar) {
        return currentCalendars.map(item =>
          item.calendarId === calendarId
            ? { ...item, enabled: item.enabled === false }
            : item,
        )
      }

      return [
        ...currentCalendars,
        {
          calendarId,
          summary: calendar.summary ?? '',
          enabled: true,
          appointmentType: getDefaultAppointmentType(calendar.summary),
          primaryForCreate: currentCalendars.every(item => item.primaryForCreate !== true),
        },
      ]
    })
  }

  const markPrimaryGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId
    if (!calendarId) return

    setSelectedGoogleCalendars(currentCalendars => {
      const hasCalendar = currentCalendars.some(item => item.calendarId === calendarId)
      const nextCalendars = hasCalendar
        ? currentCalendars
        : [
            ...currentCalendars,
            {
              calendarId,
              summary: calendar.summary ?? '',
              enabled: true,
              appointmentType: getDefaultAppointmentType(calendar.summary),
            },
          ]

      return nextCalendars.map(item => ({
        ...item,
        primaryForCreate: item.calendarId === calendarId,
        enabled: item.calendarId === calendarId ? true : item.enabled,
      }))
    })
  }

  const handleSaveGoogleCalendarSelection = async () => {
    if (!authToken || isSavingCalendarSelection) return

    setIsSavingCalendarSelection(true)
    try {
      const savedCalendars = await saveSelectedGoogleCalendars(authToken, selectedGoogleCalendars)
      setSelectedGoogleCalendars(savedCalendars)
      await syncGoogleCalendars(authToken)
      await Promise.all([
        loadGoogleCalendarSettings(),
        loadCalendarDates(),
      ])
      Alert.alert('Calendarios guardados', 'La seleccion fue guardada y las citas fueron sincronizadas.')
    } catch (error) {
      console.warn('No se pudo guardar la seleccion de calendarios:', error)
      Alert.alert('No se pudo guardar', 'Revisa tu conexion con Google e intenta nuevamente.')
    } finally {
      setIsSavingCalendarSelection(false)
    }
  }

  const updateTestAppointmentForm = (field: keyof CreateGoogleCalendarDatePayload, value: string) => {
    setTestAppointmentForm(currentForm => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const enabledSelectedCalendars = selectedGoogleCalendars.filter(calendar => calendar.enabled !== false)

  const selectTestAppointmentCalendar = (calendar: SelectedGoogleCalendar) => {
    setTestAppointmentForm(currentForm => ({
      ...currentForm,
      calendarId: calendar.calendarId,
      appointmentType: calendar.appointmentType ?? currentForm.appointmentType,
      colorId: calendar.colorId ?? currentForm.colorId,
    }))
  }

  const handleRefreshCalendarDates = async () => {
    await loadCalendarDates({ sync: true })
  }

  const handleDeleteAppointment = (appointment: AppointmentPreviewItem) => {
    if (!authToken || !appointment.id || !appointment.canDelete) return

    Alert.alert(
      'Eliminar cita',
      'Quieres eliminar esta cita de la app y de Google Calendar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsCalendarLoading(true)
            try {
              await deleteGoogleCalendarDate(authToken, appointment.id!)
              await loadCalendarDates({ sync: true })
            } catch (error) {
              console.warn('No se pudo eliminar la cita:', error)
              Alert.alert('Error', 'No se pudo eliminar la cita.')
            } finally {
              setIsCalendarLoading(false)
            }
          },
        },
      ],
    )
  }

  const handleTestCreateAppointment = async () => {
    if (!authToken || isTestingCalendarAction) return

    if (!testAppointmentForm.title.trim() || !testAppointmentForm.startDateTime.trim() || !testAppointmentForm.endDateTime.trim()) {
      Alert.alert('Faltan datos', 'Titulo, inicio y fin son obligatorios.')
      return
    }

    if (!testAppointmentForm.calendarId) {
      Alert.alert('Falta calendario', 'Selecciona el calendario donde quieres crear la cita.')
      return
    }

    setIsTestingCalendarAction(true)
    try {
      await createGoogleCalendarDate(authToken, testAppointmentForm)
      await loadCalendarDates()
      Alert.alert('Cita creada', 'La cita se creo correctamente.')
      setIsAppointmentModalVisible(false)
    } catch (error) {
      console.warn('No se pudo crear la cita de prueba:', error)
      Alert.alert('Error', 'No se pudo crear la cita.')
    } finally {
      setIsTestingCalendarAction(false)
    }
  }

  const handleOpenCalendarSettings = () => {
    setIsProfileMenuOpen(false)
    setIsCalendarSettingsScreenOpen(true)
    if (authToken) {
      loadGoogleCalendarSettings()
    }
  }

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalVisible(true)
  }

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    Alert.alert(
      'Cerrar Sesion',
      'Estas seguro que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesion',
          style: 'destructive',
          onPress: () => router.replace('/logout-transition?role=admin'),
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {isCalendarSettingsScreenOpen ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsScreen}>
          <View style={styles.settingsHeader}>
            <TouchableOpacity
              style={styles.settingsBackButton}
              onPress={() => setIsCalendarSettingsScreenOpen(false)}
              activeOpacity={0.85}
            >
              <ChevronLeft size={20} color="#3d5a40" />
            </TouchableOpacity>
            <View style={styles.settingsHeaderCopy}>
              <Text style={styles.settingsTitle}>Configuracion</Text>
              <Text style={styles.settingsSubtitle}>Calendarios y conexion de Google</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <SectionHeader title="Google Calendar" compact />
            {isGoogleConnected ? (
              <TouchableOpacity
                style={styles.disconnectGoogleButton}
                onPress={handleDisconnectGoogleCalendar}
                activeOpacity={0.85}
                disabled={isDisconnectingCalendar}
              >
                <LogOut size={18} color="#3d5a40" />
                <Text style={styles.disconnectGoogleButtonText}>
                  {isDisconnectingCalendar ? 'Desconectando Google...' : 'Desconectar Google'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.googleCalendarButton}
                onPress={handleConnectGoogleCalendar}
                activeOpacity={0.85}
                disabled={isConnectingCalendar}
              >
                <CalendarDays size={18} color="#ffffff" />
                <Text style={styles.googleCalendarButtonText}>
                  {isConnectingCalendar ? 'Abriendo Google...' : 'Conectar Google Calendar'}
                </Text>
              </TouchableOpacity>
            )}

            {isGoogleConnected ? (
              <View style={styles.googleCalendarSettings}>
                <View style={styles.calendarSettingsHeader}>
                  <Text style={styles.calendarSettingsTitle}>Calendarios conectados</Text>
                  <TouchableOpacity
                    style={styles.calendarSmallButton}
                    onPress={loadGoogleCalendarSettings}
                    activeOpacity={0.85}
                    disabled={isCalendarSettingsLoading}
                  >
                    <Text style={styles.calendarSmallButtonText}>
                      {isCalendarSettingsLoading ? 'Cargando' : 'Actualizar'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {googleCalendars.length === 0 ? (
                  <Text style={styles.calendarSettingsEmpty}>
                    {isCalendarSettingsLoading ? 'Buscando calendarios...' : 'No hay calendarios disponibles.'}
                  </Text>
                ) : (
                  <View style={styles.calendarList}>
                    {googleCalendars.slice(0, 8).map(calendar => {
                      const selection = getCalendarSelection(calendar.calendarId)
                      const isEnabled = selection?.enabled === true
                      const isPrimary = selection?.primaryForCreate === true

                      return (
                        <View key={calendar.calendarId ?? calendar.summary} style={styles.calendarOptionRow}>
                          <TouchableOpacity
                            style={[styles.calendarToggle, isEnabled && styles.calendarToggleActive]}
                            onPress={() => toggleGoogleCalendar(calendar)}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.calendarToggleText, isEnabled && styles.calendarToggleTextActive]}>
                              {isEnabled ? 'ON' : 'OFF'}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.calendarOptionCopy}>
                            <Text style={styles.calendarOptionTitle} numberOfLines={1}>
                              {calendar.summary || 'Calendario sin nombre'}
                            </Text>
                            <Text style={styles.calendarOptionMeta} numberOfLines={1}>
                              {selection?.appointmentType || getDefaultAppointmentType(calendar.summary)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.calendarPrimaryButton, isPrimary && styles.calendarPrimaryButtonActive]}
                            onPress={() => markPrimaryGoogleCalendar(calendar)}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.calendarPrimaryButtonText, isPrimary && styles.calendarPrimaryButtonTextActive]}>
                              Crear
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )
                    })}
                  </View>
                )}
                <View style={styles.calendarActionsRow}>
                  <TouchableOpacity
                    style={styles.calendarActionButton}
                    onPress={handleSaveGoogleCalendarSelection}
                    activeOpacity={0.85}
                    disabled={isSavingCalendarSelection}
                  >
                    <Text style={styles.calendarActionButtonText}>
                      {isSavingCalendarSelection ? 'Guardando y sincronizando...' : 'Guardar y sincronizar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.brandLogoWrap}>
          <LogoIRSPrincipal width={146} height={48} />
        </View>

        <View style={styles.headerBlock}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.overline} numberOfLines={1}>Coordinacion de Rentas</Text>
            <View style={styles.datePill}>
              <CalendarDays size={14} color="#ffffff" />
              <Text style={styles.dateText}>13 de junio, 2026</Text>
            </View>
          </View>
          <View style={styles.profileRow}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setIsProfileMenuOpen(current => !current)}
              activeOpacity={0.85}
            >
              <Text style={styles.avatarText}>AD</Text>
            </TouchableOpacity>
            <View style={styles.profileCopy}>
              <Text style={styles.greeting}>Hola, Alexa Diaz</Text>
              <Text style={styles.helper}>Aqui esta lo importante de hoy</Text>
            </View>
          </View>
          {isProfileMenuOpen ? (
            <View style={styles.profileMenu}>
              <TouchableOpacity style={styles.profileMenuButton} onPress={handleOpenCalendarSettings} activeOpacity={0.85}>
                <Settings size={15} color="#3d5a40" />
                <Text style={styles.profileMenuButtonText}>Configuracion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileLogoutButton} onPress={handleLogout} activeOpacity={0.85}>
                <LogOut size={15} color="#ffffff" />
                <Text style={styles.profileLogoutText}>Salir</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <Bell style={styles.headerBell} size={27} color="#CFA46A" />
        </View>

        <View style={styles.heroCards}>
          <TouchableOpacity style={styles.propertiesCard} onPress={() => router.push('/coordinator/properties' as never)}
          activeOpacity={0.85}>
            <Text style={styles.metricOverline}>PROPIEDADES</Text>
            <Text style={styles.propertiesValue}>{rentSummary.propertyCount}</Text>
            <Text style={styles.metricOverline}>DISPONIBLES</Text>
          </TouchableOpacity>
          <View style={styles.monthCard}>
            <Text style={styles.monthLabel}>TU OPORTUNIDAD DEL MES</Text>
            <View style={styles.moneyRow}>
              <Text style={styles.moneyValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
                {formatCurrency(rentSummary.opportunityAmount)}
              </Text>
              <Text style={styles.currency}>MXN</Text>
            </View>
            <Text style={styles.commission}>Comision aprox.</Text>
          </View>
        </View>

        <SectionHeader title="Prioridades de hoy" />
        <HorizontalStrip>
          {priorities.map(item => (
            <View key={item.label} style={styles.priorityCard}>
              <Text style={styles.priorityValue}>{item.value}</Text>
              <Text style={styles.priorityLabel}>{item.label}</Text>
            </View>
          ))}
        </HorizontalStrip>

        <SectionHeader title="Asesores" action="Ver mas " />
        <HorizontalStrip>
          {advisors.map(item => (
            <View key={item.name} style={styles.advisorCard}>
              <View style={[styles.smallAvatar, { backgroundColor: item.tone }]} />
              <Text style={styles.advisorName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.advisorMeta}>Rentas del mes</Text>
              <View style={styles.rentGoal}>
                <Text style={styles.rentCurrent}>{item.current}</Text>
                <Text style={styles.rentTarget}>{item.target}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </HorizontalStrip>

        <View style={styles.panel}>
          <SectionHeader title="Citas de esta semana" action="Ver calendario " compact />
          {isGoogleConnected ? (
            <TouchableOpacity
              style={styles.refreshCalendarButton}
              onPress={handleRefreshCalendarDates}
              activeOpacity={0.85}
              disabled={isCalendarLoading}
            >
              <CalendarDays size={16} color="#3d5a40" />
              <Text style={styles.refreshCalendarButtonText}>
                {isCalendarLoading ? 'Recargando...' : 'Recargar calendario'}
              </Text>
            </TouchableOpacity>
          ) : null}
          <ScrollView
            style={styles.appointmentsScroll}
            contentContainerStyle={styles.appointments}
            nestedScrollEnabled
            showsVerticalScrollIndicator={calendarAppointments.length > 3}
          >
            {calendarAppointments.slice(0, 15).map(item => (
              <AppointmentRow key={`${item.id ?? item.title}-${item.time}`} item={item} onDelete={handleDeleteAppointment} />
            ))}
            {calendarAppointments.length === 0 ? (
              <View style={styles.emptyAppointments}>
                <CalendarDays size={24} color="#cbb375" />
                <Text style={styles.emptyAppointmentsText}>
                  {isCalendarLoading ? 'Cargando citas reales...' : calendarMessage}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          {isGoogleConnected ? (
            <TouchableOpacity
              style={styles.disconnectGoogleButton}
              onPress={handleDisconnectGoogleCalendar}
              activeOpacity={0.85}
              disabled={isDisconnectingCalendar}
            >
              <LogOut size={18} color="#3d5a40" />
              <Text style={styles.disconnectGoogleButtonText}>
                {isDisconnectingCalendar ? 'Desconectando Google...' : 'Desconectar Google'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.googleCalendarButton}
              onPress={handleConnectGoogleCalendar}
              activeOpacity={0.85}
              disabled={isConnectingCalendar}
            >
              <CalendarDays size={18} color="#ffffff" />
              <Text style={styles.googleCalendarButtonText}>
                {isConnectingCalendar ? 'Abriendo Google...' : 'Conectar Google Calendar'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.centerButton} onPress={handleOpenAppointmentModal} activeOpacity={0.85}>
            <Plus size={22} color="#3d5a40" />
            <Text style={styles.centerButtonText}>Agregar cita </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <SectionHeader title="Seguimientos" action="Ver mas " compact />
          <Text style={styles.panelSubtitle}>Panorama general de actividad de leads</Text>

          {isCoordinatorLeadsLoading ? (
            <View style={styles.emptyLeadState}>
              <Text style={styles.emptyLeadStateText}>Cargando leads...</Text>
            </View>
          ) : coordinatorLeads.length === 0 ? (
            <View style={styles.emptyLeadState}>
              <Text style={styles.emptyLeadStateText}>Sin leads para revisar </Text>
            </View>
          ) : (
            <>
              <View style={styles.followGrid}>
                <StatTile icon={<PieChart size={22} color="#cbb375" />} value={String(leadSummary.activeLeads)} label="Leads activos " />
                <StatTile icon={<Clock3 size={22} color="#cbb375" />} value={String(leadSummary.followUps)} label="Seguimientos" />
                <StatTile icon={<Info size={22} color="#ff6666" />} value={String(leadSummary.overdueFollowUps)} label="Atrasados" />
                <StatTile icon={<CalendarDays size={22} color="#cbb375" />} value={String(leadSummary.upcomingFollowUps)} label="Proximos" />
              </View>

              {leadSummary.alertRows.map(alert => (
                <View key={alert} style={styles.alertRow}>
                  <Info size={17} color="#b84343" />
                  <Text style={styles.alertText} numberOfLines={1}>{alert}</Text>
                  <ChevronRight size={14} color="#b84343" />
                </View>
              ))}

              <Text style={styles.subSectionTitle}>Vista rapida</Text>
              <View style={styles.funnelRow}>
                {leadSummary.funnel.map(([label, value]) => (
                  <View key={label} style={styles.funnelItem}>
                    <Text style={styles.funnelValue}>{value}</Text>
                    <Text style={styles.funnelLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subSectionTitle}>Resultados de contacto</Text>
              <View style={styles.funnelRow}>
                <View style={styles.funnelItem}>
                  <Text style={styles.funnelValue}>{leadSummary.contactMadeFollowUps}</Text>
                  <Text style={styles.funnelLabel}>Contactos efectivos</Text>
                </View>
                <View style={styles.funnelItem}>
                  <Text style={styles.funnelValue}>{leadSummary.noAnswerFollowUps}</Text>
                  <Text style={styles.funnelLabel}>Sin respuesta</Text>
                </View>
                <View style={styles.funnelItem}>
                  <Text style={styles.funnelValue}>{leadSummary.appointmentFollowUps}</Text>
                  <Text style={styles.funnelLabel}>Citas agendadas</Text>
                </View>
                <View style={styles.funnelItem}>
                  <Text style={styles.funnelValue}>{leadSummary.leadsWithoutNextAction}</Text>
                  <Text style={styles.funnelLabel}>Sin proximo contacto</Text>
                </View>
              </View>

              {leadSummary.attentionLeads.length > 0 ? (
                <>
                  <Text style={styles.subSectionTitle}>Leads que requieren foco</Text>
                  <View style={styles.focusBox}>
                    {leadSummary.attentionLeads.map((item, index) => (
                      <View
                        key={item.lead.id}
                        style={[styles.focusRow, index < leadSummary.attentionLeads.length - 1 && styles.focusDivider]}
                      >
                        <View style={styles.alertDot} />
                        <Text style={styles.focusName} numberOfLines={1}>{item.lead.name}</Text>
                        <Text style={styles.focusMetric} numberOfLines={1}>{item.followUps} seg.</Text>
                        <Text style={styles.focusLate} numberOfLines={1}>
                          {item.lateCount > 0 ? `${item.lateCount} tarde` : 'Al dia'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              {leadSummary.advisorWorkload.length > 0 ? (
                <>
                  <Text style={styles.subSectionTitle}>Carga por asesor</Text>
                  <View style={styles.focusBox}>
                    {leadSummary.advisorWorkload.map((advisor, index) => (
                      <View
                        key={advisor.id}
                        style={[styles.focusRow, index < leadSummary.advisorWorkload.length - 1 && styles.focusDivider]}
                      >
                        <View style={styles.alertDot} />
                        <Text style={styles.focusName} numberOfLines={1}>{advisor.name}</Text>
                        <Text style={styles.focusMetric} numberOfLines={1}>{advisor.followUps} seg.</Text>
                        <Text style={styles.focusLate} numberOfLines={1}>{advisor.late} tarde</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              {leadSummary.followUps === 0 ? (
                <View style={styles.emptyLeadState}>
                  <Text style={styles.emptyLeadStateText}>Sin seguimientos para revisar</Text>
                </View>
              ) : null}

              <View style={styles.detailButtons}>
                <TouchableOpacity
                  style={styles.miniButton}
                  onPress={() => router.push('/coordinator/leads' as never)}
                  activeOpacity={0.85}
                >
                  <ChevronRight size={17} color="#0c6740" />
                  <Text style={styles.miniButtonText}>Ver seguimientos </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniButton, styles.miniButtonPrimary]}
                  onPress={refreshCurrentCoordinatorLeads}
                  activeOpacity={0.85}
                >
                  <Clock3 size={16} color="#ffffff" />
                  <Text style={[styles.miniButtonText, styles.miniButtonTextPrimary]}>Actualizar </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader title="Campañas de renta" action="Ver mas " compact />
          <Text style={styles.panelSubtitle}>Propiedades con publicidad</Text>
          <View style={styles.followGrid}>
            <StatTile icon={<CheckCircle2 size={22} color="#0c6740" />} value="15" label="activas" />
            <StatTile icon={<Clock3 size={22} color="#c59b55" />} value="4" label="por vencer" />
            <StatTile icon={<StopCircle size={22} color="#b2a898" />} value="3" label="sin pauta" />
            <StatTile icon={<Info size={22} color="#ff6666" />} value="6" label="requieren revision" />
          </View>

          <Text style={styles.subSectionTitle}>Atencion requerida</Text>
          <View style={styles.campaignList}>
            {campaignRows.map(row => (
              <View key={row[0]} style={styles.campaignRow}>
                <View style={styles.propertyThumb} />
                <View style={styles.campaignCopy}>
                  <Text style={styles.campaignTitle} numberOfLines={1}>{row[0]}</Text>
                  <Text style={styles.campaignDate} numberOfLines={1}>{row[1]}</Text>
                  <View style={[styles.campaignStatus, { backgroundColor: row[4] }]}>
                    <Text style={styles.campaignStatusText}>{row[2]}</Text>
                  </View>
                </View>
                <View style={styles.budgetBox}>
                  <Text style={styles.budgetLabel}>Publicidad restante:</Text>
                  <Text style={styles.budgetValue}>{row[3]}</Text>
                </View>
                <ChevronRight size={16} color="#cbb375" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      )}

      <Modal
        visible={isAppointmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAppointmentModalVisible(false)}
      >
        <View style={styles.appointmentModalOverlay}>
          <View style={styles.appointmentModalPanel}>
            <View style={styles.appointmentModalHeader}>
              <Text style={styles.appointmentModalTitle}>Agregar cita</Text>
              <TouchableOpacity
                style={styles.appointmentModalClose}
                onPress={() => setIsAppointmentModalVisible(false)}
                activeOpacity={0.85}
              >
                <X size={18} color="#3d5a40" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.appointmentModalContent}>
              <Text style={styles.calendarTestLabel}>Calendario destino</Text>
              {enabledSelectedCalendars.length === 0 ? (
                <Text style={styles.calendarSettingsEmpty}>
                  {isGoogleConnected
                    ? 'Activa y guarda al menos un calendario antes de crear citas.'
                    : 'Conecta Google Calendar desde configuracion antes de crear citas.'}
                </Text>
              ) : (
                <View style={styles.calendarDestinationList}>
                  {enabledSelectedCalendars.map(calendar => {
                    const isSelected = testAppointmentForm.calendarId === calendar.calendarId

                    return (
                      <TouchableOpacity
                        key={calendar.calendarId}
                        style={[styles.calendarDestinationChip, isSelected && styles.calendarDestinationChipActive]}
                        onPress={() => selectTestAppointmentCalendar(calendar)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[styles.calendarDestinationChipText, isSelected && styles.calendarDestinationChipTextActive]}
                          numberOfLines={1}
                        >
                          {calendar.summary || calendar.appointmentType || 'Calendario'}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
              <Text style={styles.calendarTestLabel}>Titulo de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.title}
                onChangeText={value => updateTestAppointmentForm('title', value)}
                placeholder="Titulo"
                placeholderTextColor="#8d8d8d"
              />
              <Text style={styles.calendarTestLabel}>Ubicacion de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.location ?? ''}
                onChangeText={value => updateTestAppointmentForm('location', value)}
                placeholder="Ubicacion"
                placeholderTextColor="#8d8d8d"
              />
              <Text style={styles.calendarTestLabel}>Descripcion de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.description ?? ''}
                onChangeText={value => updateTestAppointmentForm('description', value)}
                placeholder="Descripcion"
                placeholderTextColor="#8d8d8d"
              />
              <Text style={styles.calendarTestLabel}>Fecha de la cita</Text>
              <CalendarPick
                value={testAppointmentForm.startDateTime}
                onChange={value => updateTestAppointmentForm('startDateTime', value)}
              />
              <Text style={styles.calendarTestLabel}>Fecha de terminacion</Text>
              <CalendarPick
                value={testAppointmentForm.endDateTime}
                onChange={value => updateTestAppointmentForm('endDateTime', value)}
              />
              <Text style={styles.calendarTestLabel}>Tipo de calendario</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.appointmentType ?? ''}
                onChangeText={value => updateTestAppointmentForm('appointmentType', value)}
                placeholder="Tipo"
                placeholderTextColor="#8d8d8d"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.calendarTestCreateButton}
                onPress={handleTestCreateAppointment}
                activeOpacity={0.85}
                disabled={isTestingCalendarAction}
              >
                <Text style={styles.calendarTestCreateButtonText}>
                  {isTestingCalendarAction ? 'Procesando...' : 'Crear cita'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

function mapGoogleDateToAppointment(date: GoogleCalendarDate): AppointmentPreviewItem {
  const startValue = date.startDateTime ?? undefined
  const descriptionLines = (date.description ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  return {
    id: date._id,
    title: date.title || 'Cita programada',
    lineOne: date.location ? `Ubicacion: ${date.location}` : descriptionLines[0] || 'Cliente: Pendiente',
    lineTwo: date.helpedBy ? `Apoyo de: ${date.helpedBy}` : date.appointmentType ? `Tipo: ${date.appointmentType}` : 'Asesor: Pendiente',
    day: formatCalendarDay(startValue),
    time: formatCalendarTime(startValue),
    status: getCalendarStatusLabel(date.status ?? undefined),
    sortTime: getCalendarSortTime(startValue),
    canDelete: Boolean(date._id),
  }
}

function getFollowUpDate(followUp: LeadFollowUp) {
  return followUp.nextActionDate || followUp.date
}

function getFollowUpSortTime(value?: string) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function hasUpcomingFollowUpDate(followUp: LeadFollowUp) {
  const dateValue = getFollowUpDate(followUp)
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  return date >= now
}

function isOverdueFollowUp(followUp: LeadFollowUp) {
  const dateValue = followUp.nextActionDate
  if (!dateValue) return false

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  return date < new Date()
}

function mapGoogleTasksToAppointments(taskLists: GoogleTaskList[]): AppointmentPreviewItem[] {
  return taskLists.flatMap(taskList =>
    (taskList.tasks ?? [])
      .filter(task => task.status !== 'completed')
      .map(task => mapGoogleTaskToAppointment(task, taskList.title)),
  )
}

function mapGoogleTaskToAppointment(task: GoogleTask, taskListTitle?: string): AppointmentPreviewItem {
  const dueValue = task.due ?? task.updated
  const notes = task.notes?.trim()

  return {
    id: task.id,
    title: task.title || 'Tarea pendiente',
    lineOne: taskListTitle ? `Lista: ${taskListTitle}` : 'Lista: Google Tasks',
    lineTwo: notes || 'Tarea de Google',
    day: formatCalendarDay(dueValue),
    time: task.due ? formatCalendarTime(dueValue) : 'Sin hora',
    status: getTaskStatusLabel(task.status),
    sortTime: getCalendarSortTime(dueValue),
    canDelete: false,
  }
}

function formatCalendarDay(value?: string) {
  if (!value) return 'Fecha pendiente'
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Fecha pendiente'

  const formatted = parsedDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatCalendarTime(value?: string) {
  if (!value) return 'Hora pendiente'
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Hora pendiente'

  return parsedDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getCalendarStatusLabel(status?: string) {
  if (status === 'confirmed') return 'Confirmada'
  if (status === 'cancelled') return 'Cancelada'
  if (status === 'tentative') return 'Tentativa'
  return 'Pendiente'
}

function getTaskStatusLabel(status?: string) {
  if (status === 'completed') return 'Completada'
  if (status === 'needsAction') return 'Tarea'
  return 'Tarea'
}

function getCalendarSortTime(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return Number.MAX_SAFE_INTEGER

  return parsedDate.getTime()
}

function SectionHeader({ title, action, compact }: { title: string; action?: string; compact?: boolean }) {
  return (
    <View style={[styles.sectionHeader, compact && styles.sectionHeaderCompact]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  )
}

function HorizontalStrip({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalStrip}>
      {children}
    </ScrollView>
  )
}

function AppointmentRow({ item, onDelete }: { item: AppointmentPreviewItem; onDelete: (item: AppointmentPreviewItem) => void }) {
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentCopy}>
        <Text style={styles.appointmentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.appointmentText} numberOfLines={1}>{item.lineOne}</Text>
        <Text style={styles.appointmentText} numberOfLines={1}>{item.lineTwo}</Text>
      </View>
      <View style={styles.appointmentDivider} />
      <View style={styles.appointmentDate}>
        <View style={styles.dateLine}>
          <CalendarDays size={14} color="#cbb375" />
          <Text style={styles.appointmentDay} numberOfLines={1}>{item.day}</Text>
        </View>
        <Text style={styles.appointmentTime} numberOfLines={1}>{item.time}</Text>
        <View style={styles.confirmPill}>
          <Text style={styles.confirmText}>{item.status}</Text>
        </View>
      </View>
      {item.canDelete ? (
        <TouchableOpacity style={styles.deleteAppointmentButton} onPress={() => onDelete(item)} activeOpacity={0.85}>
          <Trash2 size={15} color="#ffffff" />
        </TouchableOpacity>
      ) : (
        <ChevronRight size={16} color="#cbb375" />
      )}
    </View>
  )
}

function StatTile({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

type CalendarPickerMode = 'date' | 'time'

function getPickerDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function CalendarPick({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const date = getPickerDate(value)
  const [mode, setMode] = useState<CalendarPickerMode>('date')
  const [show, setShow] = useState(false)

  const showMode = (currentMode: CalendarPickerMode) => {
    setShow(true)
    setMode(currentMode)
  }

  const showDatepicker = () => {
    showMode('date')
  }

  const showTimepicker = () => {
    showMode('time')
  }

  return (
    <View style={styles.calendarPicker}>
      <Text style={styles.calendarPickerValue}>{date.toLocaleString()}</Text>
      <View style={styles.calendarPickerActions}>
        <TouchableOpacity style={styles.calendarPickerButton} onPress={showDatepicker} activeOpacity={0.85}>
          <Text style={styles.calendarPickerButtonText}>Fecha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.calendarPickerButton} onPress={showTimepicker} activeOpacity={0.85}>
          <Text style={styles.calendarPickerButtonText}>Hora</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          onValueChange={(_event, selectedDate) => {
            onChange(selectedDate.toISOString())
            setShow(false)
          }}
          onDismiss={() => setShow(false)}
        />
      )}
    </View>
  )
}
