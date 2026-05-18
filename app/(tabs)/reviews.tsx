import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  Building2,
  User,
  DollarSign,
  AlertCircle
} from 'lucide-react-native'

// Datos mock de registros pendientes
const mockPendingRegistrations = [
  {
    id: 'reg-1',
    type: 'sale',
    propertyTitle: 'Departamento Vista al Mar',
    agentName: 'Ana Lopez',
    clientName: 'Pedro Hernandez',
    amount: 4200000,
    commissionAmount: 210000,
    status: 'pending_review',
    createdDate: '2024-05-03',
  },
  {
    id: 'reg-2',
    type: 'rent',
    propertyTitle: 'Penthouse en Santa Fe',
    agentName: 'Ana Lopez',
    clientName: 'Laura Diaz',
    amount: 85000,
    commissionAmount: 8500,
    status: 'pending_review',
    createdDate: '2024-05-02',
  },
]

export default function ReviewsScreen() {
  const handleApprove = (id: string) => {
    Alert.alert(
      'Aprobar Registro',
      'Estas seguro de aprobar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprobar', onPress: () => console.log('Aprobado:', id) }
      ]
    )
  }

  const handleReject = (id: string) => {
    Alert.alert(
      'Rechazar Registro',
      'Estas seguro de rechazar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: () => console.log('Rechazado:', id) }
      ]
    )
  }

  const renderRegistration = ({ item }: { item: typeof mockPendingRegistrations[0] }) => (
    <View style={styles.registrationCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'sale' ? colors.success : colors.info }]}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'sale' ? 'VENTA' : 'RENTA'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <AlertCircle size={14} color={colors.warning} />
          <Text style={styles.statusBadgeText}>Pendiente</Text>
        </View>
      </View>

      <View style={styles.propertyRow}>
        <Building2 size={20} color={colors.accent} />
        <Text style={styles.propertyTitle}>{item.propertyTitle}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Asesor</Text>
          <Text style={styles.infoValue}>{item.agentName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cliente</Text>
          <Text style={styles.infoValue}>{item.clientName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Monto</Text>
          <Text style={styles.infoValue}>{formatCurrency(item.amount)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Comision</Text>
          <Text style={[styles.infoValue, { color: colors.accent }]}>
            {formatCurrency(item.commissionAmount)}
          </Text>
        </View>
      </View>

      <Text style={styles.dateText}>Registrado: {formatDate(item.createdDate)}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.viewButton}>
          <Eye size={18} color={colors.accent} />
          <Text style={styles.viewButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
        
        <View style={styles.decisionButtons}>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
          >
            <XCircle size={18} color={colors.error} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
          >
            <CheckCircle size={18} color={colors.success} />
            <Text style={styles.approveButtonText}>Aprobar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registros Pendientes</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{mockPendingRegistrations.length}</Text>
        </View>
      </View>

      <FlatList
        data={mockPendingRegistrations}
        renderItem={renderRegistration}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={colors.success} />
            <Text style={styles.emptyStateTitle}>Todo al dia</Text>
            <Text style={styles.emptyStateText}>
              No hay registros pendientes de revision
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
    backgroundColor: colors.primaryDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  countBadge: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  countBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  listContent: {
    padding: spacing.md,
  },
  registrationCard: {
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
    backgroundColor: colors.warning + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.warning,
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
    fontWeight: '600',
    color: colors.textLight,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  infoItem: {
    width: '45%',
  },
  infoLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  dateText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewButtonText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  approveButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
})
