import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Building2, Check } from 'lucide-react-native'

interface OwnerPropertiesFoundStepProps {
  animatedStyle: object
  colors: any
  styles: any
  onFinish: () => void
}

export function OwnerPropertiesFoundStep({
  animatedStyle,
  colors,
  styles,
  onFinish,
}: OwnerPropertiesFoundStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Check size={40} color={colors.background} />
        </View>

        <Text style={styles.successTitle}>Propiedades vinculadas</Text>
        <Text style={styles.successSubtitle}>
          Hemos encontrado y vinculado tus propiedades a tu cuenta. Ya puedes acceder a toda la información desde tu dashboard.
        </Text>

        <View style={styles.propertyPreview}>
          <Building2 size={24} color={colors.gold} />
          <View style={styles.propertyPreviewText}>
            <Text style={styles.propertyPreviewTitle}>2 propiedades encontradas</Text>
            <Text style={styles.propertyPreviewSubtitle}>Listas para gestionar</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
          <Text style={styles.primaryButtonText}>Ir a mi dashboard</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
