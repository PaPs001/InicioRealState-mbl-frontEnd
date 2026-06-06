import { Text, TouchableOpacity, View } from 'react-native'
import { AlertCircle, Camera, Check } from 'lucide-react-native'

import { colors } from '@/lib/theme'
import { investorColors, styles } from './shared'

type ListingPhotosStepProps = {
  skipPhotos: boolean
  onToggleSkipPhotos: () => void
}

export function ListingPhotosStep({ skipPhotos, onToggleSkipPhotos }: ListingPhotosStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Imagenes de la propiedad</Text>
      <Text style={styles.stepSubtitle}>Agrega fotos de tu propiedad para atraer mas interesados</Text>

      <TouchableOpacity style={styles.photoButton}>
        <Camera size={32} color={investorColors.accent} />
        <Text style={styles.photoButtonText}>Agregar fotos</Text>
        <Text style={styles.photoButtonSubtext}>Toca para seleccionar imagenes</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <AlertCircle size={20} color={colors.info} />
        <Text style={styles.infoBoxText}>
          Si no tienes fotos en este momento, no te preocupes. Nuestros asesores pueden encargarse de tomar las fotos mas tarde.
        </Text>
      </View>

      <TouchableOpacity style={[styles.skipOption, skipPhotos && styles.skipOptionSelected]} onPress={onToggleSkipPhotos}>
        <View style={[styles.checkbox, skipPhotos && styles.checkboxSelected]}>
          {skipPhotos ? <Check size={14} color={investorColors.primary} /> : null}
        </View>
        <Text style={styles.skipOptionText}>Omitir por ahora, los asesores se encargaran</Text>
      </TouchableOpacity>
    </View>
  )
}
