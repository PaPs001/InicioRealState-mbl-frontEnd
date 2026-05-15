import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Modal 
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import type { Property } from '@/lib/types'
import { 
  Search, 
  Filter, 
  Heart, 
  Bed, 
  Bath, 
  Maximize, 
  Home,
  Building2,
  Map
} from 'lucide-react-native'

export default function CatalogScreen() {
  const {
    availableProperties,
    toggleFavorite,
    isFavorite,
    isAgent,
    isAdmin,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
    currentUser,
  } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Detectar tipo de usuario para aplicar tema
  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const theme = isInvestor ? clientThemes.investor : isSearching ? clientThemes.searching : null

  useEffect(() => {
    if (catalogProperties.length === 0 && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [catalogProperties.length, isCatalogLoading, loadCatalogProperties])

  const filteredProperties = useMemo(() => {
    const catalogVisibleProperties = hasLoadedCatalog ? availableProperties : []

    return catalogVisibleProperties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filter === 'all' ||
        (filter === 'sale' && (property.status === 'for_sale' || property.status === 'available')) ||
        (filter === 'rent' && (property.status === 'for_rent' || property.status === 'available'))
      
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

  const renderPropertyCard = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const favorite = isFavorite(property.id)
    const isPending = property.status === 'pending_sale' || property.status === 'pending_rent'

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/property/${property.id}`)}
        activeOpacity={0.7}
      >
        {/* Imagen placeholder */}
        <View style={styles.imageContainer}>
          <Icon size={40} color={colors.textMuted} />
          {
            // TODO: Reemplazar con imagen real cuando esté disponible
          }
          {/*<Image source={property.images?.[0] ? { uri: property.images?.[0] } /> : require('@/assets/placeholder.png')} style={styles.propertyImage} />*/}
          
          {/* Badge de ubicacion */}
          <View style={styles.badgeContainer}>
            <View style={styles.locationBadge}>
              <Text style={styles.locationBadgeText}>{property.city}</Text>
            </View>
            {isPending && (isAgent || isAdmin) && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>En Proceso</Text>
              </View>
            )}
          </View>

          {/* Boton favorito */}
          <TouchableOpacity 
            style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(property.id)}
          >
            <Heart 
              size={18} 
              color={favorite ? '#fff' : colors.textMuted} 
              fill={favorite ? '#fff' : 'transparent'}
            />
          </TouchableOpacity>

          {/* Badge de renta */}
          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadge}>
              <Text style={styles.rentBadgeLabel}>RENTA</Text>
              <Text style={styles.rentBadgePrice}>
                {formatCurrency(property.monthlyRent)}/mes
              </Text>
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>{property.address}</Text>

          {/* Separador */}
          <View style={styles.divider} />

          {/* Caracteristicas */}
          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bedrooms}</Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bathrooms}</Text>
                </View>
              </>
            )}
            {/*<View style={styles.feature}>
              <Maximize size={16} color={colors.textMuted} />
              <Text style={styles.featureText}>{property.sqMeters}m2</Text>
            </View>*/}
          </View>

          {/* Precio */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(property.price)}</Text>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Text style={styles.viewButtonText}>Ver mas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.container, theme && { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Barra de busqueda */}
      <View style={[styles.searchContainer, theme && { backgroundColor: theme.background }]}>
        <View style={[styles.searchInputContainer, theme && { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme?.textMuted || colors.textMuted} />
          <TextInput
            style={[styles.searchInput, theme && { color: theme.text }]}
            placeholder="Buscar propiedades..."
            placeholderTextColor={theme?.textMuted || colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, theme && { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={theme?.accent || colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Tabs de filtro */}
      <View style={[styles.filterTabs, theme && { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive, filter === 'all' && theme && { backgroundColor: theme.accent }]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive, filter === 'all' && theme && { color: theme.textLight }]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'sale' && styles.filterTabActive, filter === 'sale' && theme && { backgroundColor: theme.accent }]}
          onPress={() => setFilter('sale')}
        >
          <Text style={[styles.filterTabText, filter === 'sale' && styles.filterTabTextActive, filter === 'sale' && theme && { color: theme.textLight }]}>
            Venta
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'rent' && styles.filterTabActive, filter === 'rent' && theme && { backgroundColor: theme.accent }]}
          onPress={() => setFilter('rent')}
        >
          <Text style={[styles.filterTabText, filter === 'rent' && styles.filterTabTextActive, filter === 'rent' && theme && { color: theme.textLight }]}>
            Renta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'sale' && styles.filterTabActive]}
          onPress={() => setFilter('sale')}
        >
          <Text style={[styles.filterTabText, filter === 'sale' && styles.filterTabTextActive]}>
            Favoritos
          </Text>
        </TouchableOpacity>
      </View>
      

      {/* Lista de propiedades */}
      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={colors.textMuted} />
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
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  propertyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 180,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  locationBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  locationBadgeText: {
    color: colors.accent,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  pendingBadge: {
    backgroundColor: colors.info,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.error,
  },
  rentBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: '50%',
    transform: [{ translateX: -60 }],
    alignItems: 'center',
  },
  rentBadgeLabel: {
    backgroundColor: colors.error,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  rentBadgePrice: {
    backgroundColor: colors.accent,
    color: colors.primary,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  propertyAddress: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  viewButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  viewButtonText: {
    color: colors.primary,
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
