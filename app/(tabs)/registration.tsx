import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency } from '@/lib/utils'
import { 
  Building2, 
  DollarSign, 
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  ChevronDown,
  Check
} from 'lucide-react-native'

export default function RegistrationScreen() {
  const { availableProperties } = usePropertyDomain()
  const [transactionType, setTransactionType] = useState<'rent' | 'sale'>('rent')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [showPropertyPicker, setShowPropertyPicker] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [referralCode, setReferralCode] = useState('')

  const handleSubmit = () => {
    if (!selectedProperty || !clientName || !clientPhone || !amount) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos')
      return
    }
    Alert.alert(
      'Registro Enviado',
      'Tu registro de ' + (transactionType === 'sale' ? 'venta' : 'renta') + ' ha sido enviado para revision.',
      [{ text: 'OK' }]
    )
  }

  const selectedPropertyData = availableProperties.find(p => p.id === selectedProperty)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tipo de transaccion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Transaccion</Text>
          <View style={styles.toggleContainer}>
            {/*<TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'sale' && styles.toggleButtonActive]}
              onPress={() => setTransactionType('sale')}
            >
              <Text style={[styles.toggleText, transactionType === 'sale' && styles.toggleTextActive]}>
                Venta
              </Text>
            </TouchableOpacity>*/}
            <TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'rent' && styles.toggleButtonActive]}
              onPress={() => setTransactionType('rent')}
            >
              <Text style={[styles.toggleText, transactionType === 'rent' && styles.toggleTextActive]}>
                Renta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de propiedad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedad</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowPropertyPicker(!showPropertyPicker)}
          >
            <Building2 size={20} color={colors.accent} />
            <Text style={styles.selectButtonText}>
              {selectedPropertyData ? selectedPropertyData.title : 'Seleccionar propiedad'}
            </Text>
            <ChevronDown size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {showPropertyPicker && (
            <View style={styles.pickerContainer}>
              {availableProperties.map(property => (
                <TouchableOpacity
                  key={property.id}
                  style={[
                    styles.pickerOption,
                    selectedProperty === property.id && styles.pickerOptionActive
                  ]}
                  onPress={() => {
                    setSelectedProperty(property.id)
                    setShowPropertyPicker(false)
                  }}
                >
                  <Text style={styles.pickerOptionText}>{property.title}</Text>
                  <Text style={styles.pickerOptionPrice}>{formatCurrency(property.price)}</Text>
                  {selectedProperty === property.id && (
                    <Check size={16} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {transactionType === 'sale' ? 'Precio de Venta' : 'Renta Mensual'}
          </Text>
          <View style={styles.inputContainer}>
            <DollarSign size={20} color={colors.accent} />
            <TextInput
              style={styles.input}
              placeholder={transactionType === 'sale' ? 'Ej: 5000000' : 'Ej: 25000'}
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color={colors.accent} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo *"
              placeholderTextColor={colors.textMuted}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={colors.accent} />
            <TextInput
              style={styles.input}
              placeholder="Telefono *"
              placeholderTextColor={colors.textMuted}
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.accent} />
            <TextInput
              style={styles.input}
              placeholder="Correo electronico (opcional)"
              placeholderTextColor={colors.textMuted}
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Codigo de referido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Codigo de Referido (opcional)</Text>
          <View style={styles.inputContainer}>
            <FileText size={20} color={colors.accent} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa el codigo"
              placeholderTextColor={colors.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Documentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={24} color={colors.accent} />
            <Text style={styles.uploadButtonText}>Subir documentos</Text>
            <Text style={styles.uploadHint}>Contrato, identificaciones, etc.</Text>
          </TouchableOpacity>
        </View>

        {/* Boton de enviar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar Registro</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.primaryDark,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectButtonText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  pickerOptionActive: {
    backgroundColor: colors.primaryDark,
  },
  pickerOptionText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  pickerOptionPrice: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderDark,
  },
  uploadButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  uploadHint: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
})
