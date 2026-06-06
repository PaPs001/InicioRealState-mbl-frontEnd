import { useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react-native'
import { TOTAL_STEPS, type ListingType } from '@/components/list-property/constants'
import { findListablePropertyById } from '@/components/list-property/list-property-domain'
import { investorColors, styles } from '@/components/list-property/shared'
import { renderListPropertyStep } from '@/components/list-property/step-registry'

export default function ListPropertyScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [step, setStep] = useState(1)
  const [listingType, setListingType] = useState<ListingType | null>(null)
  const [price, setPrice] = useState('')
  const [skipPhotos, setSkipPhotos] = useState(false)
  const [address, setAddress] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const property = findListablePropertyById(id)

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
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
            <CheckCircle size={64} color="#22c55e" />
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={investorColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enlistar Propiedad</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Paso {step} de {TOTAL_STEPS}</Text>
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
          {renderListPropertyStep({
            step,
            address,
            listingType,
            price,
            property,
            skipPhotos,
            onChangeAddress: setAddress,
            onChangeListingType: setListingType,
            onChangePrice: setPrice,
            onConfirm: handleConfirm,
            onToggleSkipPhotos: () => setSkipPhotos(prev => !prev),
          })}
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
