import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { X } from 'lucide-react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export interface ModalProps {
  /** Si el modal esta visible */
  visible: boolean
  /** Callback al cerrar */
  onClose: () => void
  /** Titulo del modal */
  title?: string
  /** Contenido del modal */
  children: React.ReactNode
  /** Si se puede cerrar tocando fuera */
  dismissable?: boolean
  /** Si muestra el boton de cerrar */
  showCloseButton?: boolean
  /** Tamano del modal */
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Footer del modal (botones de accion) */
  footer?: React.ReactNode
  /** Colores personalizados del tema */
  theme?: {
    surface?: string
    background?: string
    text?: string
    textMuted?: string
    border?: string
  }
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  dismissable = true,
  showCloseButton = true,
  size = 'md',
  footer,
  theme: customTheme,
}: ModalProps) {
  const theme = {
    surface: customTheme?.surface || colors.surface,
    background: customTheme?.background || colors.background,
    text: customTheme?.text || colors.text,
    textMuted: customTheme?.textMuted || colors.textMuted,
    border: customTheme?.border || colors.border,
  }

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { maxWidth: 320, width: '85%' }
      case 'lg':
        return { maxWidth: 600, width: '95%' }
      case 'full':
        return { width: '100%', height: '100%', borderRadius: 0 }
      default:
        return { maxWidth: 480, width: '90%' }
    }
  }

  const handleBackdropPress = () => {
    if (dismissable) {
      onClose()
    }
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View
                style={[
                  styles.container,
                  { backgroundColor: theme.surface },
                  getSizeStyles(),
                  size === 'full' && styles.fullContainer,
                ]}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    {title && (
                      <Text style={[styles.title, { color: theme.text }]}>
                        {title}
                      </Text>
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={24} color={theme.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>

                {/* Footer */}
                {footer && (
                  <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    {footer}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    borderRadius: borderRadius.xl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  fullContainer: {
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
})

export default Modal
