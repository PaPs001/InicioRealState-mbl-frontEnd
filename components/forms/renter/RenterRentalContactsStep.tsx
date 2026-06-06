import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { RentalData } from './types'

interface RenterRentalContactsStepProps {
  animatedStyle: object
  colors: any
  styles: any
  rentalData: RentalData
  onChangeField: <K extends keyof RentalData>(field: K, value: RentalData[K]) => void
  onContinue: () => void
  onSkip: () => void
}

export function RenterRentalContactsStep({
  animatedStyle,
  colors,
  styles,
  rentalData,
  onChangeField,
  onContinue,
  onSkip,
}: RenterRentalContactsStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <Text style={styles.stepTitle}>Contactos</Text>
      <Text style={styles.stepSubtitle}>Quien es tu arrendador o asesor?</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del arrendador</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del dueno/arrendador"
          placeholderTextColor={colors.textMuted}
          value={rentalData.landlordName}
          onChangeText={(text) => onChangeField('landlordName', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Telefono del arrendador</Text>
        <TextInput
          style={styles.input}
          placeholder="+52 55 1234 5678"
          placeholderTextColor={colors.textMuted}
          value={rentalData.landlordPhone}
          onChangeText={(text) => onChangeField('landlordPhone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del asesor (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Si tienes un asesor"
          placeholderTextColor={colors.textMuted}
          value={rentalData.agentName}
          onChangeText={(text) => onChangeField('agentName', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono del asesor (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="+52 55 1234 5678"
          placeholderTextColor={colors.textMuted}
          value={rentalData.agentPhone}
          onChangeText={(text) => onChangeField('agentPhone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
        <Text style={styles.secondaryButtonText}>Omitir y finalizar</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
