import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Modal,
  Pressable,
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
  ArrowLeft,
  X,
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
    addNewFavoriteProperty,
    newLoadCatalogProperties,
  } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent' | 'favorites'>('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'house' | 'apartment' | 'land'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const isInvestor = currentUser?.clientProfile === 'INVESTOR'
  const isTenant = currentUser?.clientProfile === 'TENANT'
  const isSearching = currentUser?.clientProfile === 'SEEKER'
  const theme = useMemo(() => {
    if (isInvestor) return clientThemes.investor
    if (isTenant) return clientThemes.tenant
    if (isSearching) return clientThemes.searching
    return null
  }, [isInvestor, isTenant, isSearching])

  useEffect(() => {
    if (catalogProperties.length === 0 && !isCatalogLoading) {
      //loadCatalogProperties()
      newLoadCatalogProperties()
    }
  }, [catalogProperties.length, isCatalogLoading, newLoadCatalogProperties])

  useEffect(() => {
    if (catalogProperties.length > 0) {
      console.log('Primer inmueble cargado en catalogProperties:', catalogProperties[0])
    }
  }, [catalogProperties])

  const filteredProperties = useMemo(() => {
    const catalogVisibleProperties = hasLoadedCatalog ? availableProperties : []

    return catalogVisibleProperties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filter === 'all' ||
        (filter === 'sale' && property.status === 'for_sale') ||
        (filter === 'rent' && property.status === 'for_rent') ||
        (filter === 'favorites' && isFavorite(property.id))

      const matchesType = propertyTypeFilter === 'all' || property.type === propertyTypeFilter
      
      return matchesSearch && matchesFilter && matchesType
    })
  }, [availableProperties, hasLoadedCatalog, searchQuery, filter, propertyTypeFilter])

  const backgroundColor = theme?.background || colors.background
  const surfaceColor = theme?.surface || colors.surface
  const borderColor = theme?.border || colors.border
  const textColor = theme?.text || colors.text
  const textSecondaryColor = theme?.textSecondary || colors.textSecondary
  const textMutedColor = theme?.textMuted || colors.textMuted
  const accentColor = theme?.accent || colors.accent
  const primaryColor = theme?.primary || colors.primary

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
    const hasImage = property.images && property.images.length > 0 && property.images[0]

    return (
      <TouchableOpacity 
        style={[styles.propertyCard, { backgroundColor: surfaceColor, borderColor }]}
        onPress={() => router.push(`/property/${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme?.primary || backgroundColor }]}>
          {hasImage ? (
            <Image
              source={{ uri: property.images![0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <Icon size={40} color={textMutedColor} />
          )}
          <View style={styles.badgeContainer}>
            <View style={[styles.locationBadge, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.locationBadgeText, { color: accentColor }]}>{property.city}</Text>
            </View>
            {isPending && (isAgent || isAdmin) && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>En Proceso</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              { backgroundColor: surfaceColor, borderColor },
              favorite && styles.favoriteButtonActive,
            ]}
            onPress={() => addNewFavoriteProperty(property.id)}
          >
            <Heart 
              size={18} 
              color={favorite ? '#fff' : textMutedColor} 
              fill={favorite ? '#fff' : 'transparent'}
            />
          </TouchableOpacity>

          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadge}>
              <Text style={styles.rentBadgeLabel}>RENTA</Text>
              <Text style={[styles.rentBadgePrice, { backgroundColor: accentColor, color: primaryColor }]}>
                {formatCurrency(property.monthlyRent)}/mes
              </Text>
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.cardContent}>
          <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={1}>{property.title}</Text>
          <Text style={[styles.propertyAddress, { color: textSecondaryColor }]} numberOfLines={1}>{property.address}</Text>

          {/* Separador */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Caracteristicas */}
          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>{property.bedrooms}</Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>{property.bathrooms}</Text>
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
            <Text style={[styles.price, { color: textColor }]}>{formatCurrency(property.price)}</Text>
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: accentColor }]}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Text style={[styles.viewButtonText, { color: primaryColor }]}>Ver mas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const handleBackToHome = () => {
    router.replace('/(tabs)')
  }

  const clearFilters = () => {
    setFilter('all')
    setPropertyTypeFilter('all')
  }

  const hasActiveFilters = filter !== 'all' || propertyTypeFilter !== 'all'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={[styles.headerBackButton, { backgroundColor: surfaceColor, borderColor }]}
            onPress={handleBackToHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={18} color={accentColor} />
            <Text style={[styles.headerBackButtonText, { color: textColor }]}>Volver</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: textColor }]}>Catalogo</Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          {hasActiveFilters ? (
            <TouchableOpacity
              style={[styles.headerClearButton, { backgroundColor: surfaceColor, borderColor }]}
              onPress={clearFilters}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.headerClearButtonText, { color: textColor }]}>Limpiar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerClearPlaceholder} />
          )}
        </View>
      </View>

      {/* Barra de busqueda */}
      <View style={[styles.searchContainer, { backgroundColor }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <Search size={20} color={textMutedColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar propiedades..."
            placeholderTextColor={textMutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: surfaceColor, borderColor }]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={accentColor} />
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
            <Building2 size={48} color={textMutedColor} />
            <Text style={[styles.emptyStateText, { color: textMutedColor }]}>
              {isCatalogLoading ? 'Cargando propiedades...' : 'No se encontraron propiedades'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable style={styles.filterOverlay} onPress={() => setShowFilters(false)}>
          <Pressable
            style={[styles.filterModal, { backgroundColor: surfaceColor, borderColor }]}
            onPress={() => {}}
          >
            <View style={[styles.filterHandle, { backgroundColor: borderColor }]} />
            <View style={styles.filterModalHeader}>
              <Text style={[styles.filterModalTitle, { color: textColor }]}>Filtros</Text>
              <TouchableOpacity
                style={[styles.filterModalClose, { backgroundColor, borderColor }]}
                onPress={() => setShowFilters(false)}
              >
                <X size={18} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: textSecondaryColor }]}>Operación</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'sale', label: 'Ventas' },
                  { key: 'rent', label: 'Rentas' },
                  { key: 'favorites', label: 'Favoritos' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterChip,
                      { backgroundColor, borderColor },
                      filter === option.key && { backgroundColor: accentColor, borderColor: accentColor },
                    ]}
                    onPress={() => setFilter(option.key as typeof filter)}
                  >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: textSecondaryColor },
                          filter === option.key && { color: primaryColor, fontWeight: '600' },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {option.label}
                      </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: textSecondaryColor }]}>Tipo</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'Todo tipo' },
                  { key: 'house', label: 'Casa' },
                  { key: 'apartment', label: 'Departamento' },
                  { key: 'land', label: 'Terreno' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterChip,
                      { backgroundColor, borderColor },
                      propertyTypeFilter === option.key && { backgroundColor: accentColor, borderColor: accentColor },
                    ]}
                    onPress={() => setPropertyTypeFilter(option.key as typeof propertyTypeFilter)}
                  >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: textSecondaryColor },
                          propertyTypeFilter === option.key && { color: primaryColor, fontWeight: '600' },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {option.label}
                      </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 112,
    justifyContent: 'center',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  headerBackButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  headerClearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  headerClearButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  headerClearPlaceholder: {
    width: 88,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 13, 24, 0.45)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    width: '100%',
    borderBottomWidth: 0,
    paddingBottom: spacing.xl,
  },
  filterHandle: {
    width: 48,
    height: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterModalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
  filterModalClose: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: typography.bodySmall.fontSize,
    flexShrink: 1,
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
    borderWidth: 1,
    borderColor: colors.border,
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
