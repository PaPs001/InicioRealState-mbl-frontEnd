import { Text, TextInput, TouchableOpacity, View } from 'react-native'

import { AMENITIES_LIST } from '../constants'
import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyAmenitiesStepProps = {
  customAmenities: string
  selectedAmenities: string[]
  setCustomAmenities: (value: string) => void
  toggleAmenity: (amenity: string) => void
}

export function PropertyAmenitiesStep(props: PropertyAmenitiesStepProps) {
  const { customAmenities, selectedAmenities, setCustomAmenities, toggleAmenity } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Amenidades (opcional)</Text>
      <Text style={styles.stepHint}>Selecciona todas las que apliquen</Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES_LIST.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity)
          return (
            <TouchableOpacity key={amenity} style={[styles.amenityChip, isSelected && styles.amenityChipActive]} onPress={() => toggleAmenity(amenity)}>
              <Text style={[styles.amenityChipText, isSelected && styles.amenityChipTextActive]}>{amenity}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Otras amenidades</Text>
        <TextInput style={styles.textArea} placeholder="Escribe otras amenidades separadas por coma..." placeholderTextColor={advisorTheme.textMuted} multiline numberOfLines={3} value={customAmenities} onChangeText={setCustomAmenities} />
      </View>
    </View>
  )
}
