import { Pressable, Text, View } from 'react-native'

import { AppModal } from '@/components/AppModal'
import {
  getCalendarAssignableAppointmentTypeOptions,
  getDefaultAppointmentType,
  getAppointmentTypeConfig,
} from '@/lib/config/appointment-Types'
import type { GoogleCalendarOption, SelectedGoogleCalendar } from '@/lib/api'

import { styles } from './styles/CalendarSection.style'
import { AppointmentType } from '@/lib/api/endpoints/dates'

type CalendarModalProps = {
  visible: boolean
  googleCalendars: GoogleCalendarOption[]
  selectedGoogleCalendars: SelectedGoogleCalendar[]
  isCalendarSettingsLoading: boolean
  isSavingCalendarSelection: boolean
  needsGoogleReconnect: boolean
  onReloadCalendars: () => void | Promise<void>
  onToggleCalendar: (calendar: GoogleCalendarOption) => void
  onSaveCalendarSelection: () => void | Promise<void>
  onClose: () => void
  onAssignCalendarType: (
    calendar: GoogleCalendarOption,
    type: AppointmentType
  ) => void
}

export function CalendarModal({
  visible,
  googleCalendars,
  selectedGoogleCalendars,
  isCalendarSettingsLoading,
  isSavingCalendarSelection,
  needsGoogleReconnect,
  onReloadCalendars,
  onToggleCalendar,
  onSaveCalendarSelection,
  onClose,
  onAssignCalendarType
}: CalendarModalProps) {
  const isBusy = isCalendarSettingsLoading || isSavingCalendarSelection
  const calendarTypeOptions = getCalendarAssignableAppointmentTypeOptions()

  return (
    <AppModal
      visible={visible}
      title="Calendarios disponibles"
      subtitle="Selecciona los calendarios que quieres utilizar"
      onClose={onClose}
      //showCloseButton
      /*containerStyle={{
        height: '50%'
      }}*/
      position="bottom"
      size= "medium"
      animationType="slide"
      scrollable
      closeDisabled={isSavingCalendarSelection}
      closeOnBackdropPress={!isSavingCalendarSelection}
      footerStyle={{paddingBottom: 54}}
      footer={
        <Pressable
          style={styles.calendarActionButton}
          disabled={isBusy}
          onPress={onSaveCalendarSelection}
        >
          <Text style={styles.calendarActionButtonText}>
            {isSavingCalendarSelection ? 'Guardando...' : 'Guardar calendarios'}
          </Text>
        </Pressable>
      }
    >
      <Pressable
        style={styles.calendarSmallButton}
        disabled={isCalendarSettingsLoading}
        onPress={onReloadCalendars}
      >
        <Text style={styles.calendarSmallButtonText}>
          {isCalendarSettingsLoading ? 'Cargando...' : 'Actualizar'}
        </Text>
      </Pressable>

      {needsGoogleReconnect ? (
        <Text style={styles.calendarSettingsEmpty}>
          Google Calendar requiere reconexión para volver a sincronizar.
        </Text>
      ) : googleCalendars.length === 0 ? (
        <Text style={styles.calendarSettingsEmpty}>
          {isCalendarSettingsLoading
            ? 'Buscando calendarios...'
            : 'No hay calendarios disponibles.'}
        </Text>
      ) : (
        <View style={styles.calendarList}>
          {googleCalendars.map(calendar => {
            const selection = selectedGoogleCalendars.find(
              item => item.calendarId === calendar.calendarId,
            )
            const isEnabled = selection?.enabled === true

            return (
              <>
                <View
                  key={calendar.calendarId ?? calendar.summary}
                  style={styles.calendarOptionRow}
                >
                  <Pressable
                    style={[
                      styles.calendarToggle,
                      isEnabled && styles.calendarToggleActive,
                    ]}
                    onPress={() => onToggleCalendar(calendar)}
                  >
                    <Text
                      style={[
                        styles.calendarToggleText,
                        isEnabled && styles.calendarToggleTextActive,
                      ]}
                    >
                      {isEnabled ? 'En uso' : 'Usar'}
                    </Text>
                  </Pressable>

                  <View style={styles.calendarOptionCopy}>
                    <Text style={styles.calendarOptionTitle} numberOfLines={1}>
                      {calendar.summary || 'Calendario sin nombre'}
                    </Text>
                    <Text style={styles.calendarOptionMeta} numberOfLines={1}>
                      {getAppointmentTypeConfig(
                        selection?.appointmentType || getDefaultAppointmentType(calendar.summary),
                      ).label}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsSection}>
                    {calendarTypeOptions.map(type => {
                      const isActive = selection?.appointmentType === type.value

                      return (
                        <Pressable
                          key={type.value}
                          disabled={isBusy}
                          style={[
                            styles.calendarToggle,
                            isActive && { backgroundColor: type.color, borderColor: type.color },
                          ]}
                          onPress={() => onAssignCalendarType(calendar, type.value)}
                        >
                          <Text
                            style={[
                              styles.calendarToggleText,
                              isActive && styles.calendarToggleTextActive,
                            ]}
                          >
                            {type.label}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>

              </>
            )
          })}
        </View>
      )}
    </AppModal>
  )
}
