import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Plus, X } from 'lucide-react-native'

import { colors } from '@/lib/theme'
import {
  initialLeadForm,
  leadContactTypeLabels,
  leadSearchIntentLabels,
  type NewLeadForm,
} from '@/lib/services/leads-domain'
import type { LeadContactType, LeadSearchIntent, Property, User } from '@/lib/types'

type NewLeadModalProps = {
  agentOptions: User[]
  isAdmin: boolean
  newLead: NewLeadForm
  onChange: (updater: (current: NewLeadForm) => NewLeadForm) => void
  onClose: () => void
  onSubmit: () => void
  propertyOptions: Property[]
  styles: any
  visible: boolean
}

export function NewLeadModal({
  agentOptions,
  isAdmin,
  newLead,
  onChange,
  onClose,
  onSubmit,
  propertyOptions,
  styles,
  visible,
}: NewLeadModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.createModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo lead</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.textField}
              value={newLead.name}
              onChangeText={value => onChange(prev => ({ ...prev, name: value }))}
              placeholder="Nombre del lead"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.textField}
              value={newLead.phone}
              onChangeText={value => onChange(prev => ({ ...prev, phone: value }))}
              placeholder="55 1234 5678"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Correo opcional</Text>
            <TextInput
              style={styles.textField}
              value={newLead.email}
              onChangeText={value => onChange(prev => ({ ...prev, email: value }))}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>De dónde vino</Text>
            <TextInput
              style={styles.textField}
              value={newLead.source}
              onChangeText={value => onChange(prev => ({ ...prev, source: value }))}
              placeholder="Facebook, Respond, referido..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Fecha de primer contacto</Text>
            <TextInput
              style={styles.textField}
              value={newLead.firstContactDate}
              onChangeText={value => onChange(prev => ({ ...prev, firstContactDate: value }))}
              placeholder={initialLeadForm.firstContactDate}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Propiedad de interés</Text>
            <View style={styles.chipsWrap}>
              {propertyOptions.map(property => (
                <TouchableOpacity
                  key={property.id}
                  style={[styles.choiceChip, newLead.propertyId === property.id && styles.choiceChipActive]}
                  onPress={() => onChange(prev => ({ ...prev, propertyId: property.id }))}
                >
                  <Text style={[styles.choiceChipText, newLead.propertyId === property.id && styles.choiceChipTextActive]}>
                    {property.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tipo de contacto</Text>
            <View style={styles.chipsWrap}>
              {(Object.keys(leadContactTypeLabels) as LeadContactType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.choiceChip, newLead.contactType === type && styles.choiceChipActive]}
                  onPress={() => onChange(prev => ({ ...prev, contactType: type }))}
                >
                  <Text style={[styles.choiceChipText, newLead.contactType === type && styles.choiceChipTextActive]}>
                    {leadContactTypeLabels[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Qué busca</Text>
            <View style={styles.segmentedRow}>
              {(['sale', 'rent'] as LeadSearchIntent[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.segmentedButton, newLead.searchIntent === type && styles.segmentedButtonActive]}
                  onPress={() => onChange(prev => ({ ...prev, searchIntent: type }))}
                >
                  <Text style={[styles.segmentedButtonText, newLead.searchIntent === type && styles.segmentedButtonTextActive]}>
                    {leadSearchIntentLabels[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isAdmin ? (
              <>
                <Text style={styles.inputLabel}>Asesor responsable</Text>
                <View style={styles.chipsWrap}>
                  {agentOptions.map(agent => (
                    <TouchableOpacity
                      key={agent.id}
                      style={[styles.choiceChip, newLead.agentId === agent.id && styles.choiceChipActive]}
                      onPress={() => onChange(prev => ({ ...prev, agentId: agent.id }))}
                    >
                      <Text style={[styles.choiceChipText, newLead.agentId === agent.id && styles.choiceChipTextActive]}>
                        {agent.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
              <Plus size={18} color={colors.primaryDark} />
              <Text style={styles.primaryButtonText}>Guardar lead</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
