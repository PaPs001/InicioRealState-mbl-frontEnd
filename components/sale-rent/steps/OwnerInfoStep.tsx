import { Text, TextInput, View } from 'react-native'
import { Mail, MapPin, Phone, User } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type OwnerInfoStepProps = {
  ownerAddress: string
  ownerEmail: string
  ownerName: string
  ownerPhone: string
  setOwnerAddress: (value: string) => void
  setOwnerEmail: (value: string) => void
  setOwnerName: (value: string) => void
  setOwnerPhone: (value: string) => void
}

export function OwnerInfoStep(props: OwnerInfoStepProps) {
  const { ownerAddress, ownerEmail, ownerName, ownerPhone, setOwnerAddress, setOwnerEmail, setOwnerName, setOwnerPhone } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Informacion del propietario</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre completo *</Text>
        <View style={styles.inputBox}>
          <User size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Nombre del propietario" placeholderTextColor={advisorTheme.textMuted} value={ownerName} onChangeText={setOwnerName} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Telefono *</Text>
        <View style={styles.inputBox}>
          <Phone size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="10 digitos" placeholderTextColor={advisorTheme.textMuted} keyboardType="phone-pad" value={ownerPhone} onChangeText={setOwnerPhone} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email (opcional)</Text>
        <View style={styles.inputBox}>
          <Mail size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="correo@ejemplo.com" placeholderTextColor={advisorTheme.textMuted} keyboardType="email-address" autoCapitalize="none" value={ownerEmail} onChangeText={setOwnerEmail} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dirección (opcional)</Text>
        <View style={styles.inputBox}>
          <MapPin size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Dirección del propietario" placeholderTextColor={advisorTheme.textMuted} value={ownerAddress} onChangeText={setOwnerAddress} />
        </View>
      </View>
    </View>
  )
}
