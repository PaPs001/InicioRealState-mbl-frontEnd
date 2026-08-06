import { Image, Modal, Pressable, Text, View } from "react-native";

type ModalAddPhotoProps = {
  isOpen: boolean;
  onClose: () => void;
  addImage: () => void
  error?: string | null
  imageUri?: string
  isSaving?: boolean
  onSave: () => void
  title?: string
}
export const ModalAddPhoto = ({
  isOpen,
  onClose,
  addImage,
  error,
  imageUri,
  isSaving = false,
  onSave,
  title = "Foto de perfil",
}: ModalAddPhotoProps) => {
  return(
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: '100%', maxWidth: 420, borderRadius: 18, backgroundColor: '#ffffff', padding: 20, gap: 14 }}
        >
          
        </Pressable>
      </Pressable>
    </Modal>
  )
}
