import { Text, TouchableOpacity, View } from 'react-native'
import { Camera, Image as ImageIcon } from 'lucide-react-native'

import { investorColors, styles } from './shared'

type PhotosStepProps = {
  photos: string[]
  handleAddPhoto: () => void
}

export function PhotosStep({ photos, handleAddPhoto }: PhotosStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fotos de tu propiedad</Text>
      <Text style={styles.stepSubtitle}>Agrega fotos para tener un mejor registro (opcional)</Text>

      <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
        <Camera size={40} color={investorColors.accent} />
        <Text style={styles.photoButtonText}>Agregar fotos</Text>
        <Text style={styles.photoButtonSubtext}>Toca para seleccionar imagenes</Text>
      </TouchableOpacity>

      {photos.length > 0 ? (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={`${photo}-${index}`} style={styles.photoPreview}>
              <ImageIcon size={24} color={investorColors.accent} />
              <Text style={styles.photoPreviewText}>Foto {index + 1}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.infoBox}>
        <ImageIcon size={20} color={investorColors.accent} />
        <Text style={styles.infoBoxText}>
          Las fotos te ayudan a mantener un registro visual de tu propiedad. Puedes agregarlas ahora o después desde el detalle de la propiedad.
        </Text>
      </View>
    </View>
  )
}
