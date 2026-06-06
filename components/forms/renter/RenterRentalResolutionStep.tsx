import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Check, ChevronRight, Clock, FileText, Home } from 'lucide-react-native'
import type { AddDataNow, RentalType } from './types'

interface RenterRentalResolutionStepProps {
  animatedStyle: object
  colors: any
  styles: any
  pulseStyle?: object
  rentalType: RentalType
  onFinish: () => void
  onSelectAddData: (answer: AddDataNow) => void
}

export function RenterRentalResolutionStep({
  animatedStyle,
  colors,
  styles,
  pulseStyle,
  rentalType,
  onFinish,
  onSelectAddData,
}: RenterRentalResolutionStepProps) {
  if (rentalType === 'with_us') {
    return (
      <Animated.View style={[styles.stepContent, animatedStyle]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={40} color={colors.background} />
          </View>

          <Text style={styles.successTitle}>Renta vinculada</Text>
          <Text style={styles.successSubtitle}>
            Hemos encontrado tu contrato de renta y lo vinculamos a tu cuenta. Ya puedes acceder a toda la información.
          </Text>

          <View style={styles.propertyPreview}>
            <Home size={24} color={colors.green} />
            <View style={styles.propertyPreviewText}>
              <Text style={styles.propertyPreviewTitle}>Tu renta activa</Text>
              <Text style={styles.propertyPreviewSubtitle}>Lista para gestionar</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
            <Text style={styles.primaryButtonText}>Ir a mi inicio</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.questionContainer}>
        <Animated.View style={[styles.logoContainer, pulseStyle]}>
          <FileText size={48} color={colors.accent} />
        </Animated.View>

        <Text style={styles.questionTitle}>Quieres agregar los datos de tu renta?</Text>
        <Text style={styles.questionSubtitle}>
          Puedes agregar la información ahora o hacerlo más tarde desde la app
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => onSelectAddData('now')}>
            <View style={styles.optionContent}>
              <Check size={24} color={colors.green} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Agregar ahora</Text>
                <Text style={styles.optionSubtext}>Completar información de mi renta</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => onSelectAddData('later')}>
            <View style={styles.optionContent}>
              <Clock size={24} color={colors.warm} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Agregar después</Text>
                <Text style={styles.optionSubtext}>Lo haré más tarde</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
