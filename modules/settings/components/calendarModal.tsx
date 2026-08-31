import { Pressable, Text, View } from 'react-native'

import { AppModal } from '@/components/AppModal'
import { getDefaultAppointmentType } from '@/modules/users/main/utils/dashboard-formatters'
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
            const isRent = selection?.appointmentType === 'renta'
            const isSale = selection?.appointmentType === 'venta'

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
                      {selection?.appointmentType ||
                        getDefaultAppointmentType(calendar.summary)}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsSection}>
                    <Pressable
                      disabled={isBusy}
                      style={[
                        styles.calendarToggle,
                        isRent && styles.calendarToggleActiveRent,
                      ]}
                      onPress={() => onAssignCalendarType(calendar, 'renta')}
                    >
                      <Text
                        style={[
                          styles.calendarToggleText,
                          isRent && styles.calendarToggleTextActive,
                        ]}
                      >
                        {isRent ? 'Renta' : 'Renta'}
                      </Text>
                      
                    </Pressable>
                    <Pressable
                      disabled={isBusy}
                      style={[
                        styles.calendarToggle,
                        isSale && styles.calendarToggleActiveSale,
                      ]}
                      onPress={() => onAssignCalendarType(calendar, 'venta')}
                    >
                      <Text
                        style={[
                          styles.calendarToggleText,
                          isSale && styles.calendarToggleTextActive,
                        ]}
                      >
                        {isSale ? 'Venta' : 'Venta'}
                      </Text>
                      
                    </Pressable>
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
