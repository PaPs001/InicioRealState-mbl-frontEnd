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
  Home,
  Building2,
  Map,
  ArrowLeft,
  X
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
        (filter === 'sale' && property.status === 'for_sale') ||
        (filter === 'rent' && property.status === 'for_rent') ||
        (filter === 'favorites' && isFavorite(property.id))

      const matchesType = propertyTypeFilter === 'all' || property.type === propertyTypeFilter
      
      return matchesSearch && matchesFilter && matchesType
    })
  }, [availableProperties, hasLoadedCatalog, searchQuery, filter, propertyTypeFilter])

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

    console.log('[v0] DEBUG - currentUser?.role:', currentUser?.clientProfile, 'isInvestor:', isInvestor, 'theme:', theme ? 'EXISTS' : 'NULL')

    // Colores de la card segun tema
    const cardBg = theme?.surface || colors.surface
    const cardBorder = theme?.border || colors.border
    const imageBg = theme?.primary || colors.background
    const textColor = theme?.text || colors.text
    const textSecondaryColor = theme?.textSecondary || colors.textSecondary
    const textMutedColor = theme?.textMuted || colors.textMuted
    const accentColor = theme?.accent || colors.accent
    const primaryColor = theme?.primary || colors.primary

    return (
      <TouchableOpacity 
        style={[styles.propertyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        onPress={() => router.push(`/property/${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.imageContainer, { backgroundColor: imageBg }]}>
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
            <View style={[styles.locationBadge, { backgroundColor: cardBg }]}>
              <Text style={[styles.locationBadgeText, { color: accentColor }]}>{property.city}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.favoriteButton, { backgroundColor: cardBg }, favorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(property.id)}
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

        <View style={[styles.cardContent, { backgroundColor: cardBg }]}>
          <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={[styles.propertyAddress, { color: textSecondaryColor }]} numberOfLines={1}>
            {property.address}
          </Text>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>
                    {property.bedrooms}
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>
                    {property.bathrooms}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: textColor }]}>
              {formatCurrency(property.price)}
            </Text>
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: accentColor }]}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Text style={[styles.viewButtonText, { color: primaryColor }]}>
                Ver mas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Colores globales para el componente
  const bgColor = theme?.background || colors.background
  const surfaceColor = theme?.surface || colors.surface
  const borderColor = theme?.border || colors.border
  const textColor = theme?.text || colors.text
  const textSecondaryColor = theme?.textSecondary || colors.textSecondary
  const textMutedColor = theme?.textMuted || colors.textMuted
  const accentColor = theme?.accent || colors.accent
  const primaryColor = theme?.primary || colors.primary

  const clearFilters = () => {
    setFilter('all')
    setPropertyTypeFilter('all')
  }

  const hasActiveFilters = filter !== 'all' || propertyTypeFilter !== 'all'

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: bgColor }]} 
      edges={['top']}
    >
      {/* Header con boton volver */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => {
            if (isInvestor || isTenant || isSearching) router.replace('/(tabs)')
            else router.back()
          }}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Catalogo
        </Text>
        {hasActiveFilters ? (
          <TouchableOpacity 
            style={[styles.favoritesButton, { backgroundColor: surfaceColor, borderColor }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearButtonText, { color: textColor }]}>Limpiar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.clearButtonPlaceholder} />
        )}
      </View>

      {/* Barra de busqueda */}
      <View style={[styles.searchContainer, { backgroundColor: bgColor }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
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
          style={[styles.filterButton, { backgroundColor: surfaceColor, borderColor: borderColor }]}
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
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
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
                style={[styles.filterModalClose, { backgroundColor: bgColor, borderColor }]}
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
                      { backgroundColor: bgColor, borderColor },
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
                      { backgroundColor: bgColor, borderColor },
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
  favoritesButton: {
    minWidth: 88,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  clearButtonPlaceholder: {
    width: 88,
    height: 40,
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
