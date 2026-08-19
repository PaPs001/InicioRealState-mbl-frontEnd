import {X} from 'lucide-react-native'
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

type NextActionModalProps = {
  visible: boolean
  action: string
  actionAt: string
  error?: string | null
  isSaving?: boolean
  onActionChange: (value: string) => void
  onActionAtChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function NextActionModal({
  visible,
  action,
  actionAt,
  error,
  isSaving = false,
  onActionChange,
  onActionAtChange,
  onClose,
  onSubmit,
}: NextActionModalProps) {
  const insets = useSafeAreaInsets()

  const close = () => {
    if (!isSaving) onClose()
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
        >
          <Pressable
            style={[styles.modal, {paddingBottom: 18 + insets.bottom}]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Próxima acción</Text>
                <Text style={styles.subtitle}>Define tu próxima acción con este lead</Text>
              </View>

              <Pressable
                accessibilityLabel="Cerrar modal"
                accessibilityRole="button"
                disabled={isSaving}
                onPress={close}
                style={styles.closeButton}
              >
                <X color="#193A31" size={20} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Acción</Text>
                <TextInput
                  editable={!isSaving}
                  multiline
                  onChangeText={onActionChange}
                  placeholder="Ej. Enviar información por WhatsApp"
                  placeholderTextColor="#8B9691"
                  style={[styles.input, styles.actionInput]}
                  textAlignVertical="top"
                  value={action}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Fecha y hora</Text>
                <TextInput
                  editable={!isSaving}
                  onChangeText={onActionAtChange}
                  placeholder="2026-08-21 17:00"
                  placeholderTextColor="#8B9691"
                  style={styles.input}
                  value={actionAt}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={isSaving}
                onPress={close}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={isSaving}
                onPress={onSubmit}
                style={[styles.submitButton, isSaving && styles.disabledButton]}
              >
                <Text style={styles.submitButtonText}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 24, 21, 0.52)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFDF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4DED5',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#193A31',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 3,
    color: '#697B74',
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2EDE5',
  },
  form: {
    gap: 16,
    paddingVertical: 18,
  },
  field: {
    gap: 7,
  },
  label: {
    color: '#193A31',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D5DBD8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    color: '#193A31',
    fontSize: 14,
    lineHeight: 20,
  },
  actionInput: {
    minHeight: 82,
  },
  error: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FDECEC',
    color: '#A33232',
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4DED5',
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#C9D0CD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#193A31',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#193A31',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#193A31',
  },
  disabledButton: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
})
