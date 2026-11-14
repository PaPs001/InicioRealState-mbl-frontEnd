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
import { TimeSelector } from './TimeSelector'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index)
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index)

type AppointmentDateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  onClose: () => void,
  visible: boolean
  hourOptions?: number[]
  minimumDateTime?: string
  selectionLabel?: string
}

export function AppointmentDateTimePicker({
  value,
  onChange,
  onClose,
  visible,
  hourOptions = HOUR_OPTIONS,
  minimumDateTime,
  selectionLabel = 'de la cita',
}: AppointmentDateTimePickerProps) {
  const selectableHours = useMemo(
    () => [...new Set(hourOptions)].filter(hour => Number.isInteger(hour) && hour >= 0 && hour <= 23).sort((a, b) => a - b),
    [hourOptions],
  )
  const [step, setStep] = useState<'date' | 'time'>('date')
  const valueDate = getSafeDate(value)
  const [selectedDate, setSelectedDate] = useState(valueDate)
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(valueDate.getFullYear(), valueDate.getMonth(), 1),
  )
  const [selectedHour, setSelectedHour] = useState(getSafeHour(valueDate.getHours(), selectableHours))
  const [selectedMinute, setSelectedMinute] = useState(roundMinute(valueDate.getMinutes()))

  const minimumDate = useMemo(() => {
    if (!minimumDateTime) return null

    const date = new Date(minimumDateTime)
    return Number.isNaN(date.getTime()) ? null : date
  }, [minimumDateTime])
  const isMinimumDateSelected = Boolean(
    minimumDate && isSameDate(selectedDate, minimumDate),
  )
  const availableHourOptions = isMinimumDateSelected
    ? selectableHours.filter(hour => hour >= (minimumDate as Date).getHours())
    : selectableHours
  const availableMinuteOptions =
    isMinimumDateSelected && selectedHour === (minimumDate as Date).getHours()
      ? MINUTE_OPTIONS.filter(minute => minute >= (minimumDate as Date).getMinutes())
      : MINUTE_OPTIONS

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
    setSelectedHour(getSafeHour(nextDate.getHours(), selectableHours))
    setSelectedMinute(roundMinute(nextDate.getMinutes()))
    setStep('date')
  }, [selectableHours, value])

  useEffect(() => {
    if (!minimumDate || !isSameDate(selectedDate, minimumDate)) return

    const minimumHour = minimumDate.getHours()
    const minimumMinute = minimumDate.getMinutes()

    if (selectedHour < minimumHour) {
      const nextHour = selectableHours.find(hour => hour >= minimumHour)
      if (nextHour !== undefined) {
        setSelectedHour(nextHour)
        if (nextHour === minimumHour) setSelectedMinute(Math.max(selectedMinute, minimumMinute))
      }
      return
    }

    if (selectedHour === minimumHour && selectedMinute < minimumMinute) {
      setSelectedMinute(minimumMinute)
    }
  }, [minimumDate, selectedDate, selectedHour, selectedMinute, selectableHours])

  function goToPreviousMonth() {
    setVisibleMonth(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setVisibleMonth(new Date(year, month + 1, 1))
  }

  function selectDate(date: Date) {
    if (isDateBeforeMinimum(date, minimumDate)) return

    const nextDate = new Date(date)
    nextDate.setHours(selectedHour, selectedMinute, 0, 0)
    setSelectedDate(nextDate)
  }

  function selectHour(hour: number) {
    if (!availableHourOptions.includes(hour)) return
    setSelectedHour(hour)
    if (
      isMinimumDateSelected &&
      minimumDate &&
      hour === minimumDate.getHours() &&
      selectedMinute < minimumDate.getMinutes()
    ) {
      setSelectedMinute(minimumDate.getMinutes())
    }
  }

  function selectMinute(minute: number) {
    if (!availableMinuteOptions.includes(minute)) return
    setSelectedMinute(minute)
  }

  function confirmSelection() {
    if (!availableHourOptions.includes(selectedHour) || !availableMinuteOptions.includes(selectedMinute)) return
    const nextDate = new Date(selectedDate)
    nextDate.setHours(selectedHour, selectedMinute, 0, 0)
    onChange(
      minimumDate && nextDate < minimumDate
        ? minimumDate.toISOString()
        : nextDate.toISOString(),
    )
    onClose()
  }

  const pickerTitle =
    step === 'date'
      ? `Seleccionar fecha ${selectionLabel}`
      : `Seleccionar hora`
  const pickerSubtitle =
    step === 'date'
      ? `Elige el dia ${selectionLabel}`
      : `Elige la hora de la cita`

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.appointmentModalGestureRoot}>
        <Pressable style={styles.appointmentModalOverlay} onPress={onClose}>
          <Pressable style={styles.appointmentModalPanel} onPress={event => event.stopPropagation()}>
            {step === 'time' && <View style={styles.timePickerHandle} />}
            <View style={styles.headerContainer}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>{pickerTitle}</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.subtitle}>{pickerSubtitle}</Text>
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
                      const isDisabled = isDateBeforeMinimum(cell.date, minimumDate)
          
                      return (
                        <Pressable
                          key={cell.key}
                          style={styles.appointmentDatePickerDayCell}
                          onPress={() => selectDate(cell.date as Date)}
                          disabled={isDisabled}
                        >
                          <View
                            style={[
                              styles.appointmentDatePickerDayButton,
                              isToday && styles.appointmentDatePickerTodayButton,
                              isSelected && styles.appointmentDatePickerSelectedDayButton,
                              isDisabled && { opacity: 0.35 },
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
                  {availableHourOptions.length ? <TimeSelector
                    hour={selectedHour}
                    minute={selectedMinute}
                    hourOptions={availableHourOptions}
                    minuteOptions={availableMinuteOptions}
                    onHourChange={selectHour}
                    onMinuteChange={selectMinute}
                  /> : <Text style={styles.subtitle}>No hay horarios disponibles para este día. Elige otra fecha.</Text>}
                  <View>
                    <Pressable
                      style={styles.appointmentDatePickerConfirmButton}
                      onPress={confirmSelection}
                      disabled={!availableHourOptions.includes(selectedHour) || !availableMinuteOptions.includes(selectedMinute)}
                    >
                      <Text style={styles.appointmentDatePickerConfirmText}>Confirmar hora</Text>
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

function getSafeHour(hour: number, hourOptions: number[]) {
  return hourOptions.reduce((closest, option) => (
    Math.abs(option - hour) < Math.abs(closest - hour) ? option : closest
  ), hourOptions[0] ?? 14)
}

function isDateBeforeMinimum(date: Date, minimumDate: Date | null) {
  if (!minimumDate) return false

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const minimumDay = new Date(
    minimumDate.getFullYear(),
    minimumDate.getMonth(),
    minimumDate.getDate(),
  )
  return day < minimumDay
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
