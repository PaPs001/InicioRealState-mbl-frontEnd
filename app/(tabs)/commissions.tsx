import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency, formatDate, mockCommissions } from '@/lib/mock-data'
import { 
  Wallet, 
  TrendingUp, 
  Clock,
  CheckCircle,
  DollarSign,
  Building2
} from 'lucide-react-native'

export default function CommissionsScreen() {
  const { getPropertyById } = useAuth()

  const totalPending = mockCommissions
    .filter(c => c.status === 'pending')
    .reduce((acc, c) => acc + c.amount, 0)

  const totalPaid = mockCommissions
    .filter(c => c.status === 'paid')
    .reduce((acc, c) => acc + c.amount, 0)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagada', color: colors.success, Icon: CheckCircle }
      case 'pending':
        return { label: 'Pendiente', color: colors.warning, Icon: Clock }
      case 'approved':
        return { label: 'Aprobada', color: colors.info, Icon: TrendingUp }
      default:
        return { label: 'Pendiente', color: colors.textMuted, Icon: Clock }
    }
  }

  const renderCommission = ({ item }: { item: typeof mockCommissions[0] }) => {
    const property = getPropertyById(item.propertyId)
    const statusInfo = getStatusInfo(item.status)
    const StatusIcon = statusInfo.Icon

    return (
      <View style={styles.commissionCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: item.transactionType === 'sale' ? colors.success : colors.info }]}>
            <Text style={styles.typeBadgeText}>
              {item.transactionType === 'sale' ? 'VENTA' : 'RENTA'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <StatusIcon size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.propertyRow}>
          <Building2 size={18} color={colors.accent} />
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property?.title || 'Propiedad'}
          </Text>
        </View>

        <View style={styles.commissionDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tasa</Text>
            <Text style={styles.detailValue}>{item.rate}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Comision</Text>
            <Text style={[styles.detailValue, styles.amount]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.status === 'paid' && item.paidDate 
              ? `Pagada: ${formatDate(item.paidDate)}`
              : `Registrada: ${formatDate(item.createdDate)}`
            }
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Clock size={24} color={colors.warning} />
          </View>
          <Text style={styles.statLabel}>Pendiente</Text>
          <Text style={styles.statValue}>{formatCurrency(totalPending)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <CheckCircle size={24} color={colors.success} />
          </View>
          <Text style={styles.statLabel}>Pagado</Text>
          <Text style={styles.statValue}>{formatCurrency(totalPaid)}</Text>
        </View>
      </View>

      {/* Lista de comisiones */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Historial de Comisiones</Text>
      </View>

      <FlatList
        data={mockCommissions}
        renderItem={renderCommission}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Wallet size={48} color={colors.borderDark} />
            <Text style={styles.emptyStateText}>Sin comisiones registradas</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.accent,
  },
  listHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  commissionCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  propertyTitle: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  commissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  amount: {
    color: colors.accent,
    fontSize: typography.h4.fontSize,
  },
  cardFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  dateText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
})
