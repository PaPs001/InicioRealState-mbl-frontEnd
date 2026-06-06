import { Text, TextInput, View } from 'react-native'
import { Bath, Bed, MapPin } from 'lucide-react-native'

import type { AddPropertyFormData } from './types'
import type { PropertyType } from './constants'
import { investorColors, styles } from './shared'

type BasicInfoStepProps = {
  formData: AddPropertyFormData
  propertyType: PropertyType | null
  setFormData: (value: AddPropertyFormData) => void
}

export function BasicInfoStep({ formData, propertyType, setFormData }: BasicInfoStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informacion basica</Text>
      <Text style={styles.stepSubtitle}>Ingresa los datos de tu propiedad</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nombre de la propiedad</Text>
        <TextInput style={styles.input} placeholder="Ej: Casa en Polanco" placeholderTextColor={investorColors.textMuted} value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Dirección</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={investorColors.textMuted} />
          <TextInput style={styles.inputInner} placeholder="Calle, numero, colonia" placeholderTextColor={investorColors.textMuted} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Ciudad</Text>
        <TextInput style={styles.input} placeholder="Ciudad" placeholderTextColor={investorColors.textMuted} value={formData.city} onChangeText={(text) => setFormData({ ...formData, city: text })} />
      </View>

      {propertyType !== 'lot' ? (
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Recámaras</Text>
            <View style={styles.inputWithIcon}>
              <Bed size={20} color={investorColors.textMuted} />
              <TextInput style={styles.inputInner} placeholder="0" placeholderTextColor={investorColors.textMuted} keyboardType="numeric" value={formData.bedrooms} onChangeText={(text) => setFormData({ ...formData, bedrooms: text })} />
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Baños</Text>
            <View style={styles.inputWithIcon}>
              <Bath size={20} color={investorColors.textMuted} />
              <TextInput style={styles.inputInner} placeholder="0" placeholderTextColor={investorColors.textMuted} keyboardType="numeric" value={formData.bathrooms} onChangeText={(text) => setFormData({ ...formData, bathrooms: text })} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
