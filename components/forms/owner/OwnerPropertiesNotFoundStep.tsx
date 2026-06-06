import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Building2 } from 'lucide-react-native'

interface OwnerPropertiesNotFoundStepProps {
  animatedStyle: object
  colors: any
  styles: any
  onFinish: () => void
  onRetry: () => void
}

export function OwnerPropertiesNotFoundStep({
  animatedStyle,
  colors,
  styles,
  onFinish,
  onRetry,
}: OwnerPropertiesNotFoundStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.notFoundContainer}>
        <View style={styles.notFoundIcon}>
          <Building2 size={40} color={colors.goldMuted} />
        </View>

        <Text style={styles.notFoundTitle}>No encontramos propiedades</Text>
        <Text style={styles.notFoundSubtitle}>
          No pudimos vincular propiedades automaticamente. Puedes agregarlas manualmente desde tu dashboard o contactar a tu asesor.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
          <Text style={styles.primaryButtonText}>Continuar al dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onRetry}>
          <Text style={styles.secondaryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
