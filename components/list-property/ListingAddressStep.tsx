import { Text, TextInput, View } from 'react-native'
import { MapPin } from 'lucide-react-native'

import { investorColors, styles } from './shared'

type ListingAddressStepProps = {
  address: string
  propertyAddress: string
  propertyCity: string
  onChangeAddress: (value: string) => void
}

export function ListingAddressStep({ address, propertyAddress, propertyCity, onChangeAddress }: ListingAddressStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ubicacion de la propiedad</Text>
      <Text style={styles.stepSubtitle}>Confirma o actualiza la direccion de tu propiedad</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Dirección completa</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder={propertyAddress}
            placeholderTextColor={investorColors.textMuted}
            value={address}
            onChangeText={onChangeAddress}
            multiline
          />
        </View>
      </View>

      <View style={styles.currentAddressCard}>
        <Text style={styles.currentAddressLabel}>Dirección registrada:</Text>
        <Text style={styles.currentAddressValue}>{propertyAddress}, {propertyCity}</Text>
      </View>
    </View>
  )
}
