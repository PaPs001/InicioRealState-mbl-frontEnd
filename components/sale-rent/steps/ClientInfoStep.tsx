import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Building2, Mail, Phone, User } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type ClientInfoStepProps = {
  clientComments: string
  clientContactMethod: 'phone' | 'email' | 'whatsapp'
  clientEmail: string
  clientName: string
  clientPhone: string
  clientSearchQuery: string
  selectedClient: string | null
  setClientComments: (value: string) => void
  setClientContactMethod: (value: 'phone' | 'email' | 'whatsapp') => void
  setClientEmail: (value: string) => void
  setClientName: (value: string) => void
  setClientPhone: (value: string) => void
  setClientSearchQuery: (value: string) => void
  setSelectedClient: (value: string | null) => void
}

export function ClientInfoStep(props: ClientInfoStepProps) {
  const {
    clientComments,
    clientContactMethod,
    clientEmail,
    clientName,
    clientPhone,
    clientSearchQuery,
    selectedClient,
    setClientComments,
    setClientContactMethod,
    setClientEmail,
    setClientName,
    setClientPhone,
    setClientSearchQuery,
    setSelectedClient,
  } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Informacion del cliente</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Buscar cliente existente</Text>
        <View style={styles.searchBox}>
          <Building2 size={20} color={advisorTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nombre, teléfono o email..."
            placeholderTextColor={advisorTheme.textMuted}
            value={clientSearchQuery}
            onChangeText={(text) => {
              setClientSearchQuery(text)
              setClientName(text)
              if (selectedClient) setSelectedClient(null)
            }}
          />
        </View>
        <Text style={styles.inputHint}>No se encontraron clientes. Completa los datos manualmente.</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre completo *</Text>
        <View style={styles.inputBox}>
          <User size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Nombre del cliente" placeholderTextColor={advisorTheme.textMuted} value={clientName} onChangeText={setClientName} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Telefono *</Text>
        <View style={styles.inputBox}>
          <Phone size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="10 digitos" placeholderTextColor={advisorTheme.textMuted} keyboardType="phone-pad" value={clientPhone} onChangeText={setClientPhone} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputBox}>
          <Mail size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="correo@ejemplo.com" placeholderTextColor={advisorTheme.textMuted} keyboardType="email-address" autoCapitalize="none" value={clientEmail} onChangeText={setClientEmail} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Metodo de contacto preferido</Text>
        <View style={styles.contactMethodRow}>
          {(['phone', 'email', 'whatsapp'] as const).map((method) => (
            <TouchableOpacity key={method} style={[styles.contactMethodBtn, clientContactMethod === method && styles.contactMethodBtnActive]} onPress={() => setClientContactMethod(method)}>
              <Text style={[styles.contactMethodText, clientContactMethod === method && styles.contactMethodTextActive]}>
                {method === 'phone' ? 'Llamada' : method === 'email' ? 'Email' : 'WhatsApp'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Comentarios (opcional)</Text>
        <TextInput style={styles.textArea} placeholder="Notas adicionales sobre el cliente..." placeholderTextColor={advisorTheme.textMuted} multiline numberOfLines={3} value={clientComments} onChangeText={setClientComments} />
      </View>
    </View>
  )
}
