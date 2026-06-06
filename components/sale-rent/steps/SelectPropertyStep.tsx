import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Check, Search, X } from 'lucide-react-native'

import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { formatCurrency } from '@/lib/utils'
import { borderRadius, spacing, typography } from '@/lib/theme'
import { advisorTheme } from '../theme'

type SelectPropertyStepProps = {
  filteredProperties: PropertyCatalogItemResponse[]
  isAgentCatalogLoading: boolean
  searchQuery: string
  selectedProperty: string | null
  transactionType: 'sale' | 'rent' | null
  onChangeSearchQuery: (value: string) => void
  onClearSearchQuery: () => void
  onSelectProperty: (id: string) => void
}

export function SelectPropertyStep({
  filteredProperties,
  isAgentCatalogLoading,
  searchQuery,
  selectedProperty,
  transactionType,
  onChangeSearchQuery,
  onClearSearchQuery,
  onSelectProperty,
}: SelectPropertyStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Selecciona la propiedad</Text>

      <View style={styles.searchBox}>
        <Search size={20} color={advisorTheme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ubicación..."
          placeholderTextColor={advisorTheme.textMuted}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClearSearchQuery}>
            <X size={20} color={advisorTheme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
        {isAgentCatalogLoading ? (
          <Text style={styles.emptyText}>Cargando propiedades...</Text>
        ) : filteredProperties.length === 0 ? (
          <Text style={styles.emptyText}>
            No se encontraron propiedades disponibles para {transactionType === 'sale' ? 'venta' : 'renta'}
          </Text>
        ) : (
          filteredProperties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={[styles.propertyCard, selectedProperty === property.id && styles.propertyCardActive]}
              onPress={() => onSelectProperty(property.id)}
            >
              <View style={styles.propertyCardContent}>
                <Text style={styles.propertyCardTitle} numberOfLines={1}>{property.name}</Text>
                <Text style={styles.propertyCardLocation}>{property.zonaText || property.address}</Text>
                <View style={styles.propertyCardPrices}>
                  <Text style={styles.propertyCardPrice}>{formatCurrency(property.maxPrice || 0)}</Text>
                  {property.minPrice != null && property.minPrice > 0 && (
                    <Text style={styles.propertyCardMinPrice}>Min: {formatCurrency(property.minPrice)}</Text>
                  )}
                </View>
              </View>
              {selectedProperty === property.id && <Check size={24} color={advisorTheme.accent} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  stepContent: {
    gap: spacing.md,
  },
  stepQuestion: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  propertyList: {
    maxHeight: 400,
  },
  emptyText: {
    color: advisorTheme.textMuted,
    textAlign: 'center',
    padding: spacing.lg,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  propertyCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  propertyCardContent: {
    flex: 1,
  },
  propertyCardTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  propertyCardLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  propertyCardPrices: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  propertyCardPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  propertyCardMinPrice: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
})
