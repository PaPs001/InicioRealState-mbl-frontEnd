import type { ReactNode } from 'react'
import type { ModalProps, ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { ChevronLeft, X } from 'lucide-react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { styles } from './AppModal.styles'

export type AppModalSize = 'small' | 'medium' | 'large' | 'fullscreen'

export type AppModalPosition = 'center' | 'bottom'

type AppModalProps = {
  visible: boolean
  children: ReactNode
  onClose: () => void

  title?: string
  subtitle?: string

  headerLeft?: ReactNode
  headerRight?: ReactNode
  footer?: ReactNode

  onBack?: () => void
  showCloseButton?: boolean

  size?: AppModalSize
  position?: AppModalPosition
  accentColor?: string

  animationType?: ModalProps['animationType']
  statusBarTranslucent?: boolean

  scrollable?: boolean
  keyboardAvoiding?: boolean
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps']

  closeDisabled?: boolean
  closeOnBackdropPress?: boolean

  containerStyle?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  headerStyle?: StyleProp<ViewStyle>
  footerStyle?: StyleProp<ViewStyle>
}

export function AppModal({
  visible,
  children,
  onClose,

  title,
  subtitle,
  headerLeft,
  headerRight,
  footer,

  onBack,
  showCloseButton = false,

  size = 'medium',
  position = 'center',
  accentColor = '#3d5a40',

  animationType = 'fade',
  statusBarTranslucent = true,

  scrollable = false,
  keyboardAvoiding = false,
  keyboardShouldPersistTaps = 'handled',

  closeDisabled = false,
  closeOnBackdropPress = true,

  containerStyle,
  contentStyle,
  headerStyle,
  footerStyle,
}: AppModalProps) {
  const handleClose = () => {
    if (!closeDisabled) {
      onClose()
    }
  }

  const inset = useSafeAreaInsets()

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      handleClose()
    }
  }

  const sizeStyle = {
    small: styles.containerSmall,
    medium: styles.containerMedium,
    large: styles.containerLarge,
    fullscreen: styles.containerFullscreen,
  }[size]

  const positionStyle = position === 'bottom' ? styles.overlayBottom : styles.overlayCenter

  const hasHeader =
    Boolean(title) ||
    Boolean(subtitle) ||
    Boolean(onBack) ||
    Boolean(headerLeft) ||
    Boolean(headerRight) ||
    showCloseButton

  const leftContent = headerLeft ?? (
    onBack ? (
      <Pressable
        style={styles.headerAction}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Regresar"
      >
        <ChevronLeft size={21} color={accentColor} />
      </Pressable>
    ) : null
  )

  const rightContent = headerRight ?? (
    showCloseButton ? (
      <Pressable
        style={styles.headerAction}
        onPress={handleClose}
        disabled={closeDisabled}
        accessibilityRole="button"
        accessibilityLabel="Cerrar modal"
      >
        <X size={20} color={accentColor} />
      </Pressable>
    ) : null
  )

  const modalContent = (
    <Pressable
      style={[
        styles.container,
        sizeStyle,
        position === 'bottom' && styles.bottomContainer,
        containerStyle,
      ]}
      onPress={event => event.stopPropagation()}
      accessibilityViewIsModal
    >
      {hasHeader ? (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerSide}>{leftContent}</View>

          <View style={styles.headerCopy}>
            {title ? (
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={3}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={[styles.headerSide, styles.headerRight]}>
            {rightContent}
          </View>
        </View>
      ) : null}

      {scrollable ? (
        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.content,
              contentStyle,
            ]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}

      {footer ? (
        <View style={[
          styles.footer, ,
          {paddingBottom: 18 + inset.bottom},
          footerStyle
        ]}>
          {footer}
        </View>
      ) : null}
    </Pressable>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={handleClose}
    >
      <Pressable
        style={[styles.overlay, positionStyle]}
        onPress={handleBackdropPress}
      >
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            style={[styles.keyboardAvoidingView, positionStyle]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {modalContent}
          </KeyboardAvoidingView>
        ) : (
          modalContent
        )}
      </Pressable>
    </Modal>
  )
}
