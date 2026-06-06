import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  getAgentCommissionSummaries,
  getCommissionAgentName,
  getCommissionStatusInfo,
  getCommissionTotals,
  getVisibleCommissions,
  type CommissionScope,
} from '@/lib/services/commissions-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Building2,
  UserRound,
  Banknote,
} from 'lucide-react-native'

export default function CommissionsScreen() {
  const { getPropertyById } = usePropertyDomain()
  const { currentUser, isAdmin } = useSessionDomain()
  const [scope, setScope] = useState<CommissionScope>(isAdmin ? 'team' : 'mine')

  const visibleCommissions = useMemo(() => {
    return getVisibleCommissions({
      currentUserId: currentUser?.id,
      isAdmin,
      scope,
    })
  }, [currentUser?.id, isAdmin, scope])

  const { approved: totalApproved, paid: totalPaid, pending: totalPending, total } = useMemo(
    () => getCommissionTotals(visibleCommissions),
    [visibleCommissions],
  )

  const groupedByAgent = useMemo(() => getAgentCommissionSummaries(), [])

  const renderCommission = ({ item }: { item: typeof visibleCommissions[number] }) => {
    const property = getPropertyById(item.propertyId)
    const agentName = getCommissionAgentName(item.agentId)
    const statusInfo = getCommissionStatusInfo(item.status)
    const StatusIcon =
      item.status === 'paid' ? CheckCircle : item.status === 'approved' ? TrendingUp : Clock
    const statusColor =
      item.status === 'paid' ? colors.success : item.status === 'approved' ? colors.info : colors.warning

    return (
      <View style={styles.commissionCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: item.transactionType === 'sale' ? colors.success : colors.info }]}>
            <Text style={styles.typeBadgeText}>
              {item.transactionType === 'sale' ? 'VENTA' : 'RENTA'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.propertyRow}>
          <Building2 size={18} color={colors.accent} />
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property?.title || 'Propiedad'}
          </Text>
        </View>

        <View style={styles.agentRow}>
          <UserRound size={15} color={colors.textMuted} />
          <Text style={styles.agentText}>{agentName}</Text>
        </View>

        <View style={styles.commissionDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tasa</Text>
            <Text style={styles.detailValue}>{item.rate}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Monto</Text>
            <Text style={[styles.detailValue, styles.amount]}>{formatCurrency(item.amount)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.status === 'paid' && item.paidDate
              ? `Pagada: ${formatDate(item.paidDate)}`
              : `Registrada: ${formatDate(item.createdDate)}`}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isAdmin && (
        <View style={styles.scopeTabs}>
          <TouchableOpacity
            style={[styles.scopeTab, scope === 'team' && styles.scopeTabActive]}
            onPress={() => setScope('team')}
          >
            <Text style={[styles.scopeTabText, scope === 'team' && styles.scopeTabTextActive]}>
              Todos los asesores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scopeTab, scope === 'mine' && styles.scopeTabActive]}
            onPress={() => setScope('mine')}
          >
            <Text style={[styles.scopeTabText, scope === 'mine' && styles.scopeTabTextActive]}>
              Mis comisiones
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{isAdmin && scope === 'team' ? 'Comisiones del equipo' : 'Mis comisiones'}</Text>
          <Text style={styles.heroValue}>{formatCurrency(total)}</Text>
          <Text style={styles.heroMeta}>{visibleCommissions.length} operaciones registradas</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={20} color={colors.warning} />
            <Text style={styles.statLabel}>Pendiente</Text>
            <Text style={styles.statValue}>{formatCurrency(totalPending)}</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={colors.info} />
            <Text style={styles.statLabel}>Aprobada</Text>
            <Text style={styles.statValue}>{formatCurrency(totalApproved)}</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.statLabel}>Pagada</Text>
            <Text style={styles.statValue}>{formatCurrency(totalPaid)}</Text>
          </View>
        </View>
      </View>

      {isAdmin && scope === 'team' && (
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Resumen por asesor</Text>
          {groupedByAgent.map(agent => (
            <View key={agent.agentId} style={styles.agentSummaryCard}>
              <View>
                <Text style={styles.agentSummaryName}>{agent.name}</Text>
                <Text style={styles.agentSummaryMeta}>{agent.operations} operaciones</Text>
              </View>
              <View style={styles.agentSummaryValues}>
                <Text style={styles.agentSummaryTotal}>{formatCurrency(agent.total)}</Text>
                <Text style={styles.agentSummarySub}>Pendiente: {formatCurrency(agent.pending)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Detalle de comisiones</Text>
      </View>

      <FlatList
        data={visibleCommissions}
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
  scopeTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  scopeTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  scopeTabText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  scopeTabTextActive: {
    color: colors.primaryDark,
  },
  statsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  heroLabel: {
    color: colors.primaryDark + 'cc',
    fontSize: typography.bodySmall.fontSize,
  },
  heroValue: {
    color: colors.primaryDark,
    fontSize: 32,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  heroMeta: {
    color: colors.primaryDark + 'cc',
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  statValue: {
    color: colors.textLight,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  teamSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  agentSummaryCard: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentSummaryName: {
    color: colors.textLight,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  agentSummaryMeta: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  agentSummaryValues: {
    alignItems: 'flex-end',
  },
  agentSummaryTotal: {
    color: colors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  agentSummarySub: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  listHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
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
  },
  propertyTitle: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
    fontWeight: '600',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  agentText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
  },
  commissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
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
