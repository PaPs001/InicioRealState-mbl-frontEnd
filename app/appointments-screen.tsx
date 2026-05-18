import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatDate } from '@/lib/mock-data'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react-native'

export default function AppointmentsStandaloneScreen() {
  const { userAppointments, getPropertyById } = useAuth()
  const router = useRouter()

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Citas</Text>
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
            <Calendar size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin citas programadas</Text>
            <Text style={styles.emptyStateText}>
              Explora el catalogo y agenda una visita a las propiedades que te interesen
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/catalog-screen')}
            >
              <Text style={styles.exploreButtonText}>Explorar Catalogo</Text>
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
    paddingVertical: spacing.md,
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
