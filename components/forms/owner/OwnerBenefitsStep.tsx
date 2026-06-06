import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Building2, Check, Plus } from 'lucide-react-native'

interface OwnerBenefitsStepProps {
  animatedStyle: object
  colors: any
  styles: any
  onFinish: () => void
}

export function OwnerBenefitsStep({
  animatedStyle,
  colors,
  styles,
  onFinish,
}: OwnerBenefitsStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Bienvenido al mundo de las inversiones</Text>
        <Text style={styles.benefitsSubtitle}>
          Como inversionista de Inicio tendrás acceso a:
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Building2 size={20} color={colors.gold} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Dashboard personal</Text>
              <Text style={styles.benefitDescription}>Monitorea todas tus propiedades en un solo lugar</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Check size={20} color={colors.gold} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Control total</Text>
              <Text style={styles.benefitDescription}>Gestiona rentas, inquilinos y documentos</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Plus size={20} color={colors.gold} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Proyecciones</Text>
              <Text style={styles.benefitDescription}>Visualiza el potencial de tus inversiones</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
          <Text style={styles.primaryButtonText}>Comenzar ahora</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
