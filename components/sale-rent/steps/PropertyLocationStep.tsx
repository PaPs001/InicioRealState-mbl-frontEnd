import { Text, TextInput, View } from 'react-native'
import { Building2, MapPin } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyLocationStepProps = {
  propertyAddress: string
  propertyCity: string
  propertyMapsUrl: string
  setPropertyAddress: (value: string) => void
  setPropertyCity: (value: string) => void
  setPropertyMapsUrl: (value: string) => void
}

export function PropertyLocationStep(props: PropertyLocationStepProps) {
  const { propertyAddress, propertyCity, propertyMapsUrl, setPropertyAddress, setPropertyCity, setPropertyMapsUrl } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Ubicacion del inmueble</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dirección *</Text>
        <View style={styles.inputBox}>
          <MapPin size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Calle, numero, colonia" placeholderTextColor={advisorTheme.textMuted} value={propertyAddress} onChangeText={setPropertyAddress} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ciudad *</Text>
        <View style={styles.inputBox}>
          <Building2 size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Ciudad, Estado" placeholderTextColor={advisorTheme.textMuted} value={propertyCity} onChangeText={setPropertyCity} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Link de Google Maps (opcional)</Text>
        <View style={styles.inputBox}>
          <MapPin size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="https://maps.google.com/..." placeholderTextColor={advisorTheme.textMuted} value={propertyMapsUrl} onChangeText={setPropertyMapsUrl} autoCapitalize="none" />
        </View>
      </View>
    </View>
  )
}
