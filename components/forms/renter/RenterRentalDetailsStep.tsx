import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { RentalData } from './types'

const rentalTypes = [
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Departamento' },
  { value: 'room', label: 'Cuarto' },
  { value: 'office', label: 'Oficina' },
] as const

interface RenterRentalDetailsStepProps {
  animatedStyle: object
  colors: any
  styles: any
  rentalData: RentalData
  isValid: boolean
  onChangeField: <K extends keyof RentalData>(field: K, value: RentalData[K]) => void
  onContinue: () => void
}

export function RenterRentalDetailsStep({
  animatedStyle,
  colors,
  styles,
  rentalData,
  isValid,
  onChangeField,
  onContinue,
}: RenterRentalDetailsStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <Text style={styles.stepTitle}>Información de tu renta</Text>
      <Text style={styles.stepSubtitle}>Cuéntanos sobre tu contrato</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha de inicio del contrato</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.textMuted}
          value={rentalData.startDate}
          onChangeText={(text) => onChangeField('startDate', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha de terminacion</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.textMuted}
          value={rentalData.endDate}
          onChangeText={(text) => onChangeField('endDate', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo de propiedad</Text>
        <View style={styles.typeSelector}>
          {rentalTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                rentalData.rentalType === type.value && styles.typeOptionSelected,
              ]}
              onPress={() => onChangeField('rentalType', type.value)}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  rentalData.rentalType === type.value && styles.typeOptionTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ubicacion</Text>
        <TextInput
          style={styles.input}
          placeholder="Dirección de la propiedad"
          placeholderTextColor={colors.textMuted}
          value={rentalData.location}
          onChangeText={(text) => onChangeField('location', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Costo mensual de renta</Text>
        <TextInput
          style={styles.input}
          placeholder="$0.00"
          placeholderTextColor={colors.textMuted}
          value={rentalData.monthlyRent}
          onChangeText={(text) => onChangeField('monthlyRent', text)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !isValid && styles.disabledButton]}
        onPress={onContinue}
        disabled={!isValid}
      >
        <Text style={styles.primaryButtonText}>Continuar</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
