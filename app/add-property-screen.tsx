import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { 
  ArrowLeft,
  Home,
  Building2,
  Map,
  MapPin,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Check,
} from 'lucide-react-native'

type PropertyType = 'house' | 'apartment' | 'land'
type AcquisitionType = 'inicio' | 'external'

export default function AddPropertyScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null)
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    purchasePrice: '',
    sqMeters: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  })

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Submit form - guardar propiedad
      router.back()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return propertyType !== null
      case 2:
        return acquisitionType !== null
      case 3:
        return formData.title && formData.address && formData.city
      case 4:
        return formData.purchasePrice && formData.sqMeters
      default:
        return true
    }
  }

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de propiedad</Text>
      <Text style={styles.stepSubtitle}>Selecciona el tipo de inmueble que deseas registrar</Text>

      <View style={styles.optionsGrid}>
        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'house' && styles.optionCardSelected]}
          onPress={() => setPropertyType('house')}
        >
          <Home size={32} color={propertyType === 'house' ? colors.accent : colors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'house' && styles.optionLabelSelected]}>
            Casa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'apartment' && styles.optionCardSelected]}
          onPress={() => setPropertyType('apartment')}
        >
          <Building2 size={32} color={propertyType === 'apartment' ? colors.accent : colors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'apartment' && styles.optionLabelSelected]}>
            Departamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'land' && styles.optionCardSelected]}
          onPress={() => setPropertyType('land')}
        >
          <Map size={32} color={propertyType === 'land' ? colors.accent : colors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'land' && styles.optionLabelSelected]}>
            Terreno
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Como adquiriste esta propiedad?</Text>
      <Text style={styles.stepSubtitle}>Esto nos ayuda a dar mejor seguimiento</Text>

      <View style={styles.listingOptions}>
        <TouchableOpacity 
          style={[styles.listingOption, acquisitionType === 'inicio' && styles.listingOptionSelected]}
          onPress={() => setAcquisitionType('inicio')}
        >
          {acquisitionType === 'inicio' && (
            <View style={styles.checkIcon}>
              <Check size={16} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.listingOptionTitle, acquisitionType === 'inicio' && styles.listingOptionTitleSelected]}>
            Con Inicio Real Estate
          </Text>
          <Text style={styles.listingOptionDesc}>
            Compre esta propiedad a traves de Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.listingOption, acquisitionType === 'external' && styles.listingOptionSelected]}
          onPress={() => setAcquisitionType('external')}
        >
          {acquisitionType === 'external' && (
            <View style={styles.checkIcon}>
              <Check size={16} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.listingOptionTitle, acquisitionType === 'external' && styles.listingOptionTitleSelected]}>
            De manera externa
          </Text>
          <Text style={styles.listingOptionDesc}>
            Adquiri esta propiedad por otro medio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informacion basica</Text>
      <Text style={styles.stepSubtitle}>Ingresa los datos de tu propiedad</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nombre de la propiedad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Casa en Polanco"
          placeholderTextColor={colors.textMuted}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Direccion</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={colors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="Calle, numero, colonia"
            placeholderTextColor={colors.textMuted}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Ciudad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad"
          placeholderTextColor={colors.textMuted}
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />
      </View>

      {propertyType !== 'land' && (
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Recamaras</Text>
            <View style={styles.inputWithIcon}>
              <Bed size={20} color={colors.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
              />
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Banos</Text>
            <View style={styles.inputWithIcon}>
              <Bath size={20} color={colors.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  )

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Detalles de la propiedad</Text>
      <Text style={styles.stepSubtitle}>Informacion sobre precio y tamano</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Precio de compra</Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={20} color={colors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={formData.purchasePrice}
            onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
          />
          <Text style={styles.inputSuffix}>MXN</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Metros cuadrados</Text>
        <View style={styles.inputWithIcon}>
          <Ruler size={20} color={colors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={formData.sqMeters}
            onChangeText={(text) => setFormData({ ...formData, sqMeters: text })}
          />
          <Text style={styles.inputSuffix}>m²</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Descripcion (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe las caracteristicas de tu propiedad..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
        />
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Propiedad</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Paso {step} de {totalSteps}</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, !canProceed() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.continueButtonText}>
              {step === totalSteps ? 'Guardar propiedad' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.md,
  },
  stepContent: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  stepSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  optionLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: colors.text,
  },
  listingOptions: {
    gap: spacing.md,
  },
  listingOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  listingOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingOptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  listingOptionTitleSelected: {
    color: colors.primary,
  },
  listingOptionDesc: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formGroup: {
    gap: spacing.xs,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputInner: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  inputSuffix: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
})
