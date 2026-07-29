import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { ChevronLeft, ChevronRight } from "lucide-react-native";

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MONTH_NAME=[
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

interface CalendarCell{
  key: string
  day: number | null
  date: Date | null
}

interface CalendarProps {
  appointmentTypesByDate?: Record<string, {
    renta: boolean
    venta: boolean
    general: boolean
  }>
  selectedDate: Date
  visibleMonth: Date
  onSelectDate?: (date: Date) => void
  onVisibleMonthChange?: (date: Date) => void
}

function formatDateKey(date: Date): string{
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isSameDate(firstDate: Date, secondDate: Date): boolean{
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function createCalendarCells(year: number, month: number): CalendarCell[]{
  const firstDayOfMonth = new Date(year, month, 1)
  const initialEmptyCells = (firstDayOfMonth.getDay() + 6) % 7

  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: CalendarCell[] = []

  for (let index = 0; index < initialEmptyCells; index += 1){
    cells.push({
      key: `empty-start-${index}`,
      day: null,
      date: null
    })
  }

  for (let day = 1; day <= totalDays; day+= 1){
    const date = new Date(year, month, day)

    cells.push({
      key: formatDateKey(date),
      day,
      date
    })
  }

  while(cells.length % 7 !== 0){
    cells.push({
      key: `empty-end-${cells.length}`,
      day: null,
      date: null
    })
  }

  return cells
}

export function Calendar({
  appointmentTypesByDate = {},
  selectedDate,
  visibleMonth,
  onSelectDate,
  onVisibleMonthChange,
}: CalendarProps){
  const today = new Date()
  
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const calendarCells = useMemo(
    () => createCalendarCells(year, month),
    [year, month],
  )

  function goToPreviousDate(){
    onVisibleMonthChange?.(new Date(year, month - 1, 1))
  }

  function goToNextMonth(){
    onVisibleMonthChange?.(new Date(year, month + 1, 1))
  }

  function selectDate(date: Date){
    onSelectDate?.(date)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.navigationButton}
          onPress={goToPreviousDate}
        >
          <ChevronLeft size={22} color="#19191F" />
        </Pressable>

        <View style={styles.headerTitle}>
          <Text style={styles.monthText}>
            {MONTH_NAME[month]}
          </Text>

          <Text style={styles.yearText}>
            {year}
          </Text>
        </View>

        <Pressable
          style={styles.navigationButton}
          onPress={goToNextMonth}
        >
          <ChevronRight size={22} color="#19191F" />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEK_DAYS.map(weekDay => (
          <View key={weekDay} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>
              {weekDay}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarCells.map(cell => {
          if (!cell.date || !cell.day) {
            return (
              <View
                key={cell.key}
                style={styles.dayCell}
              />
            )
          }

          const dateKey = formatDateKey(cell.date)
          const appointmentTypes = appointmentTypesByDate[dateKey]

          const isToday = isSameDate(cell.date, today)

          const isSelected =
            isSameDate(cell.date, selectedDate)

          return (
            <Pressable
              key={cell.key}
              style={styles.dayCell}
              onPress={() => selectDate(cell.date as Date)}
            >
              <View
                style={[
                  styles.dayCircle,
                  isToday && styles.todayCircle,
                  isSelected && styles.selectedCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {cell.day}
                </Text>

                {appointmentTypes && (
                  <View style={styles.eventDots}>
                    {appointmentTypes.renta && (
                      <View style={[styles.eventDot, styles.rentEventDot]} />
                    )}
                    {appointmentTypes.venta && (
                      <View style={[styles.eventDot, styles.saleEventDot]} />
                    )}
                    {appointmentTypes.general && (
                      <View style={[styles.eventDot, styles.generalEventDot]} />
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f4f4',
    borderRadius: 20,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerTitle: {
    alignItems: 'center',
  },

  monthText: {
    color: '#19191F',
    fontSize: 20,
    fontWeight: '700',
  },

  yearText: {
    color: '#737373',
    fontSize: 13,
    marginTop: 2,
  },

  navigationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F6',
  },

  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  weekDayCell: {
    width: '14.2857%',
    alignItems: 'center',
  },

  weekDayText: {
    color: '#8A8A91',
    fontSize: 13,
    fontWeight: '600',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayCircle: {
    borderWidth: 1,
    borderColor: '#B1833A',
  },

  selectedCircle: {
    backgroundColor: '#B1833A',
    borderColor: '#B1833A',
  },

  dayText: {
    color: '#19191F',
    fontSize: 14,
    fontWeight: '500',
  },

  todayText: {
    color: '#B1833A',
    fontWeight: '700',
  },

  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  eventDots: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },

  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  rentEventDot: {
    backgroundColor: '#2E9D5B',
  },

  saleEventDot: {
    backgroundColor: '#3478C7',
  },

  generalEventDot: {
    backgroundColor: '#B1833A',
  },
})
