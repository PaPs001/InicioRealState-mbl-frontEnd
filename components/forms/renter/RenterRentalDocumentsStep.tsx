import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { FileText, Home } from 'lucide-react-native'
import type { RentalData, RentalType } from './types'

interface RenterRentalDocumentsStepProps {
  animatedStyle: object
  colors: any
  styles: any
  rentalType: RentalType
  rentalFound: boolean | null
  rentalData: RentalData
  onPickDocuments: () => void
  onFinish: () => void
  onRetry: () => void
}

export function RenterRentalDocumentsStep({
  animatedStyle,
  colors,
  styles,
  rentalType,
  rentalFound,
  rentalData,
  onPickDocuments,
  onFinish,
  onRetry,
}: RenterRentalDocumentsStepProps) {
  if (rentalType === 'with_us' && !rentalFound) {
    return (
      <Animated.View style={[styles.stepContent, animatedStyle]}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIcon}>
            <Home size={40} color={colors.warm} />
          </View>

          <Text style={styles.notFoundTitle}>No encontramos tu renta</Text>
          <Text style={styles.notFoundSubtitle}>
            No pudimos encontrar un contrato activo con tus datos. Puedes continuar y agregar la información manualmente o contactar a tu asesor.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
            <Text style={styles.primaryButtonText}>Continuar de todas formas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onRetry}>
            <Text style={styles.secondaryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <Text style={styles.stepTitle}>Documentacion</Text>
      <Text style={styles.stepSubtitle}>Opcional - Guarda tus documentos importantes</Text>

      <TouchableOpacity style={styles.uploadArea} onPress={onPickDocuments}>
        <FileText size={40} color={colors.accent} />
        <Text style={styles.uploadText}>Agregar documentos</Text>
        <Text style={styles.uploadHint}>Contrato, comprobantes, etc.</Text>
      </TouchableOpacity>

      {rentalData.documents.length > 0 && (
        <View style={styles.documentsPreview}>
          <Text style={styles.documentsCount}>{rentalData.documents.length} documento(s) agregado(s)</Text>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
        <Text style={styles.primaryButtonText}>Finalizar registro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onFinish}>
        <Text style={styles.secondaryButtonText}>Omitir y finalizar</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
