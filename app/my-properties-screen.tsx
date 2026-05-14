import { useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { mockProperties, formatCurrency } from '@/lib/mock-data'
import type { Property } from '@/lib/types'
import { 
  ArrowLeft,
  Plus,
  Home,
  Building2,
  Map,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react-native'

export default function MyPropertiesScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()

  const myProperties = useMemo(() => {
    if (!currentUser) return []
    return mockProperties.filter(p => p.ownerId === currentUser.id)
  }, [currentUser])

  const stats = useMemo(() => {
    const rented = myProperties.filter(p => p.status === 'rented').length
    const forSale = myProperties.filter(p => p.status === 'for_sale').length
    const forRent = myProperties.filter(p => p.status === 'for_rent').length
    const totalValue = myProperties.reduce((sum, p) => sum + (p.currentValue || p.price), 0)
    const monthlyIncome = myProperties
      .filter(p => p.status === 'rented' && p.monthlyRent)
      .reduce((sum, p) => sum + (p.monthlyRent || 0), 0)

    return { rented, forSale, forRent, totalValue, monthlyIncome }
  }, [myProperties])

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'owned': return 'Propio'
      case 'for_sale': return 'En Venta'
      case 'for_rent': return 'En Renta'
      case 'rented': return 'Rentado'
      default: return status
    }
  }

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'rented': return colors.success
      case 'for_sale': return colors.info
      case 'for_rent': return colors.warning
      default: return colors.textMuted
    }
  }

  const renderPropertyCard = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const statusColor = getStatusColor(property.status)

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/property-detail-screen?id=${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.propertyIconContainer}>
          <Icon size={32} color={colors.accent} />
        </View>

        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {getStatusLabel(property.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.propertyAddress} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>

          <View style={styles.propertyFooter}>
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Valor</Text>
              <Text style={styles.valueAmount}>
                {formatCurrency(property.currentValue || property.price)}
              </Text>
            </View>
            
            {property.status === 'rented' && property.monthlyRent && (
              <View style={styles.rentContainer}>
                <Text style={styles.rentLabel}>Renta/mes</Text>
                <Text style={styles.rentAmount}>
                  {formatCurrency(property.monthlyRent)}
                </Text>
              </View>
            )}

            <ChevronRight size={20} color={colors.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Propiedades</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-property-screen')}
        >
          <Plus size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <DollarSign size={20} color={colors.success} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.monthlyIncome)}</Text>
          <Text style={styles.statLabel}>Ingreso/mes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
            <TrendingUp size={20} color={colors.info} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.totalValue)}</Text>
          <Text style={styles.statLabel}>Valor total</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
            <Users size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValue}>{stats.rented}</Text>
          <Text style={styles.statLabel}>Rentadas</Text>
        </View>
      </View>

      {/* Lista de propiedades */}
      <FlatList
        data={myProperties}
        renderItem={renderPropertyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin propiedades</Text>
            <Text style={styles.emptyStateText}>
              Agrega tu primera propiedad para comenzar a administrar tu portafolio
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => router.push('/add-property-screen')}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.emptyStateButtonText}>Agregar propiedad</Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  propertyContent: {
    flex: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  propertyAddress: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  propertyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  valueContainer: {
    flex: 1,
  },
  valueLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  valueAmount: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  rentContainer: {
    flex: 1,
  },
  rentLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  rentAmount: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
})
