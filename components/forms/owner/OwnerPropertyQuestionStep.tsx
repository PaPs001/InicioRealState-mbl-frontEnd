import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Building2, Check, ChevronRight, Plus } from 'lucide-react-native'

interface OwnerPropertyQuestionStepProps {
  animatedStyle: object
  colors: any
  styles: any
  pulseStyle?: object
  onSelect: (answer: boolean) => void
}

export function OwnerPropertyQuestionStep({
  animatedStyle,
  colors,
  styles,
  pulseStyle,
  onSelect,
}: OwnerPropertyQuestionStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.questionContainer}>
        <Animated.View style={[styles.logoContainer, pulseStyle]}>
          <Building2 size={48} color={colors.gold} />
        </Animated.View>

        <Text style={styles.questionTitle}>¿Ya tienes propiedades con nosotros?</Text>
        <Text style={styles.questionSubtitle}>
          Si ya has invertido con Inicio, podemos vincular automáticamente tus propiedades a tu nueva cuenta
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => onSelect(true)}>
            <View style={styles.optionContent}>
              <Check size={24} color={colors.gold} />
              <Text style={styles.optionText}>Sí, tengo propiedades</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => onSelect(false)}>
            <View style={styles.optionContent}>
              <Plus size={24} color={colors.textSecondary} />
              <Text style={styles.optionText}>No, soy nuevo</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
