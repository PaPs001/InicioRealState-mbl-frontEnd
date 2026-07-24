import { useState } from 'react'
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native'

import type { CreateGoogleCalendarDatePayload, SelectedGoogleCalendar } from '@/lib/api'
import type { Property, PropertyLead } from '@/lib/types'

import { getAppointmentEndDateTime, getPropertyDisplayName } from './dashboard-formatters'
import { styles } from './UserDashboardScreen.styles'

type AppointmentCreateModalProps = {
  appointmentLeadOptions: PropertyLead[]
  appointmentPropertyOptions: Property[]
  enabledSelectedCalendars: SelectedGoogleCalendar[]
  isCatalogLoading: boolean
  isCreatingAppointment: boolean
  isGoogleConnected: boolean
  isLeadsLoading: boolean
  onClose: () => void
  onCreateAppointment: () => void
  onSelectCalendar: (calendar: SelectedGoogleCalendar) => void
  onSelectLead: (lead: PropertyLead) => void
  onSelectProperty: (property: Property) => void
  onSelectionScreenChange: (screen: 'lead' | 'property' | null) => void
  onUpdateForm: (field: keyof CreateGoogleCalendarDatePayload, value: string) => void
  selectedAppointmentLead?: PropertyLead
  selectedAppointmentProperty?: Property
  selectionScreen: 'lead' | 'property' | null
  testAppointmentForm: CreateGoogleCalendarDatePayload
  visible: boolean
}

export function AppointmentCreateModal({
  appointmentLeadOptions,
  appointmentPropertyOptions,
  enabledSelectedCalendars,
  isCatalogLoading,
  isCreatingAppointment,
  isGoogleConnected,
  isLeadsLoading,
  onClose,
  onCreateAppointment,
  onSelectCalendar,
  onSelectLead,
  onSelectProperty,
  onSelectionScreenChange,
  onUpdateForm,
  selectedAppointmentLead,
  selectedAppointmentProperty,
  selectionScreen,
  testAppointmentForm,
  visible,
}: AppointmentCreateModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.appointmentModalOverlay}>
        <View style={styles.appointmentModalPanel}>
          <View style={styles.appointmentModalHeader}>
            {selectionScreen ? (
              <TouchableOpacity
                style={styles.appointmentModalBack}
                onPress={() => onSelectionScreenChange(null)}
                activeOpacity={0.85}
              >
                <ChevronLeft size={18} color="#3d5a40" />
              </TouchableOpacity>
            ) : null}
            <Text style={styles.appointmentModalTitle}>
              {selectionScreen === 'lead'
                ? 'Seleccionar lead'
                : selectionScreen === 'property'
                  ? 'Seleccionar propiedad'
                  : 'Agregar cita'}
            </Text>
            <TouchableOpacity style={styles.appointmentModalClose} onPress={onClose} activeOpacity={0.85}>
              <X size={18} color="#3d5a40" />
            </TouchableOpacity>
          </View>

          {selectionScreen === 'lead' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.appointmentModalContent}>
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
              )}

              <Text style={styles.calendarTestLabel}>Lead relacionado</Text>
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

              <Text style={styles.calendarTestLabel}>Propiedad relacionada</Text>
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

              <Text style={styles.calendarTestLabel}>Titulo de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.title}
                onChangeText={value => onUpdateForm('title', value)}
                placeholder="Titulo"
                placeholderTextColor="#8d8d8d"
              />
              <Text style={styles.calendarTestLabel}>Ubicacion de la cita</Text>
              <TextInput
                style={styles.calendarTestInput}
                value={testAppointmentForm.location ?? ''}
                onChangeText={value => onUpdateForm('location', value)}
                placeholder="Ubicacion"
                placeholderTextColor="#8d8d8d"
              />
              <Text style={styles.calendarTestLabel}>Fecha de la cita</Text>
              <CalendarPick
                value={testAppointmentForm.startDateTime}
                onChange={value => {
                  onUpdateForm('startDateTime', value)
                  onUpdateForm('endDateTime', getAppointmentEndDateTime(value))
                }}
              />
              <TouchableOpacity
                style={styles.calendarTestCreateButton}
                onPress={onCreateAppointment}
                activeOpacity={0.85}
                disabled={isCreatingAppointment}
              >
                <Text style={styles.calendarTestCreateButtonText}>
                  {isCreatingAppointment ? 'Procesando...' : 'Crear cita'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
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

function getPickerDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}
