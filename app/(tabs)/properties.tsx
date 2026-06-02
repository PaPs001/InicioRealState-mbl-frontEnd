import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput 
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import type { Property } from '@/lib/types'
import { 
  Search, 
  Home,
  Building2,
  Map,
  Bed,
  Bath,
  Maximize,
  MapPin
} from 'lucide-react-native'

export default function PropertiesScreen() {
  const { availableProperties, isCatalogLoading, hasLoadedCatalog, loadCatalogProperties } = useAuth()
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
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filter === 'all' ||
        (filter === 'sale' && (property.status === 'for_sale' || property.status === 'available' || property.status === 'pending_sale')) ||
        (filter === 'rent' && (property.status === 'for_rent' || property.status === 'available' || property.status === 'pending_rent'))
      
      return matchesSearch && matchesFilter
    })
  }, [availableProperties, hasLoadedCatalog, searchQuery, filter])

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
      case 'for_sale': return { label: 'En Venta', color: colors.success }
      case 'for_rent': return { label: 'En Renta', color: colors.info }
      case 'available': return { label: 'Disponible', color: colors.accent }
      case 'pending_sale': return { label: 'Venta en Proceso', color: colors.warning }
      case 'pending_rent': return { label: 'Renta en Proceso', color: colors.warning }
      case 'rented': return { label: 'Rentada', color: colors.textMuted }
      default: return { label: 'Disponible', color: colors.textMuted }
    }
  }

  const renderProperty = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const status = getStatusLabel(property.status)

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/property/${property.id}`)}
      >
        <View style={styles.imageContainer}>
          <Icon size={32} color={colors.borderDark} />
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.locationText}>{property.city}</Text>
          </View>

          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={14} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bedrooms}</Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={14} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bathrooms}</Text>
                </View>
              </>
            )}
            {/*<View style={styles.feature}>
              <Maximize size={14} color={colors.textMuted} />
              <Text style={styles.featureText}>{property.sqMeters}m2</Text>
            </View>*/}
          </View>

          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          {property.monthlyRent && (
            <Text style={styles.rentPrice}>
              Renta: {formatCurrency(property.monthlyRent)}/mes
            </Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Barra de busqueda */}
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

      {/* Tabs de filtro */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'sale' && styles.filterTabActive]}
          onPress={() => setFilter('sale')}
        >
          <Text
            style={[styles.filterTabText, filter === 'sale' && styles.filterTabTextActive]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Ventas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'rent' && styles.filterTabActive]}
          onPress={() => setFilter('rent')}
        >
          <Text
            style={[styles.filterTabText, filter === 'rent' && styles.filterTabTextActive]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Rentas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de propiedades */}
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    flexShrink: 1,
  },
  filterTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  imageContainer: {
    width: 100,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
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
  },
  features: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
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
  price: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.accent,
    marginTop: spacing.sm,
  },
  rentPrice: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
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
