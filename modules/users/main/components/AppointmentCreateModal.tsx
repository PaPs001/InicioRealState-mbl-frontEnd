import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import type { CreateGoogleCalendarDatePayload, SelectedGoogleCalendar } from '@/lib/api'
import type { Property, PropertyLead } from '@/lib/types'

import { FilterChip } from '@/components/FilterChip'
import { getAppointmentEndDateTime, getPropertyDisplayName } from '@/components/userDashboard/dashboard-formatters'
import { styles } from './styles/appointmentCreateModal.style'
import { generalColors } from '@/theme'
import { AppointmentDateTimePicker } from './AppointmentDateTimePicker'
import { useState } from 'react'
import { AppModal } from '@/components/AppModal'

type AppointmentType = 'renta' | 'venta' | 'general'

const appointmentColors: Record<AppointmentType, string> = {
  renta: generalColors.rentColor,
  venta: generalColors.saleColor,
  general: generalColors.general,
}

type AppointmentCreateModalProps = {
  appointmentLeadMode: 'existing' | 'provisional'
  appointmentLeadOptions: PropertyLead[]
  appointmentPropertyOptions: Property[]
  enabledSelectedCalendars: SelectedGoogleCalendar[]
  isCatalogLoading: boolean
  isCreatingAppointment: boolean
  isGoogleConnected: boolean
  needsGoogleReconnect?: boolean
  isLeadsLoading: boolean
  onClose: () => void
  onCreateAppointment: () => void
  onLeadModeChange: (mode: 'existing' | 'provisional') => void
  onSelectCalendar: (calendar: SelectedGoogleCalendar) => void
  onSelectLead: (lead: PropertyLead) => void
  onSelectProperty: (property: Property) => void
  onSelectionScreenChange: (screen: 'lead' | 'property' | null) => void
  onUpdateProvisionalLead: (field: 'fullName' | 'phone' | 'email', value: string) => void
  onUpdateForm: (field: keyof CreateGoogleCalendarDatePayload, value: string) => void
  provisionalLead: {
    fullName: string
    phone: string
    email: string
  }
  selectedAppointmentLead?: PropertyLead
  selectedAppointmentProperty?: Property
  selectionScreen: 'lead' | 'property' | null
  testAppointmentForm: CreateGoogleCalendarDatePayload
  visible: boolean
}

