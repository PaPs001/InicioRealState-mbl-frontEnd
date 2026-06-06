import { Text, TextInput, View } from 'react-native'
import { Home } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyNameStepProps = {
  propertyDescription: string
  propertyName: string
  setPropertyDescription: (value: string) => void
  setPropertyName: (value: string) => void
}

export function PropertyNameStep(props: PropertyNameStepProps) {
  const { propertyDescription, propertyName, setPropertyDescription, setPropertyName } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Nombre y descripcion del inmueble</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Titulo / Nombre *</Text>
        <View style={styles.inputBox}>
          <Home size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Ej: Casa en Colinas de San Jeronimo" placeholderTextColor={advisorTheme.textMuted} value={propertyName} onChangeText={setPropertyName} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Descripción (opcional)</Text>
        <TextInput style={styles.textArea} placeholder="Describe las caracteristicas principales del inmueble..." placeholderTextColor={advisorTheme.textMuted} multiline numberOfLines={4} value={propertyDescription} onChangeText={setPropertyDescription} />
      </View>
    </View>
  )
}
