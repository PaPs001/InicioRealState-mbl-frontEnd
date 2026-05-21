import { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { useAuth } from '@/contexts/AuthContext'
import { createUserProperty } from '@/lib/api-user-properties'
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
  Camera,
  Image as ImageIcon,
  Wifi,
  Car,
  Trees,
  Dumbbell,
  Shield,
  Wind,
  Waves,
  Sparkles,
  Store,
  TrendingUp,
  Tag,
} from 'lucide-react-native'

const investorColors = clientThemes.investor

type PropertyType = 'house' | 'apartment' | 'land'
type AcquisitionType = 'inicio' | 'external'

const AMENITIES = [
  { id: 'wifi', label: 'Internet/Wifi', icon: Wifi },
  { id: 'parking', label: 'Estacionamiento', icon: Car },
  { id: 'garden', label: 'Jardin', icon: Trees },
  { id: 'gym', label: 'Gimnasio', icon: Dumbbell },
  { id: 'security', label: 'Seguridad 24/7', icon: Shield },
  { id: 'ac', label: 'Aire acondicionado', icon: Wind },
  { id: 'pool', label: 'Alberca', icon: Waves },
  { id: 'furnished', label: 'Amueblado', icon: Sparkles },
  { id: 'store', label: 'Cuarto de servicio', icon: Store },
]

