import { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { createUserProperty } from '@/lib/api-user-properties'
import { 
  ArrowLeft,
} from 'lucide-react-native'
import { AMENITIES, TOTAL_STEPS, type AcquisitionType, type PropertyType } from '@/components/add-property/constants'
import { investorColors, styles } from '@/components/add-property/shared'
import { renderAddPropertyStep } from '@/components/add-property/step-registry'
import type { AddPropertyFormData } from '@/components/add-property/types'

export default function AddPropertyScreen() {
  const router = useRouter()
  const { authToken, currentUser } = useSessionDomain()
  const isDemoSession = !authToken
  const [step, setStep] = useState(1)
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null)
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType | null>(null)
  const [externalAgency, setExternalAgency] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AddPropertyFormData>({
    title: '',
    address: '',
    city: '',
    purchasePrice: '',
    sqMeters: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  })

  useEffect(() => {
    const tokenPreview = authToken ? `${authToken.slice(0, 12)}...` : 'SIN_TOKEN'
    console.log('[auth][add-property]', {
      userId: currentUser?.id ?? null,
      investment: currentUser?.investment ?? null,
      tenant: currentUser?.tenant ?? null,
      token: tokenPreview,
      hasToken: !!authToken,
    })
  }, [authToken, currentUser?.id, currentUser?.investment, currentUser?.tenant])

  const handleSubmit = async () => {
    if (!propertyType) return

    if (!authToken) {
      Alert.alert(
        'Sesion requerida',
        'Para agregar propiedades necesitas iniciar sesion con una cuenta real del backend. El acceso rapido demo no genera token.'
      )
      return
    }

    const amenityLabels = AMENITIES
      .filter((amenity) => selectedAmenities.includes(amenity.id))
      .map((amenity) => amenity.label)

    const normalizedPrice = formData.purchasePrice.trim()
    const normalizedArea = formData.sqMeters.trim()
    const acquisitionLabel = acquisitionType === 'inicio'
      ? 'IRS'
      : acquisitionType === 'external'
        ? `ext ${externalAgency.trim() ? ` con ${externalAgency.trim()}` : ''}`
        : null
        //igual hablar con edwin sobre el almacenado de imagenes
//no olvides arreglar esta parte para enviar los datos correctos
    const payload = {
      id: `prop-${Date.now()}`,
      propertyType,
      name: formData.title.trim(),
      banner: false,
      urlImage: 'https://example.com/image.jpg',
      offer: false,
      zonaText: formData.city.trim(),
      googleDriveImages: 'https://example.com/image.jpg',
      propertyView: "Sea view",
      propertyPayment: "Cash",
      propertyInformation: acquisitionLabel,
      propertyDescription: formData.description.trim() || formData.title.trim(),
      locationUrl: "https://maps.google.com/...",
      isALand: propertyType === 'lot',
      propertyArea: normalizedArea ? `${normalizedArea} m2` : null,
      propertyDimensions: "10x12",
      propertyAmenities: amenityLabels.length > 0 ? amenityLabels.join(', ') : null,
      priceData: normalizedPrice ? `$${normalizedPrice}` : null,
      priceSpecial: null,
      minPrice: null,
      maxPrice: null,
      status: 'disponible',
      parking: selectedAmenities.includes('parking') ? '1' : '1',
      wc: propertyType === 'lot' ? null : (formData.bathrooms.trim() || null),
      bed: propertyType === 'lot' ? null : (formData.bedrooms.trim() || null),
      address: formData.address.trim(),
      originalPhotos: "https://example.com/photos/original.jpg",
      editedPhotos: "https://example.com/photos/edited.jpg",
      list: 'featured',
    } as const

    try {
      setIsSubmitting(true)
      await createUserProperty(payload, authToken)
      Alert.alert(
        'Propiedad guardada',
        currentUser?.name
          ? `La propiedad se agrego correctamente al perfil de ${currentUser.name}.`
          : 'La propiedad se agrego correctamente a tu perfil.'
      )
      router.back()
    } catch (error) {
      console.error('Error al guardar propiedad', error)
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Ocurrio un error al guardar la propiedad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleAddPhoto = () => {
    const mockPhoto = `photo_${photos.length + 1}`
    setPhotos([...photos, mockPhoto])
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
      case 5:
        return true
      case 6:
        return true 
      case 7:
        return true 
      default:
        return true
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={investorColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Propiedad</Text>
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
          {renderAddPropertyStep({
            step,
            isDemoSession,
            propertyType,
            acquisitionType,
            externalAgency,
            selectedAmenities,
            photos,
            formData,
            setPropertyType,
            setAcquisitionType,
            setExternalAgency,
            setFormData,
            toggleAmenity,
            handleAddPhoto,
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, !canProceed() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            <Text style={styles.continueButtonText}>
              {step === TOTAL_STEPS
                ? (isSubmitting
                    ? 'Guardando...'
                    : (isDemoSession ? 'Inicia sesion real para guardar' : 'Guardar propiedad'))
                : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
