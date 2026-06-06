import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import type { AcquisitionType } from './constants'
import { investorColors, styles } from './shared'

type AcquisitionTypeStepProps = {
  acquisitionType: AcquisitionType | null
  externalAgency: string
  setAcquisitionType: (value: AcquisitionType | null) => void
  setExternalAgency: (value: string) => void
}

export function AcquisitionTypeStep(props: AcquisitionTypeStepProps) {
  const { acquisitionType, externalAgency, setAcquisitionType, setExternalAgency } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>¿Cómo adquiriste esta propiedad?</Text>
      <Text style={styles.stepSubtitle}>Esto nos ayuda a dar mejor seguimiento</Text>

      <View style={styles.listingOptions}>
        <TouchableOpacity
          style={[styles.listingOption, acquisitionType === 'inicio' && styles.listingOptionSelected]}
          onPress={() => {
            setAcquisitionType('inicio')
            setExternalAgency('')
          }}
        >
          {acquisitionType === 'inicio' ? (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          ) : null}
          <Text style={[styles.listingOptionTitle, acquisitionType === 'inicio' && styles.listingOptionTitleSelected]}>Con Inicio Real Estate</Text>
          <Text style={styles.listingOptionDesc}>Compre esta propiedad a traves de Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.listingOption, acquisitionType === 'external' && styles.listingOptionSelected]}
          onPress={() => setAcquisitionType('external')}
        >
          {acquisitionType === 'external' ? (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          ) : null}
          <Text style={[styles.listingOptionTitle, acquisitionType === 'external' && styles.listingOptionTitleSelected]}>De manera externa</Text>
          <Text style={styles.listingOptionDesc}>Adquiri esta propiedad por otro medio</Text>
        </TouchableOpacity>
      </View>

      {acquisitionType === 'external' ? (
        <View style={styles.externalAgencyContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Inmobiliaria (opcional)</Text>
            <Text style={styles.inputHint}>Si compraste con alguna inmobiliaria, indícanos cuál</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Century 21, RE/MAX, etc."
              placeholderTextColor={investorColors.textMuted}
              value={externalAgency}
              onChangeText={setExternalAgency}
            />
          </View>
        </View>
      ) : null}
    </View>
  )
}
