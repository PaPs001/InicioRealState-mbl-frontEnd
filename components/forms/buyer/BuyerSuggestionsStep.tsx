import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Building2, ChevronRight, MapPin, Search } from 'lucide-react-native'
import type { SuggestedProperty } from './types'

interface BuyerSuggestionsStepProps {
  animatedStyle: object
  styles: any
  theme: any
  suggestedProperties: SuggestedProperty[]
  searchType: 'buy' | 'rent' | ''
  onSelectProperty: () => void
  onExploreAll: () => void
}

export function BuyerSuggestionsStep({
  animatedStyle,
  styles,
  theme,
  suggestedProperties,
  searchType,
  onSelectProperty,
  onExploreAll,
}: BuyerSuggestionsStepProps) {
  return (
    <Animated.View style={[styles.suggestionsContainer, animatedStyle]}>
      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>
          {suggestedProperties.length > 0 ? 'Encontramos opciones para ti!' : 'Explora nuestro catálogo'}
        </Text>
        <Text style={styles.suggestionsSubtitle}>
          {suggestedProperties.length > 0
            ? 'Selecciona una para ver mas detalles'
            : 'Miles de propiedades te esperan'}
        </Text>
      </View>

      {suggestedProperties.length > 0 ? (
        <ScrollView style={styles.propertiesList} showsVerticalScrollIndicator={false}>
          {suggestedProperties.map((property) => (
            <TouchableOpacity key={property.id} style={styles.propertyCard} onPress={onSelectProperty}>
              <View style={styles.propertyIconContainer}>
                <Building2 size={24} color={theme.primary} />
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {property.title}
                </Text>
                <View style={styles.propertyLocation}>
                  <MapPin size={12} color={theme.textMuted} />
                  <Text style={styles.propertyAddress} numberOfLines={1}>
                    {property.address}, {property.city}
                  </Text>
                </View>
                <Text style={styles.propertyPrice}>
                  ${property.price?.toLocaleString('es-MX')}
                  {searchType === 'rent' && property.monthlyRent ? '/mes' : ''}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noResultsContainer}>
          <Search size={48} color={theme.textMuted} />
          <Text style={styles.noResultsText}>
            No encontramos propiedades con esos criterios, pero tenemos muchas más opciones
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.exploreAllButton} onPress={onExploreAll}>
        <Text style={styles.exploreAllButtonText}>Explorar todo el catálogo</Text>
        <ChevronRight size={20} color={theme.surface} />
      </TouchableOpacity>
    </Animated.View>
  )
}
