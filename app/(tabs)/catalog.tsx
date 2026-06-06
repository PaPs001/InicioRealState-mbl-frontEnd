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
} from 'react-native'
import { useRouter } from 'expo-router'
import { spacing, typography, borderRadius } from '@/lib/theme'
import { 
  Search, 
  Filter, 
  Heart, 
  ArrowLeft,
  X,
  Building2,
} from 'lucide-react-native'
import { AppScreen } from '@/components/ui'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { PropertyListCard } from '@/components/properties/PropertyListCard'

export default function CatalogScreen() {
  const { isAgent, isAdmin } = useSessionDomain()
  const {
    availableProperties,
    toggleFavorite,
    isFavorite,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    addNewFavoriteProperty,
    newLoadCatalogProperties,
  } = usePropertyDomain()
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent' | 'favorites'>('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'house' | 'apartment' | 'land'>('all')
  const [showFilters, setShowFilters] = useState(false)

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

  const handleBackToHome = () => {
    router.replace('/(tabs)')
  }

  const clearFilters = () => {
    setFilter('all')
    setPropertyTypeFilter('all')
  }

  const hasActiveFilters = filter !== 'all' || propertyTypeFilter !== 'all'

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleBackToHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={18} color={theme.accent} />
            <Text style={styles.headerBackButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Catalogo</Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          {hasActiveFilters ? (
            <TouchableOpacity
              style={styles.headerClearButton}
              onPress={clearFilters}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerClearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerClearPlaceholder} />
          )}
        </View>
      </View>

      {/* Barra de busqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar propiedades..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>
      

      {/* Lista de propiedades */}
      <FlatList
        data={filteredProperties}
        renderItem={({ item }) => (
          <PropertyListCard
            property={item}
            favorite={isFavorite(item.id)}
            onPress={() => router.push(`/property/${item.id}`)}
            onToggleFavorite={() => addNewFavoriteProperty(item.id)}
            showPendingBadge={isAgent || isAdmin}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={theme.textMuted} />
            <Text style={styles.emptyStateText}>
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
            style={styles.filterModal}
            onPress={() => {}}
          >
            <View style={styles.filterHandle} />
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <TouchableOpacity
                style={styles.filterModalClose}
                onPress={() => setShowFilters(false)}
              >
                <X size={18} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Operación</Text>
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
                      filter === option.key && styles.filterChipActive,
                    ]}
                    onPress={() => setFilter(option.key as typeof filter)}
                  >
                      <Text
                        style={[
                          styles.filterChipText,
                          filter === option.key && styles.filterChipTextActive,
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
              <Text style={styles.filterSectionTitle}>Tipo</Text>
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
                      propertyTypeFilter === option.key && styles.filterChipActive,
                    ]}
                    onPress={() => setPropertyTypeFilter(option.key as typeof propertyTypeFilter)}
                  >
                      <Text
                        style={[
                          styles.filterChipText,
                          propertyTypeFilter === option.key && styles.filterChipTextActive,
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
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  headerBackButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  headerClearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  headerClearButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.text,
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
    color: theme.text,
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
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: theme.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
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
    backgroundColor: theme.surface,
    borderColor: theme.border,
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
    backgroundColor: theme.border,
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
    color: theme.text,
  },
  filterModalClose: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: theme.background,
    borderColor: theme.border,
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
    color: theme.textSecondary,
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
    backgroundColor: theme.background,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  filterChipText: {
    fontSize: typography.bodySmall.fontSize,
    flexShrink: 1,
    color: theme.textSecondary,
  },
  filterChipTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: theme.textMuted,
    marginTop: spacing.md,
  },
})
