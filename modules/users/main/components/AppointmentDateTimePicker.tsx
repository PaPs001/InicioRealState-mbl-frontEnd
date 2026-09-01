import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'

import {
  createCalendarCells,
  getSafeDate,
  isSameDate,
  MONTH_NAMES,
  WEEK_DAYS,
} from '@/modules/users/date/utils/calendarUtils'
import { styles } from './styles/AppointmenDateTimePicker.styles'
import { WheelNumberSelector } from './WheelNumberSelector'

const HOUR_OPTIONS = Array.from({ length: 15 }, (_, index) => index + 8)
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index)

type AppointmentDateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  onClose: () => void,
  visible: boolean
}

export function AppointmentDateTimePicker({
  value,
  onChange,
  onClose,
  visible,
}: AppointmentDateTimePickerProps) {
  const [step, setStep] = useState<'date' | 'time'>('date')
  const [hasSelectedDate, setHasSelectedDate] = useState(true)
  const [hasSelectedHour, setHasSelectedHour] = useState(true)
  const [hasSelectedMinute, setHasSelectedMinute] = useState(true)
  const valueDate = getSafeDate(value)
  const [selectedDate, setSelectedDate] = useState(valueDate)
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(valueDate.getFullYear(), valueDate.getMonth(), 1),
  )
  const [selectedHour, setSelectedHour] = useState(getSafeHour(valueDate.getHours()))
  const [selectedMinute, setSelectedMinute] = useState(roundMinute(valueDate.getMinutes()))

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const calendarCells = useMemo(
    () => createCalendarCells(year, month),
    [year, month],
  )

  useEffect(() => {
    const nextDate = getSafeDate(value)
    setSelectedDate(nextDate)
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
    setSelectedHour(getSafeHour(nextDate.getHours()))
    setSelectedMinute(roundMinute(nextDate.getMinutes()))
    setStep('date')
    setHasSelectedDate(true)
    setHasSelectedHour(true)
    setHasSelectedMinute(true)
  }, [value])

  function goToPreviousMonth() {
    setVisibleMonth(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setVisibleMonth(new Date(year, month + 1, 1))
  }

  function selectDate(date: Date) {
    const nextDate = new Date(date)
    nextDate.setHours(selectedHour, selectedMinute, 0, 0)
    setSelectedDate(nextDate)
    setHasSelectedDate(true)
  }

  function selectHour(hour: number) {
    setSelectedHour(hour)
    setHasSelectedHour(true)
  }

  function selectMinute(minute: number) {
    setSelectedMinute(minute)
    setHasSelectedMinute(true)
  }

  function confirmSelection() {
    const nextDate = new Date(selectedDate)
    nextDate.setHours(selectedHour, selectedMinute, 0, 0)
    onChange(nextDate.toISOString())
    onClose()
  }

  const pickerTitle =
    step === 'date'
      ? 'Seleccionar fecha '
      : 'Seleccionar hora '
  const pickerSubtitle =
    step === 'date'
      ? 'Elige el dia de la cita  '
      : 'Elige la hora de la cita  '

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.appointmentModalGestureRoot}>
        <Pressable style={styles.appointmentModalOverlay} onPress={onClose}>
          <Pressable style={styles.appointmentModalPanel} onPress={event => event.stopPropagation()}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{pickerTitle}</Text>
              <Text style={styles.subtitle}>{pickerSubtitle}</Text>
            </View>
            <View style={styles.appointmentDatePicker}>
              {step === 'date' ? (
                <>
                  <View style={styles.appointmentDatePickerHeader}>
                    <Pressable style={styles.appointmentDatePickerNavButton} onPress={goToPreviousMonth}>
                      <ChevronLeft size={18} color="#3d5a40" />
                    </Pressable>
          
                    <View style={styles.appointmentDatePickerHeaderTitle}>
                      <Text style={styles.appointmentDatePickerMonth}>{MONTH_NAMES[month]}</Text>
                      <Text style={styles.appointmentDatePickerYear}>{year}</Text>
                    </View>
          
                    <Pressable style={styles.appointmentDatePickerNavButton} onPress={goToNextMonth}>
                      <ChevronRight size={18} color="#3d5a40" />
                    </Pressable>
                  </View>
                  <View style={styles.appointmentDatePickerWeekRow}>
                    {WEEK_DAYS.map(weekDay => (
                      <View key={weekDay} style={styles.appointmentDatePickerWeekCell}>
                        <Text style={styles.appointmentDatePickerWeekText}>{weekDay}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.appointmentDatePickerGrid}>
                    {calendarCells.map(cell => {
                      if (!cell.date || !cell.day) {
                        return <View key={cell.key} style={styles.appointmentDatePickerDayCell} />
                      }
          
                      const isSelected = isSameDate(cell.date, selectedDate)
                      const isToday = isSameDate(cell.date, new Date())
          
                      return (
                        <Pressable
                          key={cell.key}
                          style={styles.appointmentDatePickerDayCell}
                          onPress={() => selectDate(cell.date as Date)}
                        >
                          <View
                            style={[
                              styles.appointmentDatePickerDayButton,
                              isToday && styles.appointmentDatePickerTodayButton,
                              isSelected && styles.appointmentDatePickerSelectedDayButton,
                            ]}
                          >
                            <Text
                              style={[
                                styles.appointmentDatePickerDayText,
                                isToday && styles.appointmentDatePickerTodayText,
                                isSelected && styles.appointmentDatePickerSelectedDayText,
                              ]}
                            >
                              {cell.day}
                            </Text>
                          </View>
                        </Pressable>
                      )
                    })}
                  </View>
                  <View style={styles.informationDateSection}>
                    <View style={styles.informationDateContainer}>
                      <Text style={styles.dateText}>{formatSelectedDate(selectedDate)}</Text>
                    </View>
                    <Pressable
                      style={styles.appointmentDatePickerConfirmButton}
                      onPress={() => setStep('time')}
                    >
                      <Text style={styles.appointmentDatePickerConfirmText}>
                        Continuar
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : step === 'time' ? (
                <>
                <View style={styles.timeContainer}>
                  <View style={styles.timeSelectorContainer}>
                    <Text style={styles.appointmentDatePickerSectionTitle}>Hora</Text>
                    <WheelNumberSelector
                      options={HOUR_OPTIONS}
                      value={selectedHour}
                      hasSelectedValue={hasSelectedHour}
                      onChange={selectHour}
                    />
                  </View>
                  <View style={styles.timeSelectorContainer}>
                    <Text style={styles.appointmentDatePickerSectionTitle}>Minutos</Text>
                    <WheelNumberSelector
                      options={MINUTE_OPTIONS}
                      value={selectedMinute}
                      hasSelectedValue={hasSelectedMinute}
                      onChange={selectMinute}
                    />
                  </View>
                </View>
                  <View>
                    <Pressable
                      style={styles.appointmentDatePickerConfirmButton}
                      onPress={confirmSelection}
                    >
                      <Text style={styles.appointmentDatePickerConfirmText}>Seleccionar hora</Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  )
}


function roundMinute(minute: number) {
  return MINUTE_OPTIONS.reduce((closest, option) => (
    Math.abs(option - minute) < Math.abs(closest - minute) ? option : closest
  ), MINUTE_OPTIONS[0])
}

function getSafeHour(hour: number) {
  return HOUR_OPTIONS.includes(hour) ? hour : HOUR_OPTIONS[0]
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
