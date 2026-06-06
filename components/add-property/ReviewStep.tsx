import { Text, View } from 'react-native'
import { Check, Tag, TrendingUp } from 'lucide-react-native'

import { investorColors, styles } from './shared'

type ReviewStepProps = {
  isDemoSession: boolean
}

export function ReviewStep({ isDemoSession }: ReviewStepProps) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.finalStepContainer}>
        <View style={styles.finalIconContainer}>
          <Check size={48} color={investorColors.accent} />
        </View>

        <Text style={styles.finalTitle}>Todo listo!</Text>
        <Text style={styles.finalSubtitle}>Tu propiedad esta lista para ser guardada</Text>

        <View style={styles.finalInfoCard}>
          <View style={styles.finalInfoRow}>
            <TrendingUp size={24} color={investorColors.accent} />
            <View style={styles.finalInfoContent}>
              <Text style={styles.finalInfoTitle}>Monitorea tu inversion</Text>
              <Text style={styles.finalInfoDesc}>Podras ver el valor actual, ganancias y proyecciones de tu propiedad</Text>
            </View>
          </View>

          <View style={styles.finalDivider} />

          <View style={styles.finalInfoRow}>
            <Tag size={24} color={investorColors.accent} />
            <View style={styles.finalInfoContent}>
              <Text style={styles.finalInfoTitle}>Renta o vende cuando quieras</Text>
              <Text style={styles.finalInfoDesc}>En cualquier momento puedes poner tu propiedad en renta o en venta con solo unos toques</Text>
            </View>
          </View>
        </View>

        <Text style={styles.finalHint}>Nuestro equipo esta disponible para ayudarte si decides publicar tu propiedad</Text>

        {isDemoSession ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Sesion demo detectada</Text>
            <Text style={styles.warningText}>Para guardar esta propiedad necesitas iniciar sesion con una cuenta real del backend.</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}
