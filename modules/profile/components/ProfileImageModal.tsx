import { Image, Pressable, Text } from 'react-native'
import { AppModal } from '@/components/AppModal'
import {styles} from './styles/ProfileImageModal.styles'
type ProfileImageModalProps = {
  visible: boolean
  title: string
  imageUri?: string
  error?: string | null
  isSaving: boolean
  onSelectImage: () => void | Promise<void>
  onSave: () => void | Promise<void>
  onClose: () => void
}

export function ProfileImageModal({
  visible,
  title,
  imageUri,
  error,
  isSaving,
  onSelectImage,
  onSave,
  onClose,
}: ProfileImageModalProps) {
  return (
    <AppModal
      visible={visible}
      title={title}
      onClose={onClose}
      closeDisabled={isSaving}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <Text style={styles.instructions}>Escoge una imagen de tu galería.</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={isSaving} onPress={onSelectImage} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {imageUri ? 'Cambiar imagen' : 'Escoger imagen'}
        </Text>
      </Pressable>
      {imageUri ? (
        <Pressable
          disabled={isSaving}
          onPress={onSave}
          style={[styles.primaryButton, isSaving && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Guardando...' : 'Guardar foto'}
          </Text>
        </Pressable>
      ) : null}
      <Pressable disabled={isSaving} onPress={onClose} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </Pressable>
    </AppModal>
  )
}
