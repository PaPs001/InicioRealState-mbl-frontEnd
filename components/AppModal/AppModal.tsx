import type { ReactNode } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { styles } from './AppModal.styles'

type AppModalProps = {
  visible: boolean
  children: ReactNode
  onClose: () => void
  title?: string
  closeDisabled?: boolean
}

export function AppModal({
  visible,
  children,
  onClose,
  title,
  closeDisabled = false,
}: AppModalProps) {
  const handleClose = () => {
    if (!closeDisabled) onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={event => event.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
