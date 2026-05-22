import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Home,
  Building2,
  Map,
  Calendar,
  Phone,
  MessageCircle,
  X,
  Check,
  Info,
  TrendingUp,
  ArrowLeft,
  Clock,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  BarChart3,
} from 'lucide-react-native'

type TabType = 'info' | 'analysis' | 'calendar'

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { getPropertyById, isFavorite, toggleFavorite, isClient, isAgent, isAdmin, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const property = getPropertyById(id || '')
  const favorite = property ? isFavorite(property.id) : false

  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const isTenant = currentUser?.role === 'tenant'
  
  const theme = useMemo(() => {
    if (isInvestor) return clientThemes.investor
    if (isTenant) return clientThemes.tenant
    if (isSearching) return clientThemes.searching
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      border: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textLight: colors.textInverse,
    }
  }, [isInvestor, isSearching, isTenant])

  const isForSale = property?.status === 'for_sale'
  const isForRent = property?.status === 'for_rent'

  const bookedAppointments = [
    { date: '2024-06-15', time: '10:00' },
    { date: '2024-06-15', time: '14:00' },
    { date: '2024-06-16', time: '11:00' },
    { date: '2024-06-18', time: '09:00' },
    { date: '2024-06-18', time: '15:00' },
    { date: '2024-06-18', time: '16:00' },
  ]

  const isTimeBooked = (date: string, time: string) => {
    return bookedAppointments.some(apt => apt.date === date && apt.time === time)
  }

  if (!property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.textMuted }]}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const getPropertyIcon = () => {
    switch (property.type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const Icon = getPropertyIcon()

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora')
      return
    }
    if (isTimeBooked(selectedDate, selectedTime)) {
      Alert.alert('Horario no disponible', 'Este horario ya esta ocupado, por favor selecciona otro')
      return
    }
    Alert.alert(
      'Cita Agendada',
      `Tu cita ha sido agendada para el ${selectedDate} a las ${selectedTime}`,
      [{ text: 'OK', onPress: () => setShowAppointmentModal(false) }]
    )
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
  }

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  
  // Funciones para el calendario
  const getMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Dias del mes anterior para completar la semana
    const firstDayWeekday = firstDay.getDay()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Dias del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Dias del siguiente mes para completar
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  const getWeekDays = () => {
    const days = []
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDateStr = (date: Date) => date.toISOString().split('T')[0]
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const hasAppointments = (date: Date) => {
    const dateStr = formatDateStr(date)
    return bookedAppointments.some(apt => apt.date === dateStr)
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Tab de Informacion General
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Descripcion */}
      {property.description && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripcion</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{property.description}</Text>
        </View>
      )}

      {/* Caracteristicas principales */}
      {property.type !== 'land' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Caracteristicas</Text>
          <View style={[styles.featuresCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.featureItem}>
              <Bed size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.bedrooms}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>Recamaras</Text>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Bath size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.bathrooms}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>Banos</Text>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Maximize size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.sqMeters}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>m2</Text>
            </View>
          </View>
        </View>
      )}

      {/* Amenidades */}
      {property.amenities && property.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Amenidades</Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.map((amenity, index) => (
              <View key={index} style={[styles.amenityChip, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
                <Check size={14} color={theme.accent} />
                <Text style={[styles.amenityText, { color: theme.accent }]}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Caracteristicas adicionales */}
      {property.features && property.features.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Incluye</Text>
          <View style={styles.featuresList}>
            {property.features.map((feature, index) => (
              <View key={index} style={[styles.featureChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Check size={14} color={theme.accent} />
                <Text style={[styles.featureChipText, { color: theme.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ubicacion */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicacion</Text>
        <View style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MapPin size={20} color={theme.accent} />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationAddress, { color: theme.text }]}>{property.address}</Text>
            <Text style={[styles.locationCity, { color: theme.textSecondary }]}>{property.city}</Text>
          </View>
        </View>
      </View>

      {/* Detalles de renta */}
      {isForRent && property.monthlyRent && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalles de Renta</Text>
          <View style={[styles.rentDetailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.rentDetailRow}>
              <Text style={[styles.rentDetailLabel, { color: theme.textMuted }]}>Renta mensual</Text>
              <Text style={[styles.rentDetailValue, { color: theme.accent }]}>{formatCurrency(property.monthlyRent)}</Text>
            </View>
            <View style={[styles.rentDivider, { backgroundColor: theme.border }]} />
            <View style={styles.rentDetailRow}>
              <Text style={[styles.rentDetailLabel, { color: theme.textMuted }]}>Deposito estimado</Text>
              <Text style={[styles.rentDetailValue, { color: theme.text }]}>{formatCurrency(property.monthlyRent * 2)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )

  // Tab de Analisis de Plusvalia (solo para ventas)
  const renderAnalysisTab = () => {
    const currentValue = property.currentValue || property.price
    const yearlyGrowth = 0.08 // 8% anual estimado
    const value1Year = currentValue * (1 + yearlyGrowth)
    const value3Years = currentValue * Math.pow(1 + yearlyGrowth, 3)
    const value5Years = currentValue * Math.pow(1 + yearlyGrowth, 5)

    // Costos estimados de venta
    const commissionRate = 0.05
    const notaryRate = 0.03
    const isrRate = 0.15
    const commission = currentValue * commissionRate
    const notary = currentValue * notaryRate
    const isr = (currentValue - property.price) * isrRate

    return (
      <View style={styles.tabContent}>
        {/* Valor actual */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Valor Actual</Text>
          <View style={[styles.valueCard, { backgroundColor: theme.accent + '15', borderColor: theme.accent }]}>
            <TrendingUp size={32} color={theme.accent} />
            <Text style={[styles.currentValueLabel, { color: theme.textSecondary }]}>Valor estimado de mercado</Text>
            <Text style={[styles.currentValue, { color: theme.accent }]}>{formatCurrency(currentValue)}</Text>
          </View>
        </View>

        {/* Proyeccion a futuro */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Proyeccion de Plusvalia</Text>
          <Text style={[styles.projectionNote, { color: theme.textMuted }]}>
            Basado en un crecimiento anual estimado del 8%
          </Text>
          
          <View style={styles.projectionsGrid}>
            <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.projectionYear, { color: theme.textMuted }]}>1 ano</Text>
              <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(value1Year)}</Text>
              <Text style={[styles.projectionGrowth, { color: colors.success }]}>+{formatCurrency(value1Year - currentValue)}</Text>
            </View>
            <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.projectionYear, { color: theme.textMuted }]}>3 anos</Text>
              <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(value3Years)}</Text>
              <Text style={[styles.projectionGrowth, { color: colors.success }]}>+{formatCurrency(value3Years - currentValue)}</Text>
            </View>
            <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.projectionYear, { color: theme.textMuted }]}>5 anos</Text>
              <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(value5Years)}</Text>
              <Text style={[styles.projectionGrowth, { color: colors.success }]}>+{formatCurrency(value5Years - currentValue)}</Text>
            </View>
          </View>
        </View>

        {/* Costos estimados de compra/venta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Costos Estimados de Compra</Text>
          
          <View style={[styles.costsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Comision inmobiliaria (5%)</Text>
              <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(commission)}</Text>
            </View>
            <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Gastos notariales (3%)</Text>
              <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(notary)}</Text>
            </View>
            <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>ISR estimado (15%)</Text>
              <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(isr > 0 ? isr : 0)}</Text>
            </View>
            <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
            <View style={styles.costRow}>
              <Text style={[styles.costTotalLabel, { color: theme.text }]}>Total costos estimados</Text>
              <Text style={[styles.costTotalValue, { color: theme.accent }]}>{formatCurrency(commission + notary + (isr > 0 ? isr : 0))}</Text>
            </View>
          </View>
        </View>

        {/* ROI potencial si renta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Potencial de Renta</Text>
          <View style={[styles.roiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <BarChart3 size={24} color={theme.accent} />
            <View style={styles.roiInfo}>
              <Text style={[styles.roiLabel, { color: theme.textMuted }]}>Renta mensual estimada</Text>
              <Text style={[styles.roiValue, { color: theme.text }]}>{formatCurrency(currentValue * 0.006)}</Text>
            </View>
            <View style={styles.roiInfo}>
              <Text style={[styles.roiLabel, { color: theme.textMuted }]}>ROI anual estimado</Text>
              <Text style={[styles.roiValue, { color: colors.success }]}>7.2%</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // Tab de Calendario
  const renderCalendarTab = () => {
    const monthDays = getMonthDays()
    const weekDays = getWeekDays()

    return (
      <View style={styles.tabContent}>
        {/* Filtros de vista */}
        <View style={styles.section}>
          <View style={[styles.viewFilters, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity 
              style={[
                styles.viewFilterBtn,
                calendarView === 'month' && { backgroundColor: theme.accent }
              ]}
              onPress={() => setCalendarView('month')}
            >
              <Text style={[
                styles.viewFilterText,
                { color: theme.textMuted },
                calendarView === 'month' && { color: theme.textLight }
              ]}>Mes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewFilterBtn,
                calendarView === 'week' && { backgroundColor: theme.accent }
              ]}
              onPress={() => setCalendarView('week')}
            >
              <Text style={[
                styles.viewFilterText,
                { color: theme.textMuted },
                calendarView === 'week' && { color: theme.textLight }
              ]}>Semana</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewFilterBtn,
                calendarView === 'day' && { backgroundColor: theme.accent }
              ]}
              onPress={() => setCalendarView('day')}
            >
              <Text style={[
                styles.viewFilterText,
                { color: theme.textMuted },
                calendarView === 'day' && { color: theme.textLight }
              ]}>Dia</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vista de Mes */}
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

            {/* Dias de la semana */}
            <View style={styles.weekDaysHeader}>
              {dayNames.map(day => (
                <Text key={day} style={[styles.weekDayLabel, { color: theme.textMuted }]}>{day}</Text>
              ))}
            </View>

            {/* Grid de dias */}
            <View style={styles.monthGrid}>
              {monthDays.map((dayObj, index) => {
                const dateStr = formatDateStr(dayObj.date)
                const isSelected = selectedDate === dateStr
                const today = isToday(dayObj.date)
                const past = isPast(dayObj.date)
                const hasApts = hasAppointments(dayObj.date)

                return (
                  <TouchableOpacity
                    key={index}
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
                    <Text style={[
                      styles.monthDayText,
                      { color: theme.text },
                      past && { color: theme.textMuted },
                      isSelected && { color: theme.textLight }
                    ]}>
                      {dayObj.date.getDate()}
                    </Text>
                    {hasApts && !isSelected && (
                      <View style={[styles.aptDot, { backgroundColor: theme.accent }]} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Vista de Semana */}
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
                      past && { opacity: 0.5 }
                    ]}
                    onPress={() => !past && setSelectedDate(dateStr)}
                    disabled={past}
                  >
                    <Text style={[
                      styles.dayName,
                      { color: theme.textMuted },
                      isSelected && { color: theme.textLight }
                    ]}>
                      {dayNames[date.getDay()]}
                    </Text>
                    <Text style={[
                      styles.dayNum,
                      { color: theme.text },
                      isSelected && { color: theme.textLight }
                    ]}>
                      {date.getDate()}
                    </Text>
                    {hasApts && !isSelected && (
                      <View style={[styles.aptDotSmall, { backgroundColor: theme.accent }]} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* Vista de Dia - Solo muestra horarios */}
        {calendarView === 'day' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona una fecha primero'}
            </Text>
          </View>
        )}

        {/* Horarios disponibles */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios disponibles</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map(time => {
                const isBooked = isTimeBooked(selectedDate, time)
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlotCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      selectedTime === time && { backgroundColor: theme.accent, borderColor: theme.accent },
                      isBooked && { backgroundColor: theme.border, borderColor: theme.border }
                    ]}
                    onPress={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                  >
                    <Clock size={16} color={isBooked ? theme.textMuted : (selectedTime === time ? theme.textLight : theme.accent)} />
                    <Text style={[
                      styles.timeSlotText,
                      { color: theme.text },
                      selectedTime === time && { color: theme.textLight },
                      isBooked && { color: theme.textMuted, textDecorationLine: 'line-through' }
                    ]}>
                      {time}
                    </Text>
                    {isBooked && (
                      <Text style={[styles.bookedText, { color: theme.textMuted }]}>Ocupado</Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Notas */}
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

        {/* Leyenda */}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        {!isAgent && !isAdmin ? (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerAction, favorite && { backgroundColor: colors.error }]}
              onPress={() => toggleFavorite(property.id)}
            >
              <Heart size={20} color={favorite ? '#fff' : theme.text} fill={favorite ? '#fff' : 'transparent'} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {/**importyanteeeeeeeee */}
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && { borderBottomColor: theme.accent }]}
          onPress={() => setActiveTab('info')}
        >
          <Info size={22} color={activeTab === 'info' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'info' ? theme.accent : theme.textMuted }]}>
            Informacion
          </Text>
        </TouchableOpacity>

        {isForSale && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'analysis' && { borderBottomColor: theme.accent }]}
            onPress={() => setActiveTab('analysis')}
          >
            <TrendingUp size={18} color={activeTab === 'analysis' ? theme.accent : theme.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'analysis' ? theme.accent : theme.textMuted }]}>
              Plusvalia
            </Text>
          </TouchableOpacity>
        )}

        {!isAgent && !isAdmin && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'calendar' && { borderBottomColor: theme.accent }]}
            onPress={() => setActiveTab('calendar')}
          >
            <Calendar size={18} color={activeTab === 'calendar' ? theme.accent : theme.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'calendar' ? theme.accent : theme.textMuted }]}>
              Agendar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
      </ScrollView>

      {/* Bottom CTA */}
      {isClient && (
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Phone size={20} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappButton}>
            <MessageCircle size={20} color="#25D366" />
          </TouchableOpacity>
          {activeTab === 'calendar' && selectedDate && selectedTime ? (
            <TouchableOpacity 
              style={[styles.scheduleButton, { backgroundColor: theme.accent }]}
              onPress={handleScheduleAppointment}
            >
              <Calendar size={20} color={theme.textLight} />
              <Text style={[styles.scheduleButtonText, { color: theme.textLight }]}>Confirmar Cita</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.scheduleButton, { backgroundColor: theme.accent }]}
              onPress={() => setActiveTab('calendar')}
            >
              <Calendar size={20} color={theme.textLight} />
              <Text style={[styles.scheduleButtonText, { color: theme.textLight }]}>Agendar Visita</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.body.fontSize,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,

  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: 24,
  },
  featuresCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  featureLabel: {
    fontSize: typography.caption.fontSize,
  },
  featureDivider: {
    width: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  featureChipText: {
    fontSize: typography.bodySmall.fontSize,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  locationCity: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: 2,
  },
  rentDetailsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  rentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rentDetailLabel: {
    fontSize: typography.body.fontSize,
  },
  rentDetailValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  rentDivider: {
    height: 1,
  },
  // Analysis tab styles
  valueCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  currentValueLabel: {
    fontSize: typography.bodySmall.fontSize,
  },
  currentValue: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  projectionNote: {
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic',
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  projectionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  projectionYear: {
    fontSize: typography.caption.fontSize,
  },
  projectionValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  projectionGrowth: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  costsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  costLabel: {
    fontSize: typography.body.fontSize,
  },
  costValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
  },
  costTotalLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  costTotalValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  roiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  roiInfo: {
    flex: 1,
  },
  roiLabel: {
    fontSize: typography.caption.fontSize,
  },
  roiValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginTop: 2,
  },
  // Calendar tab styles
  viewFilters: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
  },
  viewFilterBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  viewFilterText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  monthDayText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  aptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  aptDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotOutline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  legendText: {
    fontSize: typography.caption.fontSize,
  },
  daysScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  dayCard: {
    width: 60,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  dayName: {
    fontSize: typography.caption.fontSize,
    textTransform: 'capitalize',
  },
  dayNum: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlotCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  timeSlotText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  bookedText: {
    fontSize: 10,
  },
  notesInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bookedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  bookedInfoText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  whatsappButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  scheduleButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
