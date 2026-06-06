import { Animated, Image, Text, TouchableOpacity, View } from 'react-native'
import { Camera } from 'lucide-react-native'
import type { RentalData } from './types'

interface RenterRentalPhotosStepProps {
  animatedStyle: object
  colors: any
  styles: any
  rentalData: RentalData
  onPickPhotos: () => void
  onContinue: () => void
  onSkip: () => void
}

export function RenterRentalPhotosStep({
  animatedStyle,
  colors,
  styles,
  rentalData,
  onPickPhotos,
  onContinue,
  onSkip,
}: RenterRentalPhotosStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      <Text style={styles.stepTitle}>Fotos de la propiedad</Text>
      <Text style={styles.stepSubtitle}>Opcional - Agrega fotos de tu espacio</Text>

      <TouchableOpacity style={styles.uploadArea} onPress={onPickPhotos}>
        <Camera size={40} color={colors.accent} />
        <Text style={styles.uploadText}>Toca para agregar fotos</Text>
        <Text style={styles.uploadHint}>Puedes agregar varias</Text>
      </TouchableOpacity>

      {rentalData.photos.length > 0 && (
        <View style={styles.photosPreview}>
          {rentalData.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photoThumb} />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
        <Text style={styles.secondaryButtonText}>Omitir</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
