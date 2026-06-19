import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './coordinator-rent-user.styles'
import { CoordinatorBottomNav } from '@/components/coordinator/CoordinatorBottomNav'
import { usePathname, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  disconnectGoogleCalendar,
  createGoogleCalendarDate,
  deleteGoogleCalendarDate,
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
  Eye,
  FilePlus2,
  Info,
  LogOut,
  PieChart,
  Search,
  StopCircle,
  Trash2,
  UserRound,
} from 'lucide-react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
WebBrowser.maybeCompleteAuthSession()

const priorities = [
  { value: '5', label: 'Apartados\nEn cierre' },
  { value: '3', label: 'Mensajes sin\nresponder' },
  { value: '2', label: 'Propiedades\nen edicion' },
  { value: '1', label: 'Incidencia \nurgente' },
  { value: '3', label: 'Campanas\nfinalizaron' },
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

const leadAlerts = [
  '7 leads sin movimiento en 3 dias',
  '3 con proximo contacto vencido',
  '4 sin siguiente accion definida',
]

const focusedAdvisors = [
  ['Jorge Sanchez', '16 leads', '6 atrasados'],
  ['Citlalli Tapia', '13 leads', '1 atrasado'],
  ['Carlos Trujeque', '11 leads', '2 pendientes'],
]

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

  const handleTestConnectionStatus = async () => {
    if (!authToken || isTestingCalendarAction) return

    setIsTestingCalendarAction(true)
    try {
      const status = await getGoogleCalendarConnectionStatus(authToken)
      setGoogleConnectionStatus(status)
      Alert.alert(
        'Estado Google',
        `Estado: ${status.status}\nCalendarios activos: ${status.enabledCalendarsCount}`,
      )
    } catch (error) {
      console.warn('No se pudo consultar el estado de Google:', error)
      Alert.alert('Error', 'No se pudo consultar el estado de Google.')
    } finally {
      setIsTestingCalendarAction(false)
    }
  }

  const handleTestSyncAndReload = async () => {
    if (!authToken || isTestingCalendarAction) return

    setIsTestingCalendarAction(true)
    try {
      const result = await syncGoogleCalendars(authToken)
      await loadCalendarDates()
      Alert.alert(
        'Sync finalizado',
        `Creadas: ${result.created}\nActualizadas: ${result.updated}\nConflictos: ${result.conflicts}\nOmitidas: ${result.skipped}`,
      )
    } catch (error) {
      console.warn('No se pudo sincronizar Google Calendar:', error)
      Alert.alert('Error', 'No se pudo sincronizar Google Calendar.')
    } finally {
      setIsTestingCalendarAction(false)
    }
  }

  const handleTestLoadMongoDates = async () => {
    if (!authToken || isTestingCalendarAction) return

    setIsTestingCalendarAction(true)
    try {
      await loadCalendarDates()
      Alert.alert('Citas recargadas', 'Se volvieron a cargar las citas desde Mongo.')
    } catch (error) {
      console.warn('No se pudieron recargar citas:', error)
      Alert.alert('Error', 'No se pudieron recargar las citas.')
    } finally {
      setIsTestingCalendarAction(false)
    }
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
      Alert.alert('Cita creada', 'La cita se creo en Google y se guardo en Mongo.')
    } catch (error) {
      console.warn('No se pudo crear la cita de prueba:', error)
      Alert.alert('Error', 'No se pudo crear la cita de prueba.')
    } finally {
      setIsTestingCalendarAction(false)
    }
  }

  const handleLogout = () => {
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topChrome}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
            <ChevronLeft size={22} color="#19191f" />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <View style={styles.datePill}>
              <CalendarDays size={14} color="#19191f" />
              <Text style={styles.dateText}>13 de junio, 2026</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
              <LogOut size={16} color="#ffffff" />
              <Text style={styles.logoutButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.brand}>INICIO</Text>
        <Text style={styles.brandSmall}>REAL ESTATE</Text>

        <TouchableOpacity
          style={styles.propertiesListButton}
          onPress={() => router.push('/coordinator-properties-list' as never)}
          activeOpacity={0.85}
        >
          <Building2 size={19} color="#3d5a40" />
          <Text style={styles.propertiesListButtonText}>Ver listado de propiedades</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.overline}>Coordinacion de Rentas</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.greeting}>Hola, Alexa Diaz</Text>
              <Text style={styles.helper}>Aqui esta lo importante de hoy</Text>
            </View>
          </View>
          <Bell style={styles.headerBell} size={20} color="#19191f" fill="#19191f" />
        </View>

        <View style={styles.heroCards}>
          <View style={styles.propertiesCard}>
            <Text style={styles.metricOverline}>PROPIEDADES</Text>
            <Text style={styles.propertiesValue}>{rentSummary.propertyCount}</Text>
            <Text style={styles.metricOverline}>DISPONIBLES</Text>
          </View>
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
          {isGoogleConnected ? (
            <View style={styles.calendarTestPanel}>
              <Text style={styles.calendarTestTitle}>Pruebas de integracion</Text>
              <Text style={styles.calendarTestMeta}>
                Estado: {googleConnectionStatus?.status ?? 'sin consultar'} · Activos: {googleConnectionStatus?.enabledCalendarsCount ?? 0}
              </Text>
              <Text style={styles.calendarTestLabel}>Calendario destino</Text>
              {enabledSelectedCalendars.length === 0 ? (
                <Text style={styles.calendarSettingsEmpty}>
                  Activa y guarda al menos un calendario antes de crear citas.
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
              <View style={styles.calendarTestActions}>
                <TouchableOpacity
                  style={styles.calendarTestButton}
                  onPress={handleTestConnectionStatus}
                  activeOpacity={0.85}
                  disabled={isTestingCalendarAction}
                >
                  <Text style={styles.calendarTestButtonText}>Estado</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calendarTestButton}
                  onPress={handleTestSyncAndReload}
                  activeOpacity={0.85}
                  disabled={isTestingCalendarAction}
                >
                  <Text style={styles.calendarTestButtonText}>Sync</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calendarTestButton}
                  onPress={handleTestLoadMongoDates}
                  activeOpacity={0.85}
                  disabled={isTestingCalendarAction}
                >
                  <Text style={styles.calendarTestButtonText}>Mongo</Text>
                </TouchableOpacity>
              </View>
              <Text>Titulo de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.title}
                onChangeText={value => updateTestAppointmentForm('title', value)}
                placeholder="Titulo"
                placeholderTextColor="#8d8d8d"
              />
              <Text>Ubicacion de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.location ?? ''}
                onChangeText={value => updateTestAppointmentForm('location', value)}
                placeholder="Ubicacion"
                placeholderTextColor="#8d8d8d"
              />
              <Text>Descripcion de la cita</Text>
              <TextInput 
                style={styles.calendarTestInput}
                value={testAppointmentForm.description ?? ''}
                onChangeText={value => updateTestAppointmentForm('description', value)}
                placeholder='descripcion'
                placeholderTextColor="#8d8d8d"
              />
              <Text>Fecha de la cita</Text>
              <CalendarPick
                value={testAppointmentForm.startDateTime}
                onChange={value => updateTestAppointmentForm('startDateTime', value)}
              />
              <Text>Fecha de terminacion</Text>
              <CalendarPick
                value={testAppointmentForm.endDateTime}
                onChange={value => updateTestAppointmentForm('endDateTime', value)}
              />
              <Text>Calendario</Text>
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
                  {isTestingCalendarAction ? 'Procesando...' : 'Crear cita de prueba'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity style={styles.centerButton} activeOpacity={0.85}>
            <CalendarDays size={23} color="#3d5a40" />
            <Text style={styles.centerButtonText}>Agendar cita </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <SectionHeader title="Seguimientos" action="Ver mas " compact />
          <Text style={styles.panelSubtitle}>Panorama general de actividad de leads</Text>

          <View style={styles.followGrid}>
            <StatTile icon={<PieChart size={22} color="#cbb375" />} value="777" label="Leads activos " />
            <StatTile icon={<Clock3 size={22} color="#cbb375" />} value="17" label="Seguimientos pendientes" />
            <StatTile icon={<Info size={22} color="#ff6666" />} value="5" label="Atrasados" />
            <StatTile icon={<CalendarDays size={22} color="#cbb375" />} value="3" label="Proximos hoy" />
          </View>

          <Text style={styles.subSectionTitle}>Vista rapida</Text>
          <View style={styles.funnelRow}>
            {[
              ['77', 'Nuevos'],
              ['34', 'En seguimiento'],
              ['8', 'Por cerrar'],
              ['7', 'Ganados'],
              ['3', 'Perdidos'],
            ].map(([value, label]) => (
              <View key={label} style={styles.funnelItem}>
                <Text style={styles.funnelValue}>{value}</Text>
                <Text style={styles.funnelLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {leadAlerts.map((alert, index) => (
            <View key={alert} style={styles.alertRow}>
              {index === 0 ? <Bell size={18} color="#ff6666" /> : index === 1 ? <Clock3 size={18} color="#ff6666" /> : <FilePlus2 size={18} color="#ff6666" />}
              <Text style={styles.alertText}>{alert}</Text>
              <ChevronRight size={17} color="#3d5a40" />
            </View>
          ))}

          <View style={styles.focusBox}>
            <Text style={styles.subSectionTitle}>Asesores con foco</Text>
            {focusedAdvisors.map((item, index) => (
              <View key={item[0]} style={[styles.focusRow, index < focusedAdvisors.length - 1 && styles.focusDivider]}>
                <Text style={styles.focusName}>{item[0]}</Text>
                <UserRound size={18} color="#0c6740" />
                <Text style={styles.focusMetric}>{item[1]}</Text>
                <View style={styles.alertDot} />
                <Text style={styles.focusLate}>{item[2]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailButtons}>
            <MiniButton icon={<Eye size={20} color="#0c6740" />} label="Ver detalle " />
            <MiniButton icon={<Search size={20} color="#ffffff" />} label="Ver por asesor " variant="primary" />
          </View>
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

      <CoordinatorBottomNav />
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

function MiniButton({ icon, label, variant }: { icon: ReactNode; label: string; variant?: 'primary' }) {
  return (
    <TouchableOpacity style={[styles.miniButton, variant === 'primary' && styles.miniButtonPrimary]} activeOpacity={0.85}>
      {icon}
      <Text style={[styles.miniButtonText, variant === 'primary' && styles.miniButtonTextPrimary]}>{label}</Text>
    </TouchableOpacity>
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
