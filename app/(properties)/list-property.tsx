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
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'

const investorColors = clientThemes.investor
import { mockProperties, formatCurrency } from '@/lib/mock-data'
import { 
  ArrowLeft,
  Home,
  DollarSign,
  Camera,
  MapPin,
  Check,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native'

type ListingType = 'sale' | 'rent'

export default function ListPropertyScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [step, setStep] = useState(1)
  const [listingType, setListingType] = useState<ListingType | null>(null)
  const [price, setPrice] = useState('')
  const [skipPhotos, setSkipPhotos] = useState(false)
  const [address, setAddress] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const property = mockProperties.find(p => p.id === id)
  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setShowSuccess(true)
    } else {
      router.back()
    }
  }

  const handleSuccessDismiss = () => {
    router.back()
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return listingType !== null
      case 2:
        return price.length > 0
      case 3:
        return true // Photos are optional
      case 4:
        return address.length > 0
      default:
        return true
    }
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={investorColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enlistar Propiedad</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={investorColors.textMuted} />
          <Text style={styles.emptyStateText}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Propiedad Enlistada</Text>
          <Text style={styles.successText}>
            Tu propiedad ha sido enlistada exitosamente. Un asesor de Inicio Real Estate se comunicara contigo pronto para coordinar los siguientes pasos.
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={handleSuccessDismiss}>
            <Text style={styles.successButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de listado</Text>
      <Text style={styles.stepSubtitle}>¿Cómo deseas enlistar tu propiedad?</Text>

      <View style={styles.listingOptions}>
        <TouchableOpacity 
          style={[styles.listingOption, listingType === 'sale' && styles.listingOptionSelected]}
          onPress={() => setListingType('sale')}
        >
          {listingType === 'sale' && (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          )}
          <Text style={[styles.listingOptionTitle, listingType === 'sale' && styles.listingOptionTitleSelected]}>
            Venta
          </Text>
          <Text style={styles.listingOptionDesc}>
            Quiero vender esta propiedad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.listingOption, listingType === 'rent' && styles.listingOptionSelected]}
          onPress={() => setListingType('rent')}
        >
          {listingType === 'rent' && (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          )}
          <Text style={[styles.listingOptionTitle, listingType === 'rent' && styles.listingOptionTitleSelected]}>
            Renta
          </Text>
          <Text style={styles.listingOptionDesc}>
            Quiero rentar esta propiedad
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {listingType === 'sale' ? 'Precio de venta' : 'Renta mensual'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {listingType === 'sale' 
          ? 'Define el precio al que quieres vender tu propiedad'
          : 'Define la renta mensual que deseas cobrar'
        }
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>
          {listingType === 'sale' ? 'Precio de venta' : 'Renta mensual'}
        </Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <Text style={styles.inputSuffix}>
            {listingType === 'sale' ? 'MXN' : 'MXN/mes'}
          </Text>
        </View>
      </View>

      {property.currentValue && (
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionLabel}>Valor estimado actual:</Text>
          <Text style={styles.suggestionValue}>{formatCurrency(property.currentValue)}</Text>
        </View>
      )}
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Imagenes de la propiedad</Text>
      <Text style={styles.stepSubtitle}>
        Agrega fotos de tu propiedad para atraer mas interesados
      </Text>

      <TouchableOpacity style={styles.photoButton}>
        <Camera size={32} color={investorColors.accent} />
        <Text style={styles.photoButtonText}>Agregar fotos</Text>
        <Text style={styles.photoButtonSubtext}>Toca para seleccionar imagenes</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <AlertCircle size={20} color={colors.info} />
        <Text style={styles.infoBoxText}>
          Si no tienes fotos en este momento, no te preocupes. Nuestros asesores pueden encargarse de tomar las fotos mas tarde.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.skipOption, skipPhotos && styles.skipOptionSelected]}
        onPress={() => setSkipPhotos(!skipPhotos)}
      >
        <View style={[styles.checkbox, skipPhotos && styles.checkboxSelected]}>
          {skipPhotos && <Check size={14} color={investorColors.primary} />}
        </View>
        <Text style={styles.skipOptionText}>
          Omitir por ahora, los asesores se encargaran
        </Text>
      </TouchableOpacity>
    </View>
  )

  // Step 4: Ubicacion
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ubicacion de la propiedad</Text>
      <Text style={styles.stepSubtitle}>
        Confirma o actualiza la direccion de tu propiedad
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Dirección completa</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder={property.address}
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
      </View>

      <View style={styles.currentAddressCard}>
        <Text style={styles.currentAddressLabel}>Dirección registrada:</Text>
        <Text style={styles.currentAddressValue}>{property.address}, {property.city}</Text>
      </View>
    </View>
  )

  // Step 5: Confirmacion
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirmar listado</Text>
      <Text style={styles.stepSubtitle}>
        Revisa los detalles antes de publicar tu propiedad
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Home size={24} color={investorColors.accent} />
          <Text style={styles.summaryTitle}>{property.title}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tipo de listado</Text>
          <Text style={styles.summaryValue}>
            {listingType === 'sale' ? 'Venta' : 'Renta'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {listingType === 'sale' ? 'Precio' : 'Renta mensual'}
          </Text>
          <Text style={[styles.summaryValue, { color: investorColors.accent }]}>
            {formatCurrency(Number(price))}
            {listingType === 'rent' && '/mes'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fotos</Text>
          <Text style={styles.summaryValue}>
            {skipPhotos ? 'Por agregar (asesor)' : 'Por subir'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ubicacion</Text>
          <Text style={styles.summaryValue}>{address || property.address}</Text>
        </View>
      </View>

      <Text style={styles.confirmQuestion}>
        Estas seguro que quieres enlistar esta propiedad?
      </Text>

      <View style={styles.confirmButtons}>
        <TouchableOpacity 
          style={styles.confirmButtonNo}
          onPress={() => handleConfirm(false)}
        >
          <Text style={styles.confirmButtonNoText}>No, cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.confirmButtonYes}
          onPress={() => handleConfirm(true)}
        >
          <Text style={styles.confirmButtonYesText}>Si, enlistar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enlistar Propiedad</Text>
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
          {step === 5 && renderStep5()}
        </ScrollView>

        {/* Footer - only for steps 1-4 */}
        {step < 5 && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.continueButton, !canProceed() && styles.continueButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: investorColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
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
    backgroundColor: investorColors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
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
    color: investorColors.text,
  },
  stepSubtitle: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
    marginTop: -spacing.sm,
  },
  listingOptions: {
    gap: spacing.md,
  },
  listingOption: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: investorColors.border,
    position: 'relative',
  },
  listingOptionSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingOptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  listingOptionTitleSelected: {
    color: investorColors.accent,
  },
  listingOptionDesc: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    marginTop: spacing.xs,
  },
  formGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: investorColors.text,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  inputInner: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
  },
  inputSuffix: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textMuted,
  },
  suggestionCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.accent + '40',
  },
  suggestionLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  suggestionValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.accent,
    marginTop: spacing.xs,
  },
  photoButton: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: investorColors.accent,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  photoButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.accent,
  },
  photoButtonSubtext: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.info,
    lineHeight: 20,
  },
  skipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  skipOptionSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: investorColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: investorColors.accent,
    borderColor: investorColors.accent,
  },
  skipOptionText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
  },
  currentAddressCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  currentAddressLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  currentAddressValue: {
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryTitle: {
    flex: 1,
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: investorColors.border,
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmQuestion: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmButtonNo: {
    flex: 1,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  confirmButtonNoText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.text,
  },
  confirmButtonYes: {
    flex: 1,
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmButtonYesText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: investorColors.border,
  },
  continueButton: {
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: investorColors.border,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: investorColors.text,
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  successButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
})
