import { Text, TextInput, View } from 'react-native'
import { Building2, Mail, Phone, User } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type ExternalAgentInfoStepProps = {
  externalAgentName: string
  externalCommission: string
  externalCompany: string
  externalEmail: string
  externalPhone: string
  myCommission: string
  setExternalAgentName: (value: string) => void
  setExternalCommission: (value: string) => void
  setExternalCompany: (value: string) => void
  setExternalEmail: (value: string) => void
  setExternalPhone: (value: string) => void
  setMyCommission: (value: string) => void
  setTotalCommission: (value: string) => void
  totalCommission: string
}

export function ExternalAgentInfoStep(props: ExternalAgentInfoStepProps) {
  const {
    externalAgentName,
    externalCommission,
    externalCompany,
    externalEmail,
    externalPhone,
    myCommission,
    setExternalAgentName,
    setExternalCommission,
    setExternalCompany,
    setExternalEmail,
    setExternalPhone,
    setMyCommission,
    setTotalCommission,
    totalCommission,
  } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Asesor o empresa externa</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del asesor *</Text>
        <View style={styles.inputBox}>
          <User size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Nombre del asesor externo" placeholderTextColor={advisorTheme.textMuted} value={externalAgentName} onChangeText={setExternalAgentName} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Empresa / Inmobiliaria</Text>
        <View style={styles.inputBox}>
          <Building2 size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Nombre de la empresa" placeholderTextColor={advisorTheme.textMuted} value={externalCompany} onChangeText={setExternalCompany} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Telefono</Text>
        <View style={styles.inputBox}>
          <Phone size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="10 digitos" placeholderTextColor={advisorTheme.textMuted} keyboardType="phone-pad" value={externalPhone} onChangeText={setExternalPhone} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputBox}>
          <Mail size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="correo@ejemplo.com" placeholderTextColor={advisorTheme.textMuted} keyboardType="email-address" autoCapitalize="none" value={externalEmail} onChangeText={setExternalEmail} />
        </View>
      </View>

      <Text style={styles.sectionDivider}>Division de Comisiones</Text>

      <View style={styles.commissionRow}>
        <View style={styles.commissionItem}>
          <Text style={styles.commissionLabel}>Total</Text>
          <View style={styles.commissionInput}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput style={styles.commissionField} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={totalCommission} onChangeText={setTotalCommission} />
          </View>
        </View>
        <View style={styles.commissionItem}>
          <Text style={styles.commissionLabel}>Externa</Text>
          <View style={styles.commissionInput}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput style={styles.commissionField} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={externalCommission} onChangeText={setExternalCommission} />
          </View>
        </View>
        <View style={styles.commissionItem}>
          <Text style={styles.commissionLabel}>Mi comision</Text>
          <View style={styles.commissionInput}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput style={styles.commissionField} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={myCommission} onChangeText={setMyCommission} />
          </View>
        </View>
      </View>
    </View>
  )
}
