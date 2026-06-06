import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native'

import type { CalendarViewMode } from '@/lib/hooks/use-public-property-detail'
import type { AppTheme } from '@/lib/theme'
import type { MonthDayCell } from '@/lib/services/public-property-detail'

import { styles } from './styles'

type PropertyCalendarTabProps = {
  calendarView: CalendarViewMode
  currentMonth: Date
  dayNames: string[]
  formatDateStr: (date: Date) => string
  hasAppointments: (date: Date) => boolean
  isPast: (date: Date) => boolean
  isTimeBooked: (date: string, time: string) => boolean
  isToday: (date: Date) => boolean
  monthDays: MonthDayCell[]
  monthNames: string[]
  nextMonth: () => void
  notes: string
  prevMonth: () => void
  selectedDate: string
  selectedDateLabel: string
  selectedTime: string
  setCalendarView: (view: CalendarViewMode) => void
  setNotes: (value: string) => void
  setSelectedDate: (value: string) => void
  setSelectedTime: (value: string) => void
  theme: AppTheme
  timeSlots: string[]
  weekDays: Date[]
}

export function PropertyCalendarTab({
  calendarView,
  currentMonth,
  dayNames,
  formatDateStr,
  hasAppointments,
  isPast,
  isTimeBooked,
  isToday,
  monthDays,
  monthNames,
  nextMonth,
  notes,
  prevMonth,
  selectedDate,
  selectedDateLabel,
  selectedTime,
  setCalendarView,
  setNotes,
  setSelectedDate,
  setSelectedTime,
  theme,
  timeSlots,
  weekDays,
}: PropertyCalendarTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={[styles.viewFilters, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(['month', 'week', 'day'] as const).map((viewKey) => {
            const label = viewKey === 'month' ? 'Mes' : viewKey === 'week' ? 'Semana' : 'Dia'

            return (
              <TouchableOpacity
                key={viewKey}
                style={[styles.viewFilterBtn, calendarView === viewKey && { backgroundColor: theme.accent }]}
                onPress={() => setCalendarView(viewKey)}
              >
                <Text
                  style={[
                    styles.viewFilterText,
                    { color: theme.textMuted },
                    calendarView === viewKey && { color: theme.textLight },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {calendarView === 'month' && (
        <View style={styles.section}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={prevMonth} style={[styles.monthNavBtn, { backgroundColor: theme.surface }]}>
              <ChevronLeft size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={[styles.monthNavBtn, { backgroundColor: theme.surface }]}>
              <ChevronRight size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysHeader}>
            {dayNames.map((day) => (
              <Text key={day} style={[styles.weekDayLabel, { color: theme.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {monthDays.map((dayObj) => {
              const dateStr = formatDateStr(dayObj.date)
              const isSelected = selectedDate === dateStr
              const today = isToday(dayObj.date)
              const past = isPast(dayObj.date)
              const hasApts = hasAppointments(dayObj.date)

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.monthDayCell,
                    { backgroundColor: theme.background },
                    !dayObj.isCurrentMonth && { opacity: 0.4 },
                    isSelected && { backgroundColor: theme.accent },
                    today && !isSelected && { borderColor: theme.accent, borderWidth: 2 },
                  ]}
                  onPress={() => !past && setSelectedDate(dateStr)}
                  disabled={past}
                >
                  <Text
                    style={[
                      styles.monthDayText,
                      { color: theme.text },
                      past && { color: theme.textMuted },
                      isSelected && { color: theme.textLight },
                    ]}
                  >
                    {dayObj.date.getDate()}
                  </Text>
                  {hasApts && !isSelected ? <View style={[styles.aptDot, { backgroundColor: theme.accent }]} /> : null}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {calendarView === 'week' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Esta semana</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {weekDays.map((date) => {
              const dateStr = formatDateStr(date)
              const isSelected = selectedDate === dateStr
              const today = isToday(date)
              const past = isPast(date)
              const hasApts = hasAppointments(date)

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dayCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && { backgroundColor: theme.accent, borderColor: theme.accent },
                    today && !isSelected && { borderColor: theme.accent, borderWidth: 2 },
                    past && { opacity: 0.5 },
                  ]}
                  onPress={() => !past && setSelectedDate(dateStr)}
                  disabled={past}
                >
                  <Text
                    style={[
                      styles.dayName,
                      { color: theme.textMuted },
                      isSelected && { color: theme.textLight },
                    ]}
                  >
                    {dayNames[date.getDay()]}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      { color: theme.text },
                      isSelected && { color: theme.textLight },
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {hasApts && !isSelected ? <View style={[styles.aptDotSmall, { backgroundColor: theme.accent }]} /> : null}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {calendarView === 'day' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedDate ? selectedDateLabel : 'Selecciona una fecha primero'}
          </Text>
        </View>
      )}

      {selectedDate && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios disponibles</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((time) => {
              const isBooked = isTimeBooked(selectedDate, time)

              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlotCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    selectedTime === time && { backgroundColor: theme.accent, borderColor: theme.accent },
                    isBooked && { backgroundColor: theme.border, borderColor: theme.border },
                  ]}
                  onPress={() => !isBooked && setSelectedTime(time)}
                  disabled={isBooked}
                >
                  <Clock
                    size={16}
                    color={isBooked ? theme.textMuted : selectedTime === time ? theme.textLight : theme.accent}
                  />
                  <Text
                    style={[
                      styles.timeSlotText,
                      { color: theme.text },
                      selectedTime === time && { color: theme.textLight },
                      isBooked && { color: theme.textMuted, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {time}
                  </Text>
                  {isBooked ? <Text style={[styles.bookedText, { color: theme.textMuted }]}>Ocupado</Text> : null}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notas adicionales</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Escribe algun comentario o pregunta..."
            placeholderTextColor={theme.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={[styles.legendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Tiene citas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDotOutline, { borderColor: theme.accent }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Hoy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.textMuted }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>No disponible</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
