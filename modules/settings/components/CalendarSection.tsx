import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { icons } from '@/assets'
import type { GoogleCalendarOption, SelectedGoogleCalendar, AppointmentType } from '@/lib/api'
import { CalendarModal } from './calendarModal'
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
  onAssignCalendarTypes: (
    calendar: GoogleCalendarOption,
    appointmentType: AppointmentType
  ) => void
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
  onAssignCalendarTypes
}: CalendarSectionProps) {
  const isConnected = isGoogleConnected && !needsGoogleReconnect
  const isConnectionActionPending = isConnectingCalendar || isDisconnectingCalendar
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false)

  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <icons.calendarDatesMobile width={20} height={20} fill="#d4b66f" />
        <Text style={styles.sectionTitle}>Calendario</Text>
      </View>

      <View style={styles.calendarOptions}>
        <View style={styles.optionsSections}>
          <Pressable
            onPress={() => setIsCalendarModalVisible(true)}
            style={styles.optionButtonType1}
          >
            <icons.CalendarCog />
            <View style={styles.textSectionOptionButtonType1}>
              <Text style={styles.titleOption}>Ver calendarios</Text>
              <Text style={styles.subtitleOption}>
                Controla qué calendarios visualizar
              </Text>
            </View>
            <icons.ArrowLeft />
          </Pressable>

          {/*<Pressable style={styles.optionButtonType1}>
            <icons.calendarDatesMobile width={20} height={20} fill="#d4b66f" />
            <View style={styles.textSectionOptionButtonType1}>
              <Text style={styles.titleOption}>Calendario de venta</Text>
              <Text style={styles.subtitleOption}>
                Escoger el calendario donde se guardarán las citas de venta
              </Text>
            </View>
            <icons.ArrowLeft />
          </Pressable>

          <Pressable style={styles.optionButtonType1}>
            <icons.calendarDatesMobile width={20} height={20} fill="#d4b66f" />
            <View style={styles.textSectionOptionButtonType1}>
              <Text style={styles.titleOption}>Calendario de renta</Text>
              <Text style={styles.subtitleOption}>
                Escoger el calendario donde se guardarán las citas de renta
              </Text>
            </View>
            <icons.ArrowLeft />
          </Pressable>*/}
        </View>
      </View>

      <Pressable
        style={isConnected ? styles.outlineButton : styles.centerButton}
        disabled={isConnectionActionPending}
        onPress={isConnected ? onDisconnectCalendar : onConnectCalendar}
      >
        
        <Text style={isConnected ? styles.outlineButtonText : styles.centerButtonText}>
          {isConnectingCalendar
            ? 'Abriendo Permisos de Google...'
            : isDisconnectingCalendar
              ? 'Desconectando...'
              : needsGoogleReconnect
                ? 'Reconectar Calendario'
                : isGoogleConnected
                  ? 'Desconectar Calendario'
                  : 'Conectar Calendario'}
        </Text>
      </Pressable>

      <CalendarModal
        visible={isCalendarModalVisible}
        googleCalendars={googleCalendars}
        selectedGoogleCalendars={selectedGoogleCalendars}
        isCalendarSettingsLoading={isCalendarSettingsLoading}
        isSavingCalendarSelection={isSavingCalendarSelection}
        needsGoogleReconnect={needsGoogleReconnect}
        onReloadCalendars={onReloadCalendars}
        onToggleCalendar={onToggleCalendar}
        onSaveCalendarSelection={onSaveCalendarSelection}
        onClose={() => setIsCalendarModalVisible(false)}
        onAssignCalendarType={onAssignCalendarTypes}
      />
    </View>
  )
}
