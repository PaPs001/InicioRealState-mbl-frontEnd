import { Text, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import { PROPERTY_TYPES } from '../constants'
import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyTypeStepProps = {
  propertyType: string | null
  onChange: (value: string) => void
}

export function PropertyTypeStep({ propertyType, onChange }: PropertyTypeStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>¿Qué tipo de propiedad es?</Text>

      <View style={styles.propertyTypeGrid}>
        {PROPERTY_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = propertyType === type.id

          return (
            <TouchableOpacity
              key={type.id}
              style={[styles.propertyTypeCard, isSelected && styles.propertyTypeCardActive]}
              onPress={() => onChange(type.id)}
            >
              <Icon size={32} color={isSelected ? advisorTheme.accent : advisorTheme.textMuted} />
              <Text style={[styles.propertyTypeLabel, isSelected && styles.propertyTypeLabelActive]}>{type.label}</Text>
              {isSelected ? (
                <View style={styles.propertyTypeCheck}>
                  <Check size={16} color={advisorTheme.background} />
                </View>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
