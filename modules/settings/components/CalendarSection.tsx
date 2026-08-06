import { Pressable, Text, View } from 'react-native'

import { icons } from '@/assets'
import { getDefaultAppointmentType } from '@/components/userDashboard/dashboard-formatters'
import type { GoogleCalendarOption, SelectedGoogleCalendar } from '@/lib/api'
import { styles } from './styles/CalendarSection.style'

type CalendarSectionProps = {
  googleCalendars: GoogleCalendarOption[]
  selectedGoogleCalendars: SelectedGoogleCalendar[]
  isCalendarSettingsLoading: boolean
  isSavingCalendarSelection: boolean
  isGoogleConnected: boolean
  needsGoogleReconnect: boolean
  isConnectingCalendar: boolean
  isDisconnectingCalendar: boolean
  onReloadCalendars: () => void | Promise<void>
  onToggleCalendar: (calendar: GoogleCalendarOption) => void
  onSaveCalendarSelection: () => void | Promise<void>
  onConnectCalendar: () => void | Promise<void>
  onDisconnectCalendar: () => void | Promise<void>
}

export function CalendarSection({
  googleCalendars,
  selectedGoogleCalendars,
  isCalendarSettingsLoading,
  isSavingCalendarSelection,
  isGoogleConnected,
  needsGoogleReconnect,
  isConnectingCalendar,
  isDisconnectingCalendar,
  onReloadCalendars,
  onToggleCalendar,
  onSaveCalendarSelection,
  onConnectCalendar,
  onDisconnectCalendar,
}: CalendarSectionProps) {
  const isConnected = isGoogleConnected && !needsGoogleReconnect
  const isConnectionActionPending = isConnectingCalendar || isDisconnectingCalendar

  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <icons.calendarDatesMobile width={20} height={20} fill="#d4b66f" />
        <Text style={styles.sectionTitle}>Calendario</Text>
      </View>

      <View>
        <Text>Calendarios Conectados</Text>
        <Pressable
          style={styles.calendarSmallButton}
          disabled={isCalendarSettingsLoading}
          onPress={onReloadCalendars}
        >
          <Text style={styles.calendarSmallButtonText}>
            {isCalendarSettingsLoading ? 'Cargando' : 'Actualizar'}
          </Text>
        </Pressable>

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
            {googleCalendars.map((calendar) => {
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
                    style={[styles.calendarToggle, isEnabled && styles.calendarToggleActive]}
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
                      {selection?.appointmentType || getDefaultAppointmentType(calendar.summary)}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        <View style={styles.calendarActionsRow}>
          <Pressable
            style={styles.calendarActionButton}
            disabled={isSavingCalendarSelection}
            onPress={onSaveCalendarSelection}
          >
            <Text style={styles.calendarActionButtonText}>
              {isSavingCalendarSelection ? 'Guardando...' : 'Guardar calendarios'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={isConnected ? styles.outlineButton : styles.centerButton}
        disabled={isConnectionActionPending}
        onPress={isConnected ? onDisconnectCalendar : onConnectCalendar}
      >
        <icons.BackButton />
        <Text style={isConnected ? styles.outlineButtonText : styles.centerButtonText}>
          {isConnectingCalendar
            ? 'Abriendo Google...'
            : isDisconnectingCalendar
              ? 'Desconectando...'
              : needsGoogleReconnect
                ? 'Reconectar Google Calendar'
                : isGoogleConnected
                  ? 'Desconectar Google'
                  : 'Conectar Google Calendar'}
        </Text>
      </Pressable>
    </View>
  )
}
