import { useEffect, useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Building2, Filter, Search, X } from 'lucide-react-native'

import { PropertyListCard } from '@/components/properties/PropertyListCard'
import { AppScreen } from '@/components/ui'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { borderRadius, spacing, typography } from '@/lib/theme'

export default function CatalogStandaloneScreen() {
  const {
    availableProperties,
    toggleFavorite,
    isFavorite,
    catalogProperties,
    isCatalogLoading,
    hasLoadedCatalog,
    loadCatalogProperties,
  } = usePropertyDomain()
  const router = useRouter()
  const { theme, isInvestor, isSearching, isTenant } = useAppTheme()
  const styles = createStyles(theme)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent' | 'favorites'>('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'house' | 'apartment' | 'land'>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (catalogProperties.length === 0 && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [catalogProperties.length, isCatalogLoading, loadCatalogProperties])

  const filteredProperties = useMemo(() => {
    const properties = hasLoadedCatalog ? availableProperties : []

    return properties.filter(property => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'sale' && property.status === 'for_sale') ||
        (filter === 'rent' && property.status === 'for_rent') ||
        (filter === 'favorites' && isFavorite(property.id))

      const matchesType = propertyTypeFilter === 'all' || property.type === propertyTypeFilter

      return matchesSearch && matchesFilter && matchesType
    })
  }, [availableProperties, filter, hasLoadedCatalog, isFavorite, propertyTypeFilter, searchQuery])

  const clearFilters = () => {
    setFilter('all')
    setPropertyTypeFilter('all')
  }

  const hasActiveFilters = filter !== 'all' || propertyTypeFilter !== 'all'

  return (
    <AppScreen edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isInvestor || isTenant || isSearching) router.replace('/(tabs)')
            else router.back()
          }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Catalogo</Text>

        {hasActiveFilters ? (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.clearButtonPlaceholder} />
        )}
      </View>

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

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Filter size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={({ item }) => (
          <PropertyListCard
            property={item}
            favorite={isFavorite(item.id)}
            onPress={() => router.push(`/property/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
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

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <Pressable style={styles.filterOverlay} onPress={() => setShowFilters(false)}>
          <Pressable style={styles.filterModal} onPress={() => {}}>
            <View style={styles.filterHandle} />

            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <TouchableOpacity style={styles.filterModalClose} onPress={() => setShowFilters(false)}>
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
                    style={[styles.filterChip, filter === option.key && styles.filterChipActive]}
                    onPress={() => setFilter(option.key as typeof filter)}
                  >
                    <Text style={[styles.filterChipText, filter === option.key && styles.filterChipTextActive]}>
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
                    style={[styles.filterChip, propertyTypeFilter === option.key && styles.filterChipActive]}
                    onPress={() => setPropertyTypeFilter(option.key as typeof propertyTypeFilter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        propertyTypeFilter === option.key && styles.filterChipTextActive,
                      ]}
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

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: '700',
      color: theme.text,
    },
    clearButton: {
      minWidth: 88,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    clearButtonText: {
      fontSize: typography.bodySmall.fontSize,
      fontWeight: '600',
      color: theme.text,
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
    listContent: {
      padding: spacing.md,
      paddingBottom: 100,
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
      backgroundColor: theme.surface,
      borderColor: theme.border,
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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      borderColor: theme.border,
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
      color: theme.textSecondary,
    },
    filterChipTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
  })
