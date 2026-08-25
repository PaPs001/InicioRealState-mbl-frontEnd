import {useCallback, useEffect, useMemo, useState} from 'react'
import {Alert} from 'react-native'

import {getAppointmentEndDateTime, getDefaultAppointmentStartDateTime} from '@/components/userDashboard/dashboard-formatters'
import {useSessionDomain} from '@/contexts/auth/use-session-domain'
import {createGoogleCalendarDate, type CreateGoogleCalendarDatePayload, type SelectedGoogleCalendar} from '@/lib/api'
import type {Property, PropertyLead} from '@/lib/types'
import type {AppCapabilities} from '@/modules/settings'
import {useCalendarData} from '@/modules/users/date/context/CalendarDataContext'
import {useDashboardCalendar} from './userDashboardCalendar'
import {useDashboardLeads} from './userDashboardLeads'
import {useDashboardProperties} from './userDashboardProperties'

type Params = {
  capabilities?: AppCapabilities
  helpedBy?: string
  initialLead?: PropertyLead
  initialProperty?: Property
  onClose: () => void
  onCreated?: () => void
  returnPath?: string
  visible: boolean
}

export function useAppointmentCreateFlow({capabilities, helpedBy, initialLead, initialProperty, onClose, onCreated, returnPath, visible}: Params) {
  const {authToken, currentUser} = useSessionDomain()
  const {addAppointment} = useCalendarData()
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [form, setForm] = useState<CreateGoogleCalendarDatePayload>(() => createInitialForm(currentUser?.id, helpedBy))
  const {appointmentLeadOptions, isLeadsLoading, loadLeads} = useDashboardLeads({authToken})
  const properties = useDashboardProperties(form.appointmentType)
  const calendar = useDashboardCalendar({authToken, capabilities, returnPath})

  const selectedAppointmentLead = useMemo(
    () => appointmentLeadOptions.find((lead) => lead.id === form.leadId) || (initialLead?.id === form.leadId ? initialLead : undefined),
    [appointmentLeadOptions, form.leadId, initialLead],
  )
  const selectedAppointmentProperty = useMemo(
    () => properties.filteredAppointmentPropertyOptions.find((property) => getPropertyId(property) === form.propertyId)
      || (getPropertyId(initialProperty) === form.propertyId ? initialProperty : undefined),
    [form.propertyId, initialProperty, properties.filteredAppointmentPropertyOptions],
  )

  useEffect(() => {
    if (!visible) return
    const initialPropertyId = getPropertyId(initialProperty) || initialLead?.propertyId || null
    setForm((current) => ({
      ...createInitialForm(currentUser?.id, helpedBy),
      appointmentType: getInitialAppointmentType(initialLead, initialProperty) || current.appointmentType,
      leadId: initialLead?.id || null,
      propertyId: initialPropertyId,
      advisorId: initialLead?.advisorId || initialLead?.agentId || currentUser?.id || null,
    }))
    calendar.changeAppointmentLeadMode('existing')
    calendar.setAppointmentSelectionScreen(null)
    void calendar.loadGoogleCalendarSettings()
  }, [visible, initialLead?.id, initialLead?.propertyId, initialProperty, currentUser?.id, helpedBy])

  const updateForm = useCallback((field: keyof CreateGoogleCalendarDatePayload, value: string) => {
    setForm((current) => ({...current, [field]: value}))
  }, [])
  const selectCalendar = useCallback((selected: SelectedGoogleCalendar) => {
    setForm((current) => ({...current, calendarId: selected.calendarId, appointmentType: selected.appointmentType ?? current.appointmentType, colorId: selected.colorId ?? current.colorId}))
  }, [])
  const selectLead = useCallback((lead: PropertyLead) => {
    setForm((current) => ({...current, leadId: lead.id, propertyId: lead.propertyId || current.propertyId, advisorId: lead.advisorId || lead.agentId || currentUser?.id || null}))
    calendar.setAppointmentSelectionScreen(null)
  }, [calendar.setAppointmentSelectionScreen, currentUser?.id])
  const selectProperty = useCallback((property: Property) => {
    const propertyId = getPropertyId(property)
    if (!propertyId) return
    setForm((current) => ({...current, propertyId}))
    calendar.setAppointmentSelectionScreen(null)
  }, [calendar.setAppointmentSelectionScreen])
  const changeLeadMode = useCallback((mode: 'existing' | 'provisional') => {
    calendar.changeAppointmentLeadMode(mode)
    if (mode === 'provisional') setForm((current) => ({...current, leadId: null}))
  }, [calendar.changeAppointmentLeadMode])

  const createAppointment = useCallback(async () => {
    if (!authToken || isCreatingAppointment) return
    const appointmentType = form.appointmentType?.trim().toLowerCase() || 'general'
    const isGeneral = appointmentType === 'general'
    if (!form.title.trim() || !form.startDateTime.trim()) return Alert.alert('Faltan datos', 'Titulo e inicio son obligatorios.')
    if (!isGeneral && calendar.appointmentLeadMode === 'existing' && !form.leadId) return Alert.alert('Falta lead', 'Selecciona el lead al que se le agendara la cita.')
    if (!isGeneral && calendar.appointmentLeadMode === 'provisional' && !calendar.provisionalAppointmentLead.fullName.trim()) return Alert.alert('Falta nombre', 'Escribe el nombre del lead provisional para crear la cita.')
    const canResolveCalendarByType = ['renta', 'venta'].includes(appointmentType) && calendar.enabledSelectedCalendars.some((item) => item.appointmentType?.trim().toLowerCase() === appointmentType)
    if (!form.calendarId && !canResolveCalendarByType) return Alert.alert('Falta calendario', 'Selecciona o configura el calendario donde quieres crear la cita.')

    setIsCreatingAppointment(true)
    try {
      const base = {...form, leadId: isGeneral ? null : form.leadId, propertyId: isGeneral ? null : form.propertyId, endDateTime: getAppointmentEndDateTime(form.startDateTime), advisorId: form.advisorId || currentUser?.id || null, helpedBy: form.helpedBy || helpedBy || currentUser?.name || ''}
      const payload: CreateGoogleCalendarDatePayload = !isGeneral && calendar.appointmentLeadMode === 'provisional'
        ? {...base, leadId: null, lead: {fullName: calendar.provisionalAppointmentLead.fullName.trim(), phone: calendar.provisionalAppointmentLead.phone.trim() || null, email: calendar.provisionalAppointmentLead.email.trim() || null}}
        : {...base, lead: null}
      const response = await createGoogleCalendarDate(authToken, payload)
      addAppointment(response.date)
      Alert.alert('Cita creada', response.leadResolution.duplicateWarning ? 'La cita se creo correctamente. Encontramos posibles leads existentes con ese telefono o correo.' : 'La cita se creo correctamente.')
      onCreated?.()
      onClose()
      void Promise.all([
        calendar.loadGoogleCalendarAppointments({sync: true}),
        loadLeads(),
      ]).catch(error => {
        console.warn('La cita se creo, pero no se pudo refrescar la informacion:', error)
      })
    } catch (error) {
      console.warn('No se pudo crear la cita:', error)
      Alert.alert('Error', 'No se pudo crear la cita.')
    } finally {
      setIsCreatingAppointment(false)
    }
  }, [addAppointment, authToken, calendar, currentUser?.id, currentUser?.name, form, helpedBy, isCreatingAppointment, loadLeads, onClose, onCreated])

  return {
    calendar,
    modalProps: {
      appointmentLeadMode: calendar.appointmentLeadMode,
      appointmentLeadOptions,
      appointmentPropertyOptions: properties.filteredAppointmentPropertyOptions,
      enabledSelectedCalendars: calendar.enabledSelectedCalendars,
      isCatalogLoading: properties.isCatalogLoading,
      isCreatingAppointment,
      isGoogleConnected: calendar.isGoogleConnected && !calendar.needsGoogleReconnect,
      needsGoogleReconnect: calendar.needsGoogleReconnect,
      isLeadsLoading,
      onClose,
      onCreateAppointment: createAppointment,
      onLeadModeChange: changeLeadMode,
      onSelectCalendar: selectCalendar,
      onSelectLead: selectLead,
      onSelectProperty: selectProperty,
      onSelectionScreenChange: calendar.setAppointmentSelectionScreen,
      onUpdateProvisionalLead: calendar.updateProvisionalAppointmentLead,
      onUpdateForm: updateForm,
      provisionalLead: calendar.provisionalAppointmentLead,
      selectedAppointmentLead,
      selectedAppointmentProperty,
      selectionScreen: calendar.appointmentSelectionScreen,
      testAppointmentForm: form,
      visible,
    },
    properties,
  }
}

function createInitialForm(advisorId?: string, helpedBy?: string): CreateGoogleCalendarDatePayload {
  const startDateTime = getDefaultAppointmentStartDateTime()
  return {title: '', startDateTime, endDateTime: getAppointmentEndDateTime(startDateTime), timeZone: 'America/Mexico_City', helpedBy: helpedBy || '', advisorId: advisorId || null}
}

function getPropertyId(property?: Property) {
  return property?.id || property?._id || undefined
}

function getInitialAppointmentType(initialLead?: PropertyLead, initialProperty?: Property) {
  if (initialLead?.searchIntent === 'rent') return 'renta'
  if (initialLead?.searchIntent === 'sale') return 'venta'
  if (
    initialProperty?.listingType === 'rent' ||
    initialProperty?.status === 'for_rent' ||
    initialProperty?.status === 'pending_rent' ||
    initialProperty?.monthlyRent
  ) return 'renta'
  if (
    initialProperty?.listingType === 'sale' ||
    initialProperty?.status === 'for_sale' ||
    initialProperty?.status === 'pending_sale'
  ) return 'venta'
  return undefined
}
