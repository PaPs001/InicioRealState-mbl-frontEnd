import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Image,
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
  Home,
  Building2,
  Map,
  ArrowLeft
} from 'lucide-react-native'

export default function CatalogStandaloneScreen() {
  const {
    availableProperties,
    toggleFavorite,
    isFavorite,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
    favorites,
    currentUser,
  } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all')

  // Determinar tema segun rol
  const theme = useMemo(() => {
    if (currentUser?.role === 'investor') return clientThemes.investor
    if (currentUser?.role === 'tenant') return clientThemes.tenant
    if (currentUser?.role === 'searching') return clientThemes.searching
    // Tema por defecto para clientes
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      border: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textLight: colors.textInverse,
    }
  }, [currentUser?.role])

  // Cargar catalogo de clientes
  useEffect(() => {
    if (catalogProperties.length === 0 && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [catalogProperties.length, isCatalogLoading, loadCatalogProperties])

  const filteredProperties = useMemo(() => {
    const properties = hasLoadedCatalog ? availableProperties : []

    return properties.filter(property => {
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
    const hasImage = property.images && property.images.length > 0 && property.images[0]

    return (
      <TouchableOpacity 
        style={[styles.propertyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push(`/property/${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
          {hasImage ? (
            <Image 
              source={{ uri: property.images![0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <Icon size={40} color={theme.textMuted} />
          )}
          
          <View style={styles.badgeContainer}>
            <View style={[styles.locationBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.locationBadgeText, { color: theme.accent }]}>{property.city}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.favoriteButton, 
              favorite && styles.favoriteButtonActive,
              !favorite && { backgroundColor: theme.surface }
            ]}
            onPress={() => toggleFavorite(property.id)}
          >
            <Heart 
              size={18} 
              color={favorite ? '#fff' : theme.textMuted} 
              fill={favorite ? '#fff' : 'transparent'}
            />
          </TouchableOpacity>

          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadge}>
              <Text style={styles.rentBadgeLabel}>RENTA</Text>
              <Text style={[styles.rentBadgePrice, { backgroundColor: theme.accent }]}>
                {formatCurrency(property.monthlyRent)}/mes
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.propertyTitle, { color: theme.text }]} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={[styles.propertyAddress, { color: theme.textSecondary }]} numberOfLines={1}>
            {property.address}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={theme.textMuted} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    {property.bedrooms}
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={theme.textMuted} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    {property.bathrooms}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              {formatCurrency(property.price)}
            </Text>
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: theme.accent }]}
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
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top', 'bottom']}
    >
      {/* Header personalizado */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Catalogo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar propiedades..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {(['all', 'sale', 'rent'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                filter === filterOption && [styles.filterChipActive, { backgroundColor: theme.accent, borderColor: theme.accent }],
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: theme.textSecondary },
                  filter === filterOption && styles.filterChipTextActive,
                ]}
              >
                {filterOption === 'all' ? 'Todos' : filterOption === 'sale' ? 'Venta' : 'Renta'}
              </Text>
            </TouchableOpacity>
          ))}
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
              <Building2 size={48} color={theme.textMuted} />
              <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                {isCatalogLoading ? 'Cargando propiedades...' : 'No se encontraron propiedades'}
              </Text>
            </View>
          }
        />
      </View>
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
    paddingVertical: spacing.xxl,
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
  favoritesButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
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
