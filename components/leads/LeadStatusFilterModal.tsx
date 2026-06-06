import { Modal, Text, TouchableOpacity, View } from 'react-native'
import { X } from 'lucide-react-native'

import { colors } from '@/lib/theme'
import { leadStatusLabels } from '@/lib/services/leads-domain'

type LeadStatusFilterModalProps = {
  onClose: () => void
  onSelectStatus: (status: string) => void
  statusFilter: string
  styles: any
  visible: boolean
}

export function LeadStatusFilterModal({
  onClose,
  onSelectStatus,
  statusFilter,
  styles,
  visible,
}: LeadStatusFilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por estado</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.filterOption, statusFilter === 'todos' && styles.filterOptionActive]}
            onPress={() => {
              onSelectStatus('todos')
              onClose()
            }}
          >
            <Text style={styles.filterOptionText}>Todos</Text>
          </TouchableOpacity>

          {Object.entries(leadStatusLabels).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterOption, statusFilter === key && styles.filterOptionActive]}
              onPress={() => {
                onSelectStatus(key)
                onClose()
              }}
            >
              <View style={[styles.statusDot, { backgroundColor: value.color }]} />
              <Text style={styles.filterOptionText}>{value.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  )
}
