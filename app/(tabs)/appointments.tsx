import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useActivityDomain } from '@/contexts/auth/use-activity-domain'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native'

export default function AppointmentsScreen() {
  const { userAppointments } = useActivityDomain()
  const { getPropertyById } = usePropertyDomain()

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
      <View style={styles.appointmentCard}>
        <View style={styles.dateContainer}>
          <Calendar size={20} color={colors.accent} />
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property?.title || 'Propiedad'}
          </Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.addressText} numberOfLines={1}>
              {property?.address || 'Dirección no disponible'}
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={userAppointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin citas programadas</Text>
            <Text style={styles.emptyStateText}>
              Explora el catálogo y agenda una visita a las propiedades que te interesen
            </Text>
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
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
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
})
