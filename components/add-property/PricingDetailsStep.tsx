import { Text, TextInput, View } from 'react-native'
import { DollarSign, Ruler } from 'lucide-react-native'

import type { AddPropertyFormData } from './types'
import { investorColors, styles } from './shared'

type PricingDetailsStepProps = {
  formData: AddPropertyFormData
  setFormData: (value: AddPropertyFormData) => void
}

export function PricingDetailsStep({ formData, setFormData }: PricingDetailsStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Detalles de la propiedad</Text>
      <Text style={styles.stepSubtitle}>Información sobre precio y tamaño</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Precio de compra</Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={20} color={investorColors.textMuted} />
          <TextInput style={styles.inputInner} placeholder="0.00" placeholderTextColor={investorColors.textMuted} keyboardType="numeric" value={formData.purchasePrice} onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })} />
          <Text style={styles.inputSuffix}>MXN</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Metros cuadrados</Text>
        <View style={styles.inputWithIcon}>
          <Ruler size={20} color={investorColors.textMuted} />
          <TextInput style={styles.inputInner} placeholder="0" placeholderTextColor={investorColors.textMuted} keyboardType="numeric" value={formData.sqMeters} onChangeText={(text) => setFormData({ ...formData, sqMeters: text })} />
          <Text style={styles.inputSuffix}>m2</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe las caracteristicas de tu propiedad..."
          placeholderTextColor={investorColors.textMuted}
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
        />
      </View>
    </View>
  )
}
