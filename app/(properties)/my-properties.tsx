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
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { mockProperties, formatCurrency } from '@/lib/mock-data'
import type { Property } from '@/lib/types'
import { 
  ArrowLeft,
  Plus,
  Home,
  Building2,
  Map,
  MapPin,
  ChevronRight,
} from 'lucide-react-native'

const investorColors = clientThemes.investor

export default function MyPropertiesScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()

  const myProperties = useMemo(() => {
    if (!currentUser) return []
    return mockProperties.filter(p => p.ownerId === currentUser.id)
  }, [currentUser])

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
      default: return investorColors.textMuted
    }
  }

  const renderPropertyCard = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const statusColor = getStatusColor(property.status)

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/property-detail?id=${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.propertyIconContainer}>
          <Icon size={32} color={investorColors.accent} />
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

          <View style={styles.locationRow}>
            <MapPin size={14} color={investorColors.textMuted} />
            <Text style={styles.propertyAddress} numberOfLines={1}>
              {property.address}, {property.city}
            </Text>
          </View>

          <View style={styles.propertyFooter}>
            <Text style={styles.propertyValue}>
              {formatCurrency(property.currentValue || property.price)}
            </Text>
            <ChevronRight size={20} color={investorColors.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={investorColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Propiedades</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-property')}
        >
          <Plus size={24} color={investorColors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {myProperties.length} {myProperties.length === 1 ? 'propiedad' : 'propiedades'} en tu portafolio
        </Text>
      </View>

      <FlatList
        data={myProperties}
        renderItem={renderPropertyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={investorColors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin propiedades</Text>
            <Text style={styles.emptyStateText}>
              Agrega tu primera propiedad para comenzar a monitorear tu portafolio
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => router.push('/add-property')}
            >
              <Plus size={20} color={investorColors.primary} />
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
    backgroundColor: investorColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  counterText: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  propertyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: investorColors.accent + '15',
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
    color: investorColors.text,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  propertyAddress: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    flex: 1,
  },
  propertyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  propertyValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: investorColors.accent,
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
    color: investorColors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: investorColors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
})
