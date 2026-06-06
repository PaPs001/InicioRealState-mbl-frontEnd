import { Text, TouchableOpacity, View } from 'react-native'
import { Camera } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyPhotosStepProps = {
  propertyPhotos: string[]
}

export function PropertyPhotosStep({ propertyPhotos }: PropertyPhotosStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Fotografías del inmueble (opcional)</Text>

      <TouchableOpacity style={styles.uploadArea}>
        <Camera size={48} color={advisorTheme.textMuted} />
        <Text style={styles.uploadText}>Toca para subir fotos</Text>
        <Text style={styles.uploadHint}>JPG, PNG - Maximo 10 fotos</Text>
      </TouchableOpacity>

      {propertyPhotos.length > 0 ? (
        <View style={styles.photosPreview}>
          {propertyPhotos.map((photo, index) => (
            <View key={`${photo}-${index}`} style={styles.photoItem}>
              <Text style={styles.photoName}>Foto {index + 1}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}
