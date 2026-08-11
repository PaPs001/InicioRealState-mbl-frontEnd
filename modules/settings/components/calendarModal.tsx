import { Pressable, Text, View } from 'react-native'

import { AppModal } from '@/components/AppModal'
import { getDefaultAppointmentType } from '@/components/userDashboard/dashboard-formatters'
import type { GoogleCalendarOption, SelectedGoogleCalendar } from '@/lib/api'

import { styles } from './styles/CalendarSection.style'

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
}: CalendarModalProps) {
  const isBusy = isCalendarSettingsLoading || isSavingCalendarSelection

  return (
    <AppModal
      visible={visible}
      title="Calendarios disponibles"
      subtitle="Selecciona los calendarios que quieres utilizar"
      onClose={onClose}
      showCloseButton
      position="bottom"
      size="large"
      animationType="slide"
      scrollable
      closeDisabled={isSavingCalendarSelection}
      closeOnBackdropPress={!isSavingCalendarSelection}
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
                    {selection?.appointmentType ||
                      getDefaultAppointmentType(calendar.summary)}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </AppModal>
  )
}
