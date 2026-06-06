import { useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { getPropertyAgentName, getPropertyOwnerName } from '@/lib/services/property-domain'
import type { Property } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  Search,
  Home,
  Building2,
  Map,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Plus,
  ChevronRight,
  UserRound,
  ShieldCheck,
} from 'lucide-react-native'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'

export default function PropertiesScreen() {
  const { availableProperties, isCatalogLoading, hasLoadedCatalog, loadCatalogProperties } = usePropertyDomain()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all')

  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const filteredProperties = useMemo(() => {
    const visibleProperties = hasLoadedCatalog ? availableProperties : []

    return visibleProperties.filter(property => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'sale' &&
          (property.status === 'for_sale' || property.status === 'available' || property.status === 'pending_sale')) ||
        (filter === 'rent' &&
          (property.status === 'for_rent' || property.status === 'available' || property.status === 'pending_rent'))

      return matchesSearch && matchesFilter
    })
  }, [availableProperties, hasLoadedCatalog, searchQuery, filter])

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'house':
        return Home
      case 'apartment':
        return Building2
      case 'land':
        return Map
      default:
        return Home
    }
  }

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'for_sale':
        return { label: 'En venta', color: colors.success }
      case 'for_rent':
        return { label: 'En renta', color: colors.info }
      case 'available':
        return { label: 'Disponible', color: colors.accent }
      case 'pending_sale':
        return { label: 'Venta en proceso', color: colors.warning }
      case 'pending_rent':
        return { label: 'Renta en proceso', color: colors.warning }
      case 'rented':
        return { label: 'Rentada', color: colors.textMuted }
      default:
        return { label: 'Disponible', color: colors.textMuted }
    }
  }

  const renderProperty = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const status = getStatusLabel(property.status)
    const agentName = getPropertyAgentName(property)
    const ownerName = getPropertyOwnerName(property)

    return (
      <TouchableOpacity style={styles.propertyCard} onPress={() => router.push(`/property/${property.id}`)}>
        <View style={styles.cardTopRow}>
          <View style={styles.imageContainer}>
            <Icon size={32} color={colors.accent} />
          </View>
          <View style={styles.headerInfo}>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}22` }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {property.address}, {property.city}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.features}>
          {property.type !== 'land' && (
            <>
              <View style={styles.feature}>
                <Bed size={14} color={colors.textMuted} />
                <Text style={styles.featureText}>{property.bedrooms || 0} rec</Text>
              </View>
              <View style={styles.feature}>
                <Bath size={14} color={colors.textMuted} />
                <Text style={styles.featureText}>{property.bathrooms || 0} baños</Text>
              </View>
            </>
          )}
          <View style={styles.feature}>
            <Maximize size={14} color={colors.textMuted} />
            <Text style={styles.featureText}>{property.sqMeters} m²</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Precio</Text>
            <Text style={styles.metaValue}>{formatCurrency(property.price)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Renta mensual</Text>
            <Text style={styles.metaValue}>
              {property.monthlyRent ? formatCurrency(property.monthlyRent) : 'No aplica'}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {property.description || 'Sin descripción disponible.'}
        </Text>

        <View style={styles.peopleRow}>
          <View style={styles.personChip}>
            <UserRound size={13} color={colors.textMuted} />
            <Text style={styles.personChipText}>{agentName}</Text>
          </View>
          <View style={styles.personChip}>
            <ShieldCheck size={13} color={colors.textMuted} />
            <Text style={styles.personChipText}>{ownerName}</Text>
          </View>
        </View>

        {property.features?.length ? (
          <View style={styles.tagRow}>
            {property.features.slice(0, 3).map(feature => (
              <View key={feature} style={styles.tag}>
                <Text style={styles.tagText}>{feature}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Ver información completa</Text>
          <ChevronRight size={18} color={colors.accent} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar propiedades..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-property')}>
          <Plus size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Propiedades</Text>
          <Text style={styles.pageSubtitle}>Agrega más inmuebles y consulta datos clave del catálogo.</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/list-property')}>
          <Text style={styles.secondaryButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, filter === 'all' && styles.filterTabActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'sale' && styles.filterTabActive]} onPress={() => setFilter('sale')}>
          <Text style={[styles.filterTabText, filter === 'sale' && styles.filterTabTextActive]}>Ventas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'rent' && styles.filterTabActive]} onPress={() => setFilter('rent')}>
          <Text style={[styles.filterTabText, filter === 'rent' && styles.filterTabTextActive]}>Rentas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={colors.borderDark} />
            <Text style={styles.emptyStateText}>
              {isCatalogLoading ? 'Cargando propiedades...' : 'No se encontraron propiedades'}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  pageSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    maxWidth: 260,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
  },
  secondaryButtonText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: typography.bodySmall.fontSize,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  filterTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterTabText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.primaryDark,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  propertyCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageContainer: {
    width: 74,
    height: 74,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  headerInfo: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    flex: 1,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  metaLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  personChipText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '18',
  },
  tagText: {
    color: colors.accent,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textLight,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
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
