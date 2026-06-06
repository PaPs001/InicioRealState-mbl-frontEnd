import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/lib/theme'
import { usePublicPropertyDetail } from '@/lib/hooks/use-public-property-detail'
import { PropertyAnalysisTab } from '@/components/property-detail/PropertyAnalysisTab'
import { PropertyCalendarTab } from '@/components/property-detail/PropertyCalendarTab'
import { PropertyDetailTabs } from '@/components/property-detail/PropertyDetailTabs'
import { PropertyInfoTab } from '@/components/property-detail/PropertyInfoTab'
import { styles } from '@/components/property-detail/styles'
import { 
  Heart, 
  Calendar,
  Phone,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react-native'

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const {
    theme,
    isTenant,
    isClient,
    isAgent,
    isAdmin,
    property,
    favorite,
    isForSale,
    isForRent,
    headerSurfaceColor,
    propertyAnalysis,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    notes,
    setNotes,
    calendarView,
    setCalendarView,
    currentMonth,
    favoriteToggle,
    handleScheduleAppointment,
    monthDays,
    weekDays,
    dayNames,
    monthNames,
    timeSlots,
    selectedDateLabel,
    isTimeBooked,
    isToday,
    isPast,
    hasAppointments,
    formatDateStr,
    nextMonth,
    prevMonth,
  } = usePublicPropertyDetail(id)

  if (!property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.textMuted }]}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const analysis = propertyAnalysis

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerSurfaceColor, borderBottomColor: theme.border }]}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Más información</Text>
        <View style={[styles.headerSide, styles.headerActions]}>
          {!isAgent && !isAdmin ? (
            <TouchableOpacity 
              style={[
                styles.headerAction,
                { backgroundColor: theme.background, borderColor: theme.border },
                favorite && { backgroundColor: colors.error, borderColor: colors.error },
              ]}
              onPress={() => favoriteToggle(property.id)}
            >
              <Heart size={20} color={favorite ? '#fff' : theme.text} fill={favorite ? '#fff' : 'transparent'} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>
      </View>

      {/* Imagenes NO LO OLVIDES CHECAAAAAAAAR */}
      {property.images && property.images.length > 0 && property.images[0] && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.images[0] }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        </View>
      )}

      <PropertyDetailTabs
        activeTab={activeTab}
        isForSale={isForSale}
        isStaffUser={isAgent || isAdmin}
        setActiveTab={setActiveTab}
        theme={theme}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' ? <PropertyInfoTab isForRent={isForRent} property={property} theme={theme} /> : null}
        {activeTab === 'analysis' && analysis ? <PropertyAnalysisTab analysis={analysis} theme={theme} /> : null}
        {activeTab === 'calendar' ? (
          <PropertyCalendarTab
            calendarView={calendarView}
            currentMonth={currentMonth}
            dayNames={dayNames}
            formatDateStr={formatDateStr}
            hasAppointments={hasAppointments}
            isPast={isPast}
            isTimeBooked={isTimeBooked}
            isToday={isToday}
            monthDays={monthDays}
            monthNames={monthNames}
            nextMonth={nextMonth}
            notes={notes}
            prevMonth={prevMonth}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedTime={selectedTime}
            setCalendarView={setCalendarView}
            setNotes={setNotes}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            theme={theme}
            timeSlots={timeSlots}
            weekDays={weekDays}
          />
        ) : null}
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
