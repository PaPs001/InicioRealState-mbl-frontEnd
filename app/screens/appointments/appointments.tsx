import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatDate } from '@/lib/mock-data'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react-native'

export default function AppointmentsStandaloneScreen() {
  const { userAppointments, getPropertyById, currentUser } = useAuth()
  const router = useRouter()
  
  // Detectar si es inversionista para usar tema oscuro
  const isInvestor = currentUser?.role === 'investor'
  const theme = isInvestor ? clientThemes.investor : null

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmada', color: colors.success, Icon: CheckCircle }
      case 'pending':
        return { label: 'Pendiente', color: colors.warning, Icon: AlertCircle }
      case 'completed':
        return { label: 'Completada', color: colors.info, Icon: CheckCircle }
      case 'cancelled':
        return { label: 'Cancelada', color: colors.error, Icon: XCircle }
      default:
        return { label: 'Pendiente', color: colors.textMuted, Icon: AlertCircle }
    }
  }

  const renderAppointment = ({ item }: { item: typeof userAppointments[0] }) => {
    const property = getPropertyById(item.propertyId)
    const statusInfo = getStatusInfo(item.status)
    const StatusIcon = statusInfo.Icon

    return (
      <View style={[
        styles.appointmentCard,
        isInvestor && { backgroundColor: theme!.surface, borderColor: theme!.border }
      ]}>
        <View style={styles.dateContainer}>
          <Calendar size={20} color={isInvestor ? theme!.accent : colors.accent} />
          <Text style={[styles.dateText, isInvestor && { color: theme!.text }]}>
            {formatDate(item.date)}
          </Text>
          <View style={[
            styles.timeContainer,
            isInvestor && { backgroundColor: theme!.background }
          ]}>
            <Clock size={14} color={isInvestor ? theme!.textMuted : colors.textMuted} />
            <Text style={[styles.timeText, isInvestor && { color: theme!.textSecondary }]}>
              {item.time}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, isInvestor && { backgroundColor: theme!.border }]} />

        <View style={styles.propertyInfo}>
          <Text style={[styles.propertyTitle, isInvestor && { color: theme!.text }]} numberOfLines={1}>
            {property?.title || 'Propiedad'}
          </Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color={isInvestor ? theme!.textMuted : colors.textMuted} />
            <Text style={[styles.addressText, isInvestor && { color: theme!.textSecondary }]} numberOfLines={1}>
              {property?.address || 'Direccion no disponible'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <StatusIcon size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView 
      style={[styles.container, isInvestor && { backgroundColor: theme!.background }]} 
      edges={['top', 'bottom']}
    >
      {/* Header personalizado */}
      <View style={[
        styles.header,
        isInvestor && { borderBottomColor: theme!.border }
      ]}>
        <TouchableOpacity 
          style={[styles.backButton, isInvestor && { backgroundColor: theme!.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isInvestor ? theme!.text : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isInvestor && { color: theme!.text }]}>Mis Citas</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={userAppointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={isInvestor ? theme!.textMuted : colors.textMuted} />
            <Text style={[styles.emptyStateTitle, isInvestor && { color: theme!.text }]}>
              Sin citas programadas
            </Text>
            <Text style={[styles.emptyStateText, isInvestor && { color: theme!.textSecondary }]}>
              Explora el catalogo y agenda una visita a las propiedades que te interesen
            </Text>
            <TouchableOpacity 
              style={[styles.exploreButton, isInvestor && { backgroundColor: theme!.accent }]}
              onPress={() => router.push('/catalog-screen')}
            >
              <Text style={[styles.exploreButtonText, isInvestor && { color: theme!.primary }]}>
                Explorar Catalogo
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  timeText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  propertyInfo: {
    marginBottom: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addressText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  exploreButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  exploreButtonText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