export default function AddPropertyScreen() {
  const router = useRouter()
  const { authToken, currentUser } = useAuth()
  const isDemoSession = !authToken
  const [step, setStep] = useState(1)
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null)
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType | null>(null)
  const [externalAgency, setExternalAgency] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const totalSteps = 7

  useEffect(() => {
    const tokenPreview = authToken ? `${authToken.slice(0, 12)}...` : 'SIN_TOKEN'
    console.log('[auth][add-property]', {
      userId: currentUser?.id ?? null,
      role: currentUser?.role ?? null,
      token: tokenPreview,
      hasToken: !!authToken,
    })
  }, [authToken, currentUser?.id, currentUser?.role])

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
      isALand: propertyType === 'land',
      propertyArea: normalizedArea ? `${normalizedArea} m2` : null,
      propertyDimensions: "10x12",
      propertyAmenities: amenityLabels.length > 0 ? amenityLabels.join(', ') : null,
      priceData: normalizedPrice ? `$${normalizedPrice}` : null,
      priceSpecial: null,
      minPrice: null,
      maxPrice: null,
      status: 'disponible',
      parking: selectedAmenities.includes('parking') ? '1' : '1',
      wc: propertyType === 'land' ? null : (formData.bathrooms.trim() || null),
      bed: propertyType === 'land' ? null : (formData.bedrooms.trim() || null),
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
    if (step < totalSteps) {
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
    // Simulacion - en produccion usaria expo-image-picker
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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de propiedad</Text>
      <Text style={styles.stepSubtitle}>Selecciona el tipo de inmueble que deseas registrar</Text>

      <View style={styles.optionsGrid}>
        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'house' && styles.optionCardSelected]}
          onPress={() => setPropertyType('house')}
        >
          <Home size={32} color={propertyType === 'house' ? investorColors.accent : investorColors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'house' && styles.optionLabelSelected]}>
            Casa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'apartment' && styles.optionCardSelected]}
          onPress={() => setPropertyType('apartment')}
        >
          <Building2 size={32} color={propertyType === 'apartment' ? investorColors.accent : investorColors.textMuted} />
          <Text style={[styles.optionLabel, propertyType === 'apartment' && styles.optionLabelSelected]}>
            Departamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, propertyType === 'land' && styles.optionCardSelected]}
          onPress={() => setPropertyType('land')}
        >
          <Map size={32} color={propertyType === 'land' ? investorColors.accent : investorColors.textMuted} />
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
          onPress={() => {
            setAcquisitionType('inicio')
            setExternalAgency('')
          }}
        >
          {acquisitionType === 'inicio' && (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
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
              <Check size={16} color={investorColors.primary} />
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

      {acquisitionType === 'external' && (
        <View style={styles.externalAgencyContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Inmobiliaria (opcional)</Text>
            <Text style={styles.inputHint}>Si compraste con alguna inmobiliaria, indicanos cual</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Century 21, RE/MAX, etc."
              placeholderTextColor={investorColors.textMuted}
              value={externalAgency}
              onChangeText={setExternalAgency}
            />
          </View>
        </View>
      )}
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
          placeholderTextColor={investorColors.textMuted}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Direccion</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="Calle, numero, colonia"
            placeholderTextColor={investorColors.textMuted}
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
          placeholderTextColor={investorColors.textMuted}
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />
      </View>

      {propertyType !== 'land' && (
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Recamaras</Text>
            <View style={styles.inputWithIcon}>
              <Bed size={20} color={investorColors.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="0"
                placeholderTextColor={investorColors.textMuted}
                keyboardType="numeric"
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
              />
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Banos</Text>
            <View style={styles.inputWithIcon}>
              <Bath size={20} color={investorColors.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="0"
                placeholderTextColor={investorColors.textMuted}
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
          <DollarSign size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0.00"
            placeholderTextColor={investorColors.textMuted}
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
          <Ruler size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0"
            placeholderTextColor={investorColors.textMuted}
            keyboardType="numeric"
            value={formData.sqMeters}
            onChangeText={(text) => setFormData({ ...formData, sqMeters: text })}
          />
          <Text style={styles.inputSuffix}>m2</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Descripcion (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe las caracteristicas de tu propiedad..."
          placeholderTextColor={investorColors.textMuted}
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
        />
      </View>
    </View>
  )

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Amenidades</Text>
      <Text style={styles.stepSubtitle}>Selecciona las amenidades que tiene tu propiedad (opcional)</Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES.map((amenity) => {
          const Icon = amenity.icon
          const isSelected = selectedAmenities.includes(amenity.id)
          return (
            <TouchableOpacity
              key={amenity.id}
              style={[styles.amenityCard, isSelected && styles.amenityCardSelected]}
              onPress={() => toggleAmenity(amenity.id)}
            >
              <Icon size={24} color={isSelected ? investorColors.accent : investorColors.textMuted} />
              <Text style={[styles.amenityLabel, isSelected && styles.amenityLabelSelected]}>
                {amenity.label}
              </Text>
              {isSelected && (
                <View style={styles.amenityCheck}>
                  <Check size={12} color={investorColors.primary} />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <Text style={styles.amenitiesHint}>
        Puedes agregar o modificar las amenidades despues
      </Text>
    </View>
  )

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fotos de tu propiedad</Text>
      <Text style={styles.stepSubtitle}>Agrega fotos para tener un mejor registro (opcional)</Text>

      <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
        <Camera size={40} color={investorColors.accent} />
        <Text style={styles.photoButtonText}>Agregar fotos</Text>
        <Text style={styles.photoButtonSubtext}>Toca para seleccionar imagenes</Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoPreview}>
              <ImageIcon size={24} color={investorColors.accent} />
              <Text style={styles.photoPreviewText}>Foto {index + 1}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoBox}>
        <ImageIcon size={20} color={investorColors.accent} />
        <Text style={styles.infoBoxText}>
          Las fotos te ayudan a mantener un registro visual de tu propiedad. Puedes agregarlas ahora o despues desde el detalle de la propiedad.
        </Text>
      </View>
    </View>
  )

  const renderStep7 = () => (
    <View style={styles.stepContent}>
      <View style={styles.finalStepContainer}>
        <View style={styles.finalIconContainer}>
          <Check size={48} color={investorColors.accent} />
        </View>
        
        <Text style={styles.finalTitle}>Todo listo!</Text>
        <Text style={styles.finalSubtitle}>
          Tu propiedad esta lista para ser guardada
        </Text>

        <View style={styles.finalInfoCard}>
          <View style={styles.finalInfoRow}>
            <TrendingUp size={24} color={investorColors.accent} />
            <View style={styles.finalInfoContent}>
              <Text style={styles.finalInfoTitle}>Monitorea tu inversion</Text>
              <Text style={styles.finalInfoDesc}>
                Podras ver el valor actual, ganancias y proyecciones de tu propiedad
              </Text>
            </View>
          </View>

          <View style={styles.finalDivider} />

          <View style={styles.finalInfoRow}>
            <Tag size={24} color={investorColors.accent} />
            <View style={styles.finalInfoContent}>
              <Text style={styles.finalInfoTitle}>Renta o vende cuando quieras</Text>
              <Text style={styles.finalInfoDesc}>
                En cualquier momento puedes poner tu propiedad en renta o en venta con solo unos toques
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.finalHint}>
          Nuestro equipo esta disponible para ayudarte si decides publicar tu propiedad
        </Text>

        {isDemoSession && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Sesion demo detectada</Text>
            <Text style={styles.warningText}>
              Para guardar esta propiedad necesitas iniciar sesion con una cuenta real del backend.
            </Text>
          </View>
        )}
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
          <ArrowLeft size={24} color={investorColors.text} />
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
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, !canProceed() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            <Text style={styles.continueButtonText}>
              {step === totalSteps
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
    paddingVertical: spacing.md,
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
  optionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: investorColors.border,
  },
  optionCardSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  optionLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: investorColors.text,
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
  externalAgencyContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: investorColors.border,
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
    color: investorColors.text,
  },
  inputHint: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    borderWidth: 1,
    borderColor: investorColors.border,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Amenidades
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
    position: 'relative',
  },
  amenityCardSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  amenityLabel: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
  },
  amenityLabelSelected: {
    color: investorColors.text,
  },
  amenityCheck: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesHint: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    textAlign: 'center',
  },
  // Fotos
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
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoPreview: {
    width: 80,
    height: 80,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  photoPreviewText: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginTop: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: investorColors.accent + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    lineHeight: 20,
  },
  // Paso final
  finalStepContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  finalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  finalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: investorColors.text,
    marginBottom: spacing.xs,
  },
  finalSubtitle: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  finalInfoCard: {
    width: '100%',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  finalInfoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  finalInfoContent: {
    flex: 1,
  },
  finalInfoTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  finalInfoDesc: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  finalDivider: {
    height: 1,
    backgroundColor: investorColors.border,
    marginVertical: spacing.md,
  },
  finalHint: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  warningBox: {
    width: '100%',
    marginTop: spacing.lg,
    backgroundColor: investorColors.accent + '15',
    borderColor: investorColors.accent,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningTitle: {
    color: investorColors.text,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
  },
  warningText: {
    color: investorColors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
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
})
