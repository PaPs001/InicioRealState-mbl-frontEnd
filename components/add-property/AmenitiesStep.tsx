import { Text, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import { AMENITIES } from './constants'
import { investorColors, styles } from './shared'

type AmenitiesStepProps = {
  selectedAmenities: string[]
  toggleAmenity: (amenityId: string) => void
}

export function AmenitiesStep({ selectedAmenities, toggleAmenity }: AmenitiesStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Amenidades</Text>
      <Text style={styles.stepSubtitle}>Selecciona las amenidades que tiene tu propiedad (opcional)</Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES.map((amenity) => {
          const Icon = amenity.icon
          const isSelected = selectedAmenities.includes(amenity.id)

          return (
            <TouchableOpacity key={amenity.id} style={[styles.amenityCard, isSelected && styles.amenityCardSelected]} onPress={() => toggleAmenity(amenity.id)}>
              <Icon size={24} color={isSelected ? investorColors.accent : investorColors.textMuted} />
              <Text style={[styles.amenityLabel, isSelected && styles.amenityLabelSelected]}>{amenity.label}</Text>
              {isSelected ? (
                <View style={styles.amenityCheck}>
                  <Check size={12} color={investorColors.primary} />
                </View>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </View>

      <Text style={styles.amenitiesHint}>Puedes agregar o modificar las amenidades después</Text>
    </View>
  )
}
