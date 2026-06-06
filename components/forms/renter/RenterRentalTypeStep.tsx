import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Check, ChevronRight, Home, Plus } from 'lucide-react-native'
import type { RentalType } from './types'

interface RenterRentalTypeStepProps {
  animatedStyle: object
  colors: any
  styles: any
  onSelectType: (type: RentalType) => void
}

export function RenterRentalTypeStep({
  animatedStyle,
  colors,
  styles,
  onSelectType,
}: RenterRentalTypeStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.questionContainer}>
        <View style={styles.logoContainer}>
          <Home size={48} color={colors.accent} />
        </View>

        <Text style={styles.questionTitle}>¿Cómo rentas actualmente?</Text>
        <Text style={styles.questionSubtitle}>
          Cuéntanos sobre tu situación de renta para personalizar tu experiencia
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => onSelectType('with_us')}>
            <View style={styles.optionContent}>
              <Check size={24} color={colors.green} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Rento con Inicio</Text>
                <Text style={styles.optionSubtext}>Ya tengo un contrato con ustedes</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => onSelectType('external')}>
            <View style={styles.optionContent}>
              <Plus size={24} color={colors.warm} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Rento de manera externa</Text>
                <Text style={styles.optionSubtext}>Quiero administrar mi renta aquí</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
