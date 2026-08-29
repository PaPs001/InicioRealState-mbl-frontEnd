import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { AppModal } from '@/components/AppModal'
import type { AgentLeadNotion } from '@/lib/types'

import { styles } from './styles/NotionModal.style'

type NotionModalProps = {
  visible: boolean
  isSaving: boolean
  error: string | null
  agentLeadNotion?: AgentLeadNotion
  onSave: (name: string) => void | Promise<void>
  onClose: () => void
}

export function NotionModal({ visible, isSaving, error, agentLeadNotion, onSave, onClose }: NotionModalProps) {
  const [name, setName] = useState('')
  const trimmedName = name.trim()
  const isEditingNotion = agentLeadNotion?.status === true
  const modalTitle = isEditingNotion ? 'Cambiar nombre en Notion' : 'Activar Notion'
  const modalSubtitle = isEditingNotion ? 'Actualiza tu nombre de identificación en Notion' : 'Escribe tu nombre de identificación en Notion'

  useEffect(() => {
    if (visible) {
      // If Notion is already active, populate the field with the current name
      if (isEditingNotion && agentLeadNotion?.name) {
        setName(agentLeadNotion.name)
      } else {
        setName('')
      }
    } else {
      setName('')
    }
  }, [visible, isEditingNotion, agentLeadNotion])

  const handleClose = () => {
    if (!isSaving) {
      setName('')
      onClose()
    }
  }

  return (
    <AppModal
      visible={visible}
      title={modalTitle}
      subtitle={modalSubtitle}
      onClose={handleClose}
      closeDisabled={isSaving}
      closeOnBackdropPress={!isSaving}
      keyboardAvoiding
      footer={
        <View style={styles.footer}>
          <Pressable disabled={isSaving} onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={isSaving || !trimmedName}
            onPress={() => onSave(trimmedName)}
            style={[styles.acceptButton, (!trimmedName || isSaving) && styles.disabledButton]}
          >
            <Text style={styles.acceptButtonText}>{isSaving ? 'Guardando...' : 'Aceptar'}</Text>
          </Pressable>
        </View>
      }
    >
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        editable={!isSaving}
        onChangeText={setName}
        placeholder="Nombre en Notion"
        placeholderTextColor="#8a9497"
        style={styles.input}
        value={name}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </AppModal>
  )
}