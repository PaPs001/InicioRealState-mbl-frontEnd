import { Text, TouchableOpacity, View } from 'react-native'
import { Building2, Check, Home, Map } from 'lucide-react-native'

import type { PropertyType } from './constants'
import { investorColors, styles } from './shared'

type PropertyTypeStepProps = {
  propertyType: PropertyType | null
  setPropertyType: (value: PropertyType) => void
}

export function PropertyTypeStep({ propertyType, setPropertyType }: PropertyTypeStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de propiedad</Text>
      <Text style={styles.stepSubtitle}>Selecciona el tipo de inmueble que deseas registrar</Text>

      <View style={styles.optionsGrid}>
        <TouchableOpacity style={[styles.optionCard, propertyType === 'house' && styles.optionCardSelected]} onPress={() => setPropertyType('house')}>
          <Home size={32} color={propertyType === 'house' ? investorColors.accent : investorColors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'house' && styles.optionLabelSelected]}>Casa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, propertyType === 'department' && styles.optionCardSelected]} onPress={() => setPropertyType('department')}>
          <Building2 size={32} color={propertyType === 'department' ? investorColors.accent : investorColors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'department' && styles.optionLabelSelected]}>Departamento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, propertyType === 'lot' && styles.optionCardSelected]} onPress={() => setPropertyType('lot')}>
          <Map size={32} color={propertyType === 'lot' ? investorColors.accent : investorColors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'lot' && styles.optionLabelSelected]}>Terreno</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
