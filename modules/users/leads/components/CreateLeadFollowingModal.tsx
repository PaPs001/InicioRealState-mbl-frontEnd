import {useState} from 'react'
import {KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {Image as ImageIcon, X} from 'lucide-react-native'

import {useSessionDomain} from '@/contexts/auth/use-session-domain'
import {createBackendLeadV2Following} from '@/lib/api'

type SelectedImage = {uri: string; name: string; type: string}

type Props = {
  leadId: string
  onClose: () => void
  onCreated?: () => Promise<void> | void
  visible: boolean
}

export function CreateLeadFollowingModal({leadId, onClose, onCreated, visible}: Props) {
  const {authToken} = useSessionDomain()
  const [text, setText] = useState('')
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const close = () => {
    if (isSaving) return
    setText('')
    setSelectedImage(null)
    setError(null)
    onClose()
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return setError('Necesitamos permiso para escoger una imagen.')
    const result = await ImagePicker.launchImageLibraryAsync({allowsEditing: false, mediaTypes: ['images'], quality: 0.8})
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    setSelectedImage({uri: asset.uri, name: asset.fileName || `seguimiento-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg'})
    setError(null)
  }

  const submit = async () => {
    if (!authToken || !leadId) return setError('No hay sesion o lead valido para guardar.')
    if (!text.trim() && !selectedImage) return setError('Agrega texto o una imagen para guardar el seguimiento.')
    setIsSaving(true)
    setError(null)
    try {
      await createBackendLeadV2Following(leadId, {text, contactDate: new Date().toISOString(), contactType: 'app', image: selectedImage}, authToken)
      setText('')
      setSelectedImage(null)
      await onCreated?.()
      onClose()
    } catch (submitError) {
      console.warn('No se pudo guardar el seguimiento v2:', submitError)
      setError('No se pudo guardar el seguimiento. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <Pressable style={styles.modal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>Agregar actividad</Text>
                <Text style={styles.subtitle}>Guarda texto o una imagen en el seguimiento</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} onPress={close}>
                <X size={18} color="#19191f" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Texto del seguimiento</Text>
            <TextInput style={styles.input} value={text} onChangeText={(value) => {setText(value); setError(null)}} placeholder="Escribe la actualizacion del lead" placeholderTextColor="#9a9188" multiline textAlignVertical="top" />
            <TouchableOpacity style={styles.imagePicker} activeOpacity={0.85} onPress={pickImage}>
              <ImageIcon size={16} color="#12382f" />
              <View style={styles.imagePickerCopy}>
                <Text style={styles.imagePickerTitle}>{selectedImage ? 'Imagen seleccionada' : 'Agregar imagen opcional'}</Text>
                <Text style={styles.imagePickerMeta} numberOfLines={1}>{selectedImage?.name || 'Puedes guardar solo texto si lo prefieres'}</Text>
              </View>
            </TouchableOpacity>
            {selectedImage ? <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}><Text style={styles.removeImageText}>Quitar imagen</Text></TouchableOpacity> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabled]} disabled={isSaving} onPress={submit}>
              <Text style={styles.saveText}>{isSaving ? 'Guardando...' : 'Guardar actividad'}</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.24)', justifyContent: 'flex-end'},
  keyboardView: {flex: 1, justifyContent: 'flex-end'},
  modal: {borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#fff', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24},
  header: {flexDirection: 'row', alignItems: 'center', gap: 12},
  titleBlock: {flex: 1, minWidth: 0},
  title: {color: '#19191f', fontSize: 18, lineHeight: 23, fontWeight: '700'},
  subtitle: {marginTop: 3, color: '#717171', fontSize: 12, lineHeight: 16},
  closeButton: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3eee6', alignItems: 'center', justifyContent: 'center'},
  inputLabel: {marginTop: 18, color: '#0c6740', fontSize: 11, lineHeight: 15, fontWeight: '700', textTransform: 'uppercase'},
  input: {minHeight: 112, borderRadius: 12, borderWidth: 1, borderColor: '#d8d1c8', backgroundColor: '#fbfbfb', color: '#19191f', fontSize: 13, lineHeight: 18, paddingHorizontal: 12, paddingVertical: 10, marginTop: 7},
  imagePicker: {minHeight: 58, borderRadius: 12, borderWidth: 1, borderColor: '#d8d1c8', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12},
  imagePickerCopy: {flex: 1, minWidth: 0},
  imagePickerTitle: {color: '#19191f', fontSize: 13, lineHeight: 17, fontWeight: '700'},
  imagePickerMeta: {marginTop: 2, color: '#717171', fontSize: 11, lineHeight: 15},
  removeImage: {alignSelf: 'flex-start', minHeight: 28, justifyContent: 'center', marginTop: 6},
  removeImageText: {color: '#a13b2f', fontSize: 12, lineHeight: 16, fontWeight: '700'},
  error: {color: '#a13b2f', fontSize: 12, lineHeight: 16, marginTop: 10},
  saveButton: {height: 42, borderRadius: 12, backgroundColor: '#064b38', alignItems: 'center', justifyContent: 'center', marginTop: 14},
  disabled: {opacity: 0.65},
  saveText: {color: '#fff', fontSize: 13, lineHeight: 17, fontWeight: '700'},
})