export function AppointmentCreateModal({
  appointmentLeadMode,
  appointmentLeadOptions,
  appointmentPropertyOptions,
  enabledSelectedCalendars,
  isCatalogLoading,
  isCreatingAppointment,
  isGoogleConnected,
  needsGoogleReconnect = false,
  isLeadsLoading,
  onClose,
  onCreateAppointment,
  onLeadModeChange,
  onSelectCalendar,
  onSelectLead,
  onSelectProperty,
  onSelectionScreenChange,
  onUpdateProvisionalLead,
  onUpdateForm,
  provisionalLead,
  selectedAppointmentLead,
  selectedAppointmentProperty,
  selectionScreen,
  testAppointmentForm,
  visible,
}: AppointmentCreateModalProps) {
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false)
  const [hasConfirmedDateTime, setHasConfirmedDateTime] = useState(false)
  const [descriptionInputHeight, setDescriptionInputHeight] = useState(80)
  const normalizedAppointmentType = (testAppointmentForm.appointmentType || 'general').toLowerCase()
  const selectedAppointmentType: AppointmentType =
    normalizedAppointmentType === 'renta' || normalizedAppointmentType === 'venta'
      ? normalizedAppointmentType
      : 'general'
  const isGeneralAppointment = selectedAppointmentType === 'general'

  const activeColor = appointmentColors[selectedAppointmentType]

  const modalTitle =
    selectionScreen === 'lead'
      ? 'Seleccionar lead'
      : selectionScreen === 'property'
        ? 'Seleccionar propiedad'
        : 'Crear cita'
  const selectedTypeCalendar = enabledSelectedCalendars.find(
    calendar => (calendar.appointmentType || '').toLowerCase() === selectedAppointmentType,
  )
  const generalCalendars = enabledSelectedCalendars.filter(
    calendar => (calendar.appointmentType || 'general').toLowerCase() === 'general',
  )
  const selectedCalendar = generalCalendars.find(
    calendar => calendar.calendarId === testAppointmentForm.calendarId,
  )
  const typeCalendar = selectedAppointmentType === 'general' ? selectedCalendar : selectedTypeCalendar
  const shouldSelectCalendarManually = selectedAppointmentType === 'general'

  const selectAppointmentType = (appointmentType: 'renta' | 'venta' | 'general') => {
    if (appointmentType === selectedAppointmentType) {
      return
    }

    onUpdateForm('appointmentType', appointmentType)
    onUpdateForm('leadId', '')
    onUpdateForm('propertyId', '')
    onSelectionScreenChange(null)

    if (appointmentType === 'general') {
      onUpdateForm('calendarId', '')
      return
    }

    const calendarForType = enabledSelectedCalendars.find(
      calendar => (calendar.appointmentType || '').toLowerCase() === appointmentType,
    )

    if (calendarForType) {
      onSelectCalendar(calendarForType)
    } else {
      onUpdateForm('calendarId', '')
    }
  }

  return (
    <AppModal
      visible={visible}
      title={modalTitle}
      subtitle={
        selectionScreen
          ? undefined
          : 'Completa la información para agendar una nueva cita'
      }
      onClose={onClose}
      onBack={
        selectionScreen
          ? () => onSelectionScreenChange(null)
          : undefined
      }
      showCloseButton={!selectionScreen}
      accentColor={activeColor}
      animationType="slide"
      position="bottom"
      size="large"
      keyboardAvoiding
      closeDisabled={isCreatingAppointment}
      closeOnBackdropPress={!isCreatingAppointment}
      footer={
        !selectionScreen ? (
          <View style={styles.calendarButtonsSection}>
            <TouchableOpacity
              style={styles.calendarCloseTab}
              onPress={onClose}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarExitButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.calendarTestCreateButton,
                { backgroundColor: activeColor },
              ]}
              onPress={onCreateAppointment}
              activeOpacity={0.85}
              disabled={isCreatingAppointment}
            >
              <Text style={styles.calendarCreateButtonText}>
                {isCreatingAppointment
                  ? 'Procesando...'
                  : 'Crear cita'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    >
      {selectionScreen === 'lead' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.appointmentModalContent}
            >
              {isLeadsLoading ? (
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
                        onPress={() => onSelectLead(lead)}
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
          ) : selectionScreen === 'property' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.appointmentModalContent}
            >
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
                        onPress={() => onSelectProperty(property)}
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
            <KeyboardAwareScrollView
              enableOnAndroid
              extraScrollHeight={24}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.appointmentModalContent}
            >
              <View>
                <Text style={styles.calendarLabel}>Tipo de cita</Text>
                <View style={styles.appointmentModeRow}>
                  <FilterChip
                    label="Cita Renta"
                    active={selectedAppointmentType === 'renta'}
                    activeColor={generalColors.rentColor}
                    onPress={() => selectAppointmentType('renta')}
                  />
                  <FilterChip
                    label="Cita Venta"
                    active={selectedAppointmentType === 'venta'}
                    activeColor={generalColors.saleColor}
                    onPress={() => selectAppointmentType('venta')}
                  />
                  <FilterChip
                    label="Cita"
                    active={selectedAppointmentType === 'general'}
                    activeColor={generalColors.general}
                    onPress={() => selectAppointmentType('general')}
                  />
                </View>
              </View>
              <Text style={styles.calendarLabel}>Calendario donde se guarda la cita</Text>
              {enabledSelectedCalendars.length === 0 ? (
                <Text style={styles.calendarSettingsEmpty}>
                  {needsGoogleReconnect
                    ? 'Reconecta Google Calendar desde configuracion antes de crear citas.'
                    : isGoogleConnected
                    ? 'Activa y guarda al menos un calendario antes de crear citas.'
                    : 'Conecta Google Calendar desde configuracion antes de crear citas.'}
                </Text>
              ) : shouldSelectCalendarManually && generalCalendars.length === 0 ? (
                <Text style={styles.calendarSettingsEmpty}>
                  Configura un calendario general antes de crear esta cita.
                </Text>
              ) : shouldSelectCalendarManually ? (
                <View style={styles.calendarDestinationList}>
                  {generalCalendars.map(calendar => {
                    const isSelected = testAppointmentForm.calendarId === calendar.calendarId

                    return (
                      <TouchableOpacity
                        key={calendar.calendarId}
                        style={[styles.calendarDestinationChip, isSelected && styles.calendarDestinationChipActive]}
                        onPress={() => onSelectCalendar(calendar)}
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
              ) : typeCalendar ? (
                <View style={styles.calendarSelectedNotice}>
                  <Text style={styles.calendarSelectedNoticeTitle} numberOfLines={1}>
                    {typeCalendar.summary || 'Calendario seleccionado'}
                  </Text>
                  <Text style={styles.calendarSelectedNoticeMeta} numberOfLines={1}>
                    Se usara para citas de {selectedAppointmentType}
                  </Text>
                </View>
              ) : (
                <Text style={styles.calendarSettingsEmpty}>
                  Configura un calendario para citas de {selectedAppointmentType} antes de crear esta cita.
                </Text>
              )}
              <View>
                <Text style={styles.calendarLabel}>Titulo de la cita</Text>
                <TextInput
                  style={styles.calendarTestInput}
                  onChangeText={value => onUpdateForm('title', value)}
                  placeholder="Titulo de la cita"
                  placeholderTextColor="#8d8d8d"
                />
              </View>
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarLabel}>Fecha y Hora de la cita</Text>
                <Pressable 
                  style={[styles.calendarButton, {backgroundColor: activeColor}]}
                  onPress={() => setIsDateTimePickerVisible(true)}
                >
                  <Text style={styles.calendarButtonText}>Escoger fecha y hora</Text>
                </Pressable>
                {hasConfirmedDateTime ? (
                  <Text style={styles.selectedDateTimeText}>
                    {formatAppointmentDateTime(testAppointmentForm.startDateTime)}
                  </Text>
                ) : null}
                {isDateTimePickerVisible ? (
                  <AppointmentDateTimePicker
                    visible={isDateTimePickerVisible}
                    onClose={() => setIsDateTimePickerVisible(false)}
                    value={testAppointmentForm.startDateTime}
                    onChange={value => {
                      onUpdateForm('startDateTime', value)
                      onUpdateForm('endDateTime', getAppointmentEndDateTime(value))
                      setHasConfirmedDateTime(true)
                    }}
                  />
                ): null}
              </View>
              <View>
                <Text style={styles.calendarLabel}>Ubicacion de la cita</Text>
                <TextInput
                  style={styles.calendarTestInput}
                  //value={testAppointmentForm.location ?? ''}
                  onChangeText={value => onUpdateForm('location', value)}
                  placeholder="Ubicacion de encuentro con el cliente"
                  placeholderTextColor="#8d8d8d"
                />
              </View>
              {isGeneralAppointment ? (
                <View>
                  <Text style={styles.calendarLabel}>Descripcion de la cita</Text>
                  <TextInput
                    style={[
                      styles.calendarTestInput,
                      styles.descriptionInput,
                      { height: descriptionInputHeight },
                    ]}
                    //value={testAppointmentForm.description ?? ''}
                    onChangeText={value => onUpdateForm('description', value)}
                    onContentSizeChange={event => {
                      setDescriptionInputHeight(Math.max(80, event.nativeEvent.contentSize.height))
                    }}
                    placeholder="Descripcion"
                    placeholderTextColor="#8d8d8d"
                    multiline
                    scrollEnabled={false}
                    textAlignVertical="top"
                  />
                </View>
              ) : (
                <>
                  <View style={styles.relatedLeadSection}>
                    <Text style={styles.calendarLabel}>Lead relacionado</Text>
                    <View style={styles.appointmentModeRow}>
                      <FilterChip
                        label="Lead Existente"
                        active={appointmentLeadMode === 'existing'}
                        activeColor={activeColor}
                        onPress={() => onLeadModeChange('existing')}
                      />
                      <FilterChip
                        label="Cliente sin registrar"
                        active={appointmentLeadMode === 'provisional'}
                        activeColor={activeColor}
                        onPress={() => onLeadModeChange('provisional')}
                      />
                    </View>

                    {appointmentLeadMode === 'existing' ? (
                      <TouchableOpacity
                        style={styles.appointmentPickerButton}
                        onPress={() => onSelectionScreenChange('lead')}
                        activeOpacity={0.85}
                      >
                        <View style={styles.appointmentPickerCopy}>
                          <Text style={styles.appointmentPickerTitle} numberOfLines={1}>
                            {selectedAppointmentLead?.name || 'Escoger lead'}
                          </Text>
                          <Text style={styles.appointmentPickerMeta} numberOfLines={1}>
                            {isLeadsLoading
                              ? 'Cargando leads...'
                              : selectedAppointmentLead
                                ? selectedAppointmentLead.phone || selectedAppointmentLead.status
                                : `${appointmentLeadOptions.length} leads disponibles`}
                          </Text>
                        </View>
                        <ChevronRight size={17} color="#3d5a40" />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.appointmentProvisionalFields}>
                        <View style={styles.informationSection}>
                          <Text style={styles.informationText}>Nombre Completo del cliente</Text>
                          <TextInput
                            style={styles.calendarTestInput}
                            value={provisionalLead.fullName}
                            onChangeText={value => onUpdateProvisionalLead('fullName', value)}
                            placeholderTextColor="#8d8d8d"
                          />
                        </View>
                        <View style={styles.informationSection}>
                          <Text style={styles.informationText}>Numero de Telefono (opcional)</Text>
                          <TextInput
                            style={styles.calendarTestInput}
                            value={provisionalLead.phone}
                            onChangeText={value => onUpdateProvisionalLead('phone', value)}
                            placeholderTextColor="#8d8d8d"
                            keyboardType="phone-pad"
                          />
                        </View>
                        <View style={styles.informationSection}>
                          <Text style={styles.informationText}>Cuenta de correo electronico (opcional)</Text>
                          <TextInput
                            style={styles.calendarTestInput}
                            value={provisionalLead.email}
                            onChangeText={value => onUpdateProvisionalLead('email', value)}
                            placeholderTextColor="#8d8d8d"
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.calendarLabel}>Propiedad relacionada (Opcional si es propiedad externa)</Text>
                    <TouchableOpacity
                      style={styles.appointmentPickerButton}
                      onPress={() => onSelectionScreenChange('property')}
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
                  </View>
                </>
              )}
            </KeyboardAwareScrollView>
          )}
    </AppModal>
  )
}

function formatAppointmentDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
