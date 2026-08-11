import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './index.styles'
import LogoIRSPrincipal from '@/assets/logoIRSprincipal.svg'
import { usePathname, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  disconnectGoogleCalendar,
  createGoogleCalendarDate,
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
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  LogOut,
  PieChart,
  Plus,
  Settings,
  X,
} from 'lucide-react-native'
import type { LeadFollowUp, Property, PropertyLead } from '@/lib/types'
WebBrowser.maybeCompleteAuthSession()
import { useOperationMode } from '@/modules/settings'
import { parseQueryParams } from 'expo-router/build/fork/getStateFromPath-forks'

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


function getDefaultTestStartDateTime() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

function getDefaultTestEndDateTime() {
  return getAppointmentEndDateTime(getDefaultTestStartDateTime())
}

function getAppointmentEndDateTime(startDateTime: string) {
  const date = new Date(startDateTime)
  const startDate = Number.isNaN(date.getTime()) ? new Date() : date
  startDate.setHours(startDate.getHours() + 4)
  return startDate.toISOString()
}

export default function CoordinatorRentUserScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const { authToken, currentUser, logout } = useSessionDomain()
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const {operationMode, capabilities } = useOperationMode()
  
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
  const [isCalendarListExpanded, setIsCalendarListExpanded] = useState(false)
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false)
  const [appointmentSelectionScreen, setAppointmentSelectionScreen] = useState<'lead' | 'property' | null>(null)
  const [coordinatorLeads, setCoordinatorLeads] = useState<PropertyLead[]>([])
  const [isCoordinatorLeadsLoading, setIsCoordinatorLeadsLoading] = useState(false)
  const hasRequestedInitialCatalogRef = useRef(false)
  const hasLoadedInitialCoordinatorLeadsRef = useRef(false)
  const hasLoadedInitialCalendarDatesRef = useRef(false)
  const hasLoadedInitialCalendarSettingsRef = useRef(false)
  const coordinatorName = currentUser?.name?.trim() || currentUser?.email?.split('@')[0] || 'Coordinador'
  const coordinatorInitials = getInitials(coordinatorName)
  const currentDateLabel = formatCurrentDashboardDate()
  const [testAppointmentForm, setTestAppointmentForm] = useState<CreateGoogleCalendarDatePayload>({
    title: 'Visita de prueba',
    description: 'Cita creada desde el panel temporal',
    location: 'Oficina Inicio Real Estate',
    startDateTime: getDefaultTestStartDateTime(),
    endDateTime: getDefaultTestEndDateTime(),
    timeZone: 'America/Mexico_City',
    appointmentType: 'venta',
    helpedBy: coordinatorName,
    advisorId: currentUser?.id ?? null,
  })
  const [calendarMessage, setCalendarMessage] = useState('Conecta Google Calendar para cargar tus citas.')

  
  useEffect(() => {
    setTestAppointmentForm(current => {
      if (current.helpedBy && current.helpedBy !== 'Coordinador') {
        return current
      }

      return {
        ...current,
        helpedBy: coordinatorName,
        advisorId: current.advisorId ?? currentUser?.id ?? null,
      }
    })
  }, [coordinatorName, currentUser?.id])

  useEffect(() => {
    if (hasLoadedCatalog || isCatalogLoading || hasRequestedInitialCatalogRef.current) return

    hasRequestedInitialCatalogRef.current = true
    console.info('[CoordinatorDashboard][initial-load]', { service: 'catalog-properties' })
    loadCatalogProperties()
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
    if (!authToken || hasLoadedInitialCoordinatorLeadsRef.current) return

    hasLoadedInitialCoordinatorLeadsRef.current = true
    console.info('[CoordinatorDashboard][initial-load]', { service: 'leads' })
    loadCoordinatorLeads()
  }, [authToken, loadCoordinatorLeads])

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
      ]
        .filter(isAppointmentFromTodayOn)
        .sort((current, next) => current.sortTime - next.sortTime)

      if (datesResult.status === 'rejected') {
        console.warn('No se pudieron cargar los eventos de Google Calendar:', datesResult.reason)
      }
      if (tasksResult.status === 'rejected') {
        console.warn('No se pudieron cargar las tareas de Google:', tasksResult.reason)
      }

      if (datesResult.status === 'rejected' && tasksResult.status === 'rejected') {
        const connectionStatus = await getGoogleCalendarConnectionStatus(authToken)
        setGoogleConnectionStatus(connectionStatus)
        setIsGoogleConnected(connectionStatus.status === 'connected' && connectionStatus.connected)
        setCalendarAppointments([])
        setCalendarMessage(
          connectionStatus.status === 'requires_reconnect'
            ? 'Reconecta Google Calendar para recuperar tus citas.'
            : 'Conecta Google Calendar para cargar tus citas.',
        )
        return
      }

      setIsGoogleConnected(true)
      setCalendarAppointments(appointments)
      setCalendarMessage(appointments.length > 0 ? '' : 'No hay citas ni tareas de Google para esta semana.')
    } catch (error) {
      console.warn('No se pudieron cargar las citas de Google Calendar:', error)
      setCalendarAppointments([])
      try {
        const connectionStatus = await getGoogleCalendarConnectionStatus(authToken)
        setGoogleConnectionStatus(connectionStatus)
        setIsGoogleConnected(connectionStatus.status === 'connected' && connectionStatus.connected)
        setCalendarMessage(
          connectionStatus.status === 'requires_reconnect'
            ? 'Reconecta Google Calendar para recuperar tus citas.'
            : 'Conecta Google Calendar para cargar tus citas.',
        )
      } catch {
        setIsGoogleConnected(false)
        setCalendarMessage('Conecta Google Calendar para cargar tus citas.')
      }
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
      const connectionStatus = await getGoogleCalendarConnectionStatus(authToken)
      setGoogleConnectionStatus(connectionStatus)
      setIsGoogleConnected(connectionStatus.status === 'connected' && connectionStatus.connected)

      if (connectionStatus.status === 'requires_reconnect') {
        setGoogleCalendars([])
        setSelectedGoogleCalendars([])
        setCalendarMessage('Reconecta Google Calendar para recuperar tus citas.')
        return
      }

      if (!connectionStatus.connected) {
        setGoogleCalendars([])
        setSelectedGoogleCalendars([])
        return
      }

      const [calendars, selectedCalendars] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
      ])
      setGoogleCalendars(calendars)
      setSelectedGoogleCalendars(selectedCalendars)
    } catch (error) {
      console.warn('No se pudieron cargar los calendarios de Google:', error)
    } finally {
      setIsCalendarSettingsLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken || hasLoadedInitialCalendarDatesRef.current) return

    hasLoadedInitialCalendarDatesRef.current = true
    console.info('[CoordinatorDashboard][initial-load]', { service: 'calendar-dates' })
    loadCalendarDates({ sync: true })
  }, [authToken, loadCalendarDates])

  useEffect(() => {
    if (!authToken || hasLoadedInitialCalendarSettingsRef.current) return

    hasLoadedInitialCalendarSettingsRef.current = true
    console.info('[CoordinatorDashboard][initial-load]', { service: 'calendar-settings' })
    loadGoogleCalendarSettings()
  }, [authToken, loadGoogleCalendarSettings])

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

  const appointmentPropertyOptions = useMemo(() => {
    const source = catalogProperties.length > 0 ? catalogProperties : availableProperties
    const propertiesById = new Map<string, Property>()

    source.forEach(property => {
      const propertyId = property.id || property._id
      if (propertyId && !propertiesById.has(propertyId)) {
        propertiesById.set(propertyId, property)
      }
    })

    return Array.from(propertiesById.values()).sort((current, next) =>
      getPropertyDisplayName(current).localeCompare(getPropertyDisplayName(next)),
    )
  }, [availableProperties, catalogProperties])

  const appointmentLeadOptions = useMemo(() =>
    coordinatorLeads
      .filter(lead => !['cerrado', 'descartado'].includes(lead.status))
      .sort((current, next) => current.name.localeCompare(next.name)),
  [coordinatorLeads])

  const selectedAppointmentLead = useMemo(() =>
    appointmentLeadOptions.find(lead => lead.id === testAppointmentForm.leadId),
  [appointmentLeadOptions, testAppointmentForm.leadId])

  const selectedAppointmentProperty = useMemo(() =>
    appointmentPropertyOptions.find(property => (property.id || property._id) === testAppointmentForm.propertyId),
  [appointmentPropertyOptions, testAppointmentForm.propertyId])

  const handleConnectGoogleCalendar = async () => {
    if (!authToken || isConnectingCalendar) {
      return
    }

    setIsConnectingCalendar(true)
    try {
      const currentScreenPath = pathname.replace(/^\//, '')
      const returnTo = Linking.createURL(currentScreenPath)
      console.info('[Google Calendar][mobile] starting OAuth', {
        currentScreenPath,
        returnTo,
      })
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo)
      console.info('[Google Calendar][mobile] auth URL received', {
        authUrlHost: getUrlHost(response.url),
        authUrlPath: getUrlPath(response.url),
      })
      const result = await WebBrowser.openAuthSessionAsync(
        response.url,
        returnTo,
      )
      console.info('[Google Calendar][mobile] OAuth browser result', {
        type: result.type,
        url: result.type === 'success' ? result.url : undefined,
      })

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
  const needsGoogleReconnect = googleConnectionStatus?.status === 'requires_reconnect'
  const visibleGoogleCalendars = isCalendarListExpanded ? googleCalendars : googleCalendars.slice(0, 5)
  const canToggleCalendarList = googleCalendars.length > 5

  const selectTestAppointmentCalendar = (calendar: SelectedGoogleCalendar) => {
    setTestAppointmentForm(currentForm => ({
      ...currentForm,
      calendarId: calendar.calendarId,
      appointmentType: calendar.appointmentType ?? currentForm.appointmentType,
      colorId: calendar.colorId ?? currentForm.colorId,
    }))
  }

  const selectAppointmentLead = (lead: PropertyLead) => {
    const property = appointmentPropertyOptions.find(item => (item.id || item._id) === lead.propertyId)
    const advisorId = lead.advisorId || lead.agentId || currentUser?.id || null

    setTestAppointmentForm(currentForm => ({
      ...currentForm,
      leadId: lead.id,
      propertyId: lead.propertyId || currentForm.propertyId,
      advisorId,
      title: currentForm.title?.trim() && currentForm.title !== 'Visita de prueba'
        ? currentForm.title
        : `Cita con ${lead.name}`,
      description: currentForm.description?.trim() && currentForm.description !== 'Cita creada desde el panel temporal'
        ? currentForm.description
        : `Lead: ${lead.name}${lead.phone ? `\nTelefono: ${lead.phone}` : ''}${lead.email ? `\nCorreo: ${lead.email}` : ''}`,
      location: property?.address || property?.city || currentForm.location,
    }))
    setAppointmentSelectionScreen(null)
  }

  const selectAppointmentProperty = (property: Property) => {
    const propertyId = property.id || property._id
    if (!propertyId) return

    setTestAppointmentForm(currentForm => ({
      ...currentForm,
      propertyId,
      location: property.address || property.city || currentForm.location,
    }))
    setAppointmentSelectionScreen(null)
  }

  const handleRefreshCalendarDates = async () => {
    await loadCalendarDates({ sync: true })
  }


  const handleTestCreateAppointment = async () => {
    if (!authToken || isTestingCalendarAction) return

    if (!testAppointmentForm.title.trim() || !testAppointmentForm.startDateTime.trim()) {
      Alert.alert('Faltan datos', 'Titulo e inicio son obligatorios.')
      return
    }

    if (!testAppointmentForm.leadId) {
      Alert.alert('Falta lead', 'Selecciona el lead al que se le agendara la cita.')
      return
    }

    if (!testAppointmentForm.propertyId) {
      Alert.alert('Falta propiedad', 'Selecciona la propiedad relacionada con la cita.')
      return
    }

    if (!testAppointmentForm.calendarId) {
      Alert.alert('Falta calendario', 'Selecciona el calendario donde quieres crear la cita.')
      return
    }

    setIsTestingCalendarAction(true)
    try {
      const payload: CreateGoogleCalendarDatePayload = {
        ...testAppointmentForm,
        endDateTime: getAppointmentEndDateTime(testAppointmentForm.startDateTime),
        advisorId: testAppointmentForm.advisorId || currentUser?.id || null,
        helpedBy: testAppointmentForm.helpedBy || coordinatorName,
      }
      await createGoogleCalendarDate(authToken, payload)
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
    setAppointmentSelectionScreen(null)
    setIsAppointmentModalVisible(true)
    void loadGoogleCalendarSettings()
  }

  const handleCloseAppointmentModal = () => {
    setAppointmentSelectionScreen(null)
    setIsAppointmentModalVisible(false)
  }

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    Alert.alert(
      'Cerrar sesion',
      'Estas seguro que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesion',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login/login')
          },
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
            <SectionHeader title="Preferencias de la aplicacion" compact />
            <TouchableOpacity
              style={styles.googleCalendarButton}
              onPress={() => router.push('/userCoordinator/settings' as never)}
              activeOpacity={0.85}
            >
              <Settings size={18} color="#ffffff" />
              <Text style={styles.googleCalendarButtonText}>Modo de operacion</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.panel}>
            <SectionHeader title="Google Calendar" compact />
            {isGoogleConnected && !needsGoogleReconnect ? (
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
                  {isConnectingCalendar
                    ? 'Abriendo Google...'
                    : needsGoogleReconnect
                      ? 'Reconectar Google Calendar'
                      : 'Conectar Google Calendar'}
                </Text>
              </TouchableOpacity>
            )}

            {(isGoogleConnected || needsGoogleReconnect) ? (
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
                {needsGoogleReconnect ? (
                  <Text style={styles.calendarSettingsEmpty}>
                    Google Calendar requiere reconexion para volver a sincronizar.
                  </Text>
                ) : googleCalendars.length === 0 ? (
                  <Text style={styles.calendarSettingsEmpty}>
                    {isCalendarSettingsLoading ? 'Buscando calendarios...' : 'No hay calendarios disponibles.'}
                  </Text>
                ) : (
                  <View style={styles.calendarList}>
                    {visibleGoogleCalendars.map(calendar => {
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
                    {canToggleCalendarList ? (
                      <TouchableOpacity
                        style={styles.calendarSmallButton}
                        onPress={() => setIsCalendarListExpanded(isExpanded => !isExpanded)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.calendarSmallButtonText}>
                          {isCalendarListExpanded ? 'Ver menos' : 'Ver todos'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
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
              <Text style={styles.dateText}>{currentDateLabel}</Text>
            </View>
          </View>
          <View style={styles.profileRow}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setIsProfileMenuOpen(current => !current)}
              activeOpacity={0.85}
            >
              <Text style={styles.avatarText}>{coordinatorInitials}</Text>
            </TouchableOpacity>
            <View style={styles.profileCopy}>
              <Text style={styles.greeting}>Hola, {coordinatorName}</Text>
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
          <TouchableOpacity style={styles.propertiesCard} onPress={() => router.push('/userCoordinator/properties' as never)}
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

        <View style={styles.panel}>
          <SectionHeader title="Citas de esta semana" action="Ver calendario " compact />
          {isGoogleConnected && !needsGoogleReconnect ? (
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
              <AppointmentRow key={`${item.id ?? item.title}-${item.time}`} item={item} />
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
          {(!isGoogleConnected || needsGoogleReconnect) ? (
            <TouchableOpacity
              style={styles.googleCalendarButton}
              onPress={handleConnectGoogleCalendar}
              activeOpacity={0.85}
              disabled={isConnectingCalendar}
            >
              <CalendarDays size={18} color="#ffffff" />
              <Text style={styles.googleCalendarButtonText}>
                {isConnectingCalendar
                  ? 'Abriendo Google...'
                  : needsGoogleReconnect
                    ? 'Reconectar Google Calendar'
                    : 'Conectar Google Calendar'}
              </Text>
            </TouchableOpacity>
          ) : null}
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
                  onPress={() => router.push('/userCoordinator/leads' as never)}
                  activeOpacity={0.85}
                >
                  <ChevronRight size={17} color="#0c6740" />
                  <Text style={styles.miniButtonText}>Ver seguimientos </Text>
                </TouchableOpacity>
                {/*
                <TouchableOpacity
                  style={styles.miniButton}
                  onPress={() => router.push('/userCoordinator/leads' as never)}
                  activeOpacity={0.85}
                >
                  <Flag size={16} color="#0c6740" />
                  <Text style={styles.miniButtonText}>Version anterior </Text>
                </TouchableOpacity>
                */}
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

      </ScrollView>
      )}

      <Modal
        visible={isAppointmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseAppointmentModal}
      >
        <View style={styles.appointmentModalOverlay}>
          <View style={styles.appointmentModalPanel}>
            <View style={styles.appointmentModalHeader}>
              {appointmentSelectionScreen ? (
                <TouchableOpacity
                  style={styles.appointmentModalBack}
                  onPress={() => setAppointmentSelectionScreen(null)}
                  activeOpacity={0.85}
                >
                  <ChevronLeft size={18} color="#3d5a40" />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.appointmentModalTitle}>
                {appointmentSelectionScreen === 'lead'
                  ? 'Seleccionar lead'
                  : appointmentSelectionScreen === 'property'
                    ? 'Seleccionar propiedad'
                    : 'Agregar cita'}
              </Text>
              <TouchableOpacity
                style={styles.appointmentModalClose}
                onPress={handleCloseAppointmentModal}
                activeOpacity={0.85}
              >
                <X size={18} color="#3d5a40" />
              </TouchableOpacity>
            </View>
            {appointmentSelectionScreen === 'lead' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.appointmentModalContent}>
                {isCoordinatorLeadsLoading ? (
                  <Text style={styles.calendarSettingsEmpty}>Cargando leads...</Text>
                ) : appointmentLeadOptions.length === 0 ? (
                  <Text style={styles.calendarSettingsEmpty}>No hay leads activos disponibles.</Text>
                ) : (
                  <View style={styles.appointmentSelectionList}>
                    {appointmentLeadOptions.map(lead => {
                      const isSelected = testAppointmentForm.leadId === lead.id
                      const propertyName = getPropertyDisplayName(
                        appointmentPropertyOptions.find(property => (property.id || property._id) === lead.propertyId),
                      )

                      return (
                        <TouchableOpacity
                          key={lead.id}
                          style={[styles.appointmentSelectionRow, isSelected && styles.appointmentSelectionRowActive]}
                          onPress={() => selectAppointmentLead(lead)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.appointmentSelectionRowCopy}>
                            <Text style={[styles.appointmentSelectionRowTitle, isSelected && styles.appointmentSelectionRowTitleActive]} numberOfLines={1}>
                              {lead.name}
                            </Text>
                            <Text style={[styles.appointmentSelectionRowMeta, isSelected && styles.appointmentSelectionRowMetaActive]} numberOfLines={2}>
                              {propertyName || lead.phone || lead.status}
                            </Text>
                          </View>
                          <ChevronRight size={17} color={isSelected ? '#ffffff' : '#3d5a40'} />
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </ScrollView>
            ) : appointmentSelectionScreen === 'property' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.appointmentModalContent}>
                {isCatalogLoading ? (
                  <Text style={styles.calendarSettingsEmpty}>Cargando propiedades...</Text>
                ) : appointmentPropertyOptions.length === 0 ? (
                  <Text style={styles.calendarSettingsEmpty}>No hay propiedades disponibles.</Text>
                ) : (
                  <View style={styles.appointmentSelectionList}>
                    {appointmentPropertyOptions.map(property => {
                      const propertyId = property.id || property._id
                      const isSelected = testAppointmentForm.propertyId === propertyId

                      return (
                        <TouchableOpacity
                          key={propertyId}
                          style={[styles.appointmentSelectionRow, isSelected && styles.appointmentSelectionRowActive]}
                          onPress={() => selectAppointmentProperty(property)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.appointmentSelectionRowCopy}>
                            <Text style={[styles.appointmentSelectionRowTitle, isSelected && styles.appointmentSelectionRowTitleActive]} numberOfLines={1}>
                              {getPropertyDisplayName(property)}
                            </Text>
                            <Text style={[styles.appointmentSelectionRowMeta, isSelected && styles.appointmentSelectionRowMetaActive]} numberOfLines={2}>
                              {property.city || property.address || property.status}
                            </Text>
                          </View>
                          <ChevronRight size={17} color={isSelected ? '#ffffff' : '#3d5a40'} />
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.appointmentModalContent}>
                <Text style={styles.calendarTestLabel}>Calendario destino</Text>
                {enabledSelectedCalendars.length === 0 ? (
                  <Text style={styles.calendarSettingsEmpty}>
                    {needsGoogleReconnect
                      ? 'Reconecta Google Calendar desde configuracion antes de crear citas.'
                      : isGoogleConnected
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
                <Text style={styles.calendarTestLabel}>Lead relacionado</Text>
                <TouchableOpacity
                  style={styles.appointmentPickerButton}
                  onPress={() => setAppointmentSelectionScreen('lead')}
                  activeOpacity={0.85}
                >
                  <View style={styles.appointmentPickerCopy}>
                    <Text style={styles.appointmentPickerTitle} numberOfLines={1}>
                      {selectedAppointmentLead?.name || 'Escoger lead'}
                    </Text>
                    <Text style={styles.appointmentPickerMeta} numberOfLines={1}>
                      {isCoordinatorLeadsLoading
                        ? 'Cargando leads...'
                        : selectedAppointmentLead
                          ? selectedAppointmentLead.phone || selectedAppointmentLead.status
                          : `${appointmentLeadOptions.length} leads disponibles`}
                    </Text>
                  </View>
                  <ChevronRight size={17} color="#3d5a40" />
                </TouchableOpacity>
                <Text style={styles.calendarTestLabel}>Propiedad relacionada</Text>
                <TouchableOpacity
                  style={styles.appointmentPickerButton}
                  onPress={() => setAppointmentSelectionScreen('property')}
                  activeOpacity={0.85}
                >
                  <View style={styles.appointmentPickerCopy}>
                    <Text style={styles.appointmentPickerTitle} numberOfLines={1}>
                      {selectedAppointmentProperty ? getPropertyDisplayName(selectedAppointmentProperty) : 'Escoger propiedad'}
                    </Text>
                    <Text style={styles.appointmentPickerMeta} numberOfLines={1}>
                      {isCatalogLoading
                        ? 'Cargando propiedades...'
                        : selectedAppointmentProperty
                          ? selectedAppointmentProperty.city || selectedAppointmentProperty.address || selectedAppointmentProperty.status
                          : `${appointmentPropertyOptions.length} propiedades disponibles`}
                    </Text>
                  </View>
                  <ChevronRight size={17} color="#3d5a40" />
                </TouchableOpacity>
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
                <Text style={styles.calendarTestLabel}>Fecha de la cita</Text>
                <CalendarPick
                  value={testAppointmentForm.startDateTime}
                  onChange={value => {
                    updateTestAppointmentForm('startDateTime', value)
                    updateTestAppointmentForm('endDateTime', getAppointmentEndDateTime(value))
                  }}
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
            )}
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

function isAppointmentFromTodayOn(appointment: AppointmentPreviewItem) {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  return appointment.sortTime !== Number.MAX_SAFE_INTEGER && appointment.sortTime >= startOfToday
}

function getPropertyDisplayName(property?: Property | null) {
  if (!property) return ''
  return property.title || property.address || property.city || property.id || property._id || 'Propiedad'
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

function getUrlHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return 'invalid-url'
  }
}

function getUrlPath(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return 'invalid-url'
  }
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

function AppointmentRow({ item }: { item: AppointmentPreviewItem }) {
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
      <ChevronRight size={16} color="#cbb375" />
    </View>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('')
  return initials || 'CO'
}

function formatCurrentDashboardDate() {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
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

function getPickerDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

type CalendarPickerMode = 'date' | 'time'

function CalendarPick({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const date = getPickerDate(value)
  const [pickerMode, setPickerMode] = useState<CalendarPickerMode | null>(null)

  const handlePickerChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate || !pickerMode) {
      setPickerMode(null)
      return
    }

    const nextDate = getPickerDate(value)
    if (pickerMode === 'date') {
      nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    } else {
      nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0)
    }

    setPickerMode(null)
    onChange(nextDate.toISOString())
  }

  return (
    <View style={styles.calendarPicker}>
      <Text style={styles.calendarPickerValue}>{date.toLocaleString()}</Text>
      <View style={styles.calendarPickerActions}>
        <TouchableOpacity style={styles.calendarPickerButton} onPress={() => setPickerMode('date')} activeOpacity={0.85}>
          <Text style={styles.calendarPickerButtonText}>Escoger fecha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.calendarPickerButton} onPress={() => setPickerMode('time')} activeOpacity={0.85}>
          <Text style={styles.calendarPickerButtonText}>Escoger hora</Text>
        </TouchableOpacity>
      </View>
      {pickerMode ? (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  )
}
