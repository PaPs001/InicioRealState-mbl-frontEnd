import { useState, useEffect, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Keyboard,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { useRouter } from 'expo-router'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'
import * as ImagePicker from 'expo-image-picker'
import { RenterRentalContactsStep } from '@/components/forms/renter/RenterRentalContactsStep'
import { RenterRentalDetailsStep } from '@/components/forms/renter/RenterRentalDetailsStep'
import { RenterRentalDocumentsStep } from '@/components/forms/renter/RenterRentalDocumentsStep'
import { RenterRentalPhotosStep } from '@/components/forms/renter/RenterRentalPhotosStep'
import { RenterRentalResolutionStep } from '@/components/forms/renter/RenterRentalResolutionStep'
import { RenterRentalTypeStep } from '@/components/forms/renter/RenterRentalTypeStep'
import { OnboardingInputStep } from '@/components/forms/shared/OnboardingInputStep'
import type { AddDataNow, RentalData, RentalType } from '@/components/forms/renter/types'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { LinearFormStepperFooter } from '@/components/forms/shared/LinearFormStepperFooter'
import { LinearFormStepperHeader } from '@/components/forms/shared/LinearFormStepperHeader'
import { useLinearStepper } from '@/lib/hooks/use-linear-stepper'
import { registerRenter } from '@/lib/services/registration-flows'
import {
  hasEmailShape,
  hasMinTrimmedLength,
  hasPasswordLength,
  hasPhoneLength,
  hasRequiredText,
} from '@/lib/services/form-validation'

const { width, height } = Dimensions.get('window')

// Colores exclusivos para inquilinos - Verde, cafe y dorado
const tenantColors = {
  background: clientThemes.tenant.background,
  surface: clientThemes.tenant.surface,
  surfaceLight: clientThemes.tenant.surfaceLight,
  accent: clientThemes.tenant.accent,
  accentGold: clientThemes.tenant.accentGold,
  green: clientThemes.tenant.green,
  warm: clientThemes.tenant.warm,
  text: clientThemes.tenant.text,
  textSecondary: clientThemes.tenant.textSecondary,
  textMuted: clientThemes.tenant.textMuted,
  border: clientThemes.tenant.border,
  success: '#4ade80',
  error: '#ef4444',
}

export default function RenterForm() {
  const router = useRouter()
  const { setAuthSession } = useSessionDomain()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rentalType, setRentalType] = useState<RentalType>(null)
  const [addDataNow, setAddDataNow] = useState<AddDataNow>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [rentalFound, setRentalFound] = useState<boolean | null>(null)
  
  // Datos de la renta externa
  const [rentalData, setRentalData] = useState<RentalData>({
    startDate: '',
    endDate: '',
    rentalType: '',
    location: '',
    landlordName: '',
    landlordPhone: '',
    agentName: '',
    agentPhone: '',
    monthlyRent: '',
    photos: [],
    documents: [],
  })
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Animacion de entrada al cambiar de paso
  useEffect(() => {
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [step])

  // Animacion de pulso para el loader
  useEffect(() => {
    if (isSearching) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [isSearching])

  // Validaciones
  const stepValidity = {
    1: hasMinTrimmedLength(fullName, 3),
    2: hasEmailShape(email),
    3: hasPhoneLength(phone),
    4: hasPasswordLength(password),
  } as const
  const isRentalInfoValid =
    hasRequiredText(rentalData.startDate) &&
    hasRequiredText(rentalData.endDate) &&
    hasRequiredText(rentalData.rentalType) &&
    hasRequiredText(rentalData.location) &&
    hasRequiredText(rentalData.monthlyRent)

  const { totalSteps, isCurrentStepValid, goBack, goNext } = useLinearStepper({
    currentStep: step,
    steps: [1, 2, 3, 4] as const,
    isStepValid: (currentStep) => stepValidity[currentStep as keyof typeof stepValidity],
    onStepChange: setStep,
    onExit: () => router.back(),
    onComplete: () => setStep(5),
  })

  const handleBack = () => {
    Keyboard.dismiss()

    if (step <= totalSteps) {
      void goBack()
      return
    }
    if (step === 6 && rentalType === 'external') {
      setStep(5)
      return
    }
    if (step === 7) {
      if (addDataNow === 'now') {
        setStep(6)
      } else {
        setStep(5)
      }
      return
    }
    if (step === 8) {
      setStep(7)
      return
    }
    if (step === 9) {
      setStep(8)
      return
    }
    if (step === 10) {
      setStep(5)
      setRentalFound(null)
      setIsSearching(false)
      return
    }
    setStep((currentStep) => currentStep - 1)
  }

  const handleContinue = () => {
    Keyboard.dismiss()

    if (step <= totalSteps) {
      void goNext()
    }
  }

  const updateRentalData = <K extends keyof RentalData>(field: K, value: RentalData[K]) => {
    setRentalData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleRentalTypeQuestion = (type: RentalType) => {
    setRentalType(type)
    if (type === 'with_us') {
      // Simular busqueda de renta
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
        // Simular que encontramos renta (50% probabilidad para demo)
        const found = Math.random() > 0.5
        setRentalFound(found)
        setStep(found ? 6 : 10) // 6: encontrada, 10: no encontrada
      }, 2500)
    } else {
      setStep(6) // Preguntar si quiere agregar datos ahora
    }
  }

  const handleAddDataQuestion = (answer: AddDataNow) => {
    setAddDataNow(answer)
    if (answer === 'now') {
      setStep(7) // Ir a formulario de datos de renta
    } else {
      void handleFinish() // Finalizar y agregar despues
    }
  }

  const handlePhotoPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri)
      setRentalData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  const handleDocumentPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newDocs = result.assets.map(asset => asset.uri)
      setRentalData(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }))
    }
  }

  const completeRegistration = async () => {
    const result = await registerRenter(
      {
        fullName,
        email,
        phone,
        password,
      },
      setAuthSession
    )

    if (!result.success) {
      console.error('Error al registrar el usuario inquilino', result.error)
      return false
    }

    return true
  }

  const handleFinish = async () => {
    const registered = await completeRegistration()
    if (!registered) return

    router.replace('/(tabs)')
  }
  const animatedStepStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }

  // Renderizar contenido segun el paso
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingInputStep
            animatedStyle={animatedStepStyle}
            styles={styles}
            title="Comencemos con lo basico"
            subtitle="¿Cómo te gustaría que te llamemos?"
            label="Nombre completo"
            inputKey="renter-name"
            placeholder="Escribe tu nombre completo"
            placeholderTextColor={tenantColors.textMuted}
            value={fullName}
            hint="Usaremos este nombre para personalizar tu experiencia"
            onChangeText={setFullName}
          />
        )

      case 2:
        return (
          <OnboardingInputStep
            animatedStyle={animatedStepStyle}
            styles={styles}
            title="Mantente conectado"
            subtitle="Tu correo sera tu acceso"
            label="Correo electronico"
            inputKey="renter-email"
            placeholder="tu@correo.com"
            placeholderTextColor={tenantColors.textMuted}
            value={email}
            hint="Aquí recibirás recordatorios de tu renta"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )

      case 3:
        return (
          <OnboardingInputStep
            animatedStyle={animatedStepStyle}
            styles={styles}
            title="Una linea directa"
            subtitle="Para que podamos contactarte"
            label="Número de teléfono"
            inputKey="renter-phone"
            placeholder="+52 55 1234 5678"
            placeholderTextColor={tenantColors.textMuted}
            value={phone}
            hint="Solo te contactaremos cuando sea importante"
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )

      case 4:
        return (
          <OnboardingInputStep
            animatedStyle={animatedStepStyle}
            styles={styles}
            title="Protege tu cuenta"
            subtitle="Crea una contraseña segura"
            label="Contraseña"
            inputKey="renter-password"
            placeholder="Minimo 6 caracteres"
            placeholderTextColor={tenantColors.textMuted}
            value={password}
            hint="Tu información está protegida con encriptación"
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        )

      // Pregunta: Rentas con nosotros o externo?
      case 5:
        return (
          <RenterRentalTypeStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            onSelectType={handleRentalTypeQuestion}
          />
        )

      // Renta con nosotros encontrada
      case 6:
        return (
          <RenterRentalResolutionStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            pulseStyle={{ transform: [{ scale: pulseAnim }] }}
            rentalType={rentalType}
            onFinish={() => void handleFinish()}
            onSelectAddData={handleAddDataQuestion}
          />
        )

      // Datos de la renta - Informacion basica
      case 7:
        return (
          <RenterRentalDetailsStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            rentalData={rentalData}
            isValid={isRentalInfoValid}
            onChangeField={updateRentalData}
            onContinue={() => setStep(8)}
          />
        )

      // Datos del arrendador
      case 8:
        return (
          <RenterRentalContactsStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            rentalData={rentalData}
            onChangeField={updateRentalData}
            onContinue={() => setStep(9)}
            onSkip={() => void handleFinish()}
          />
        )

      // Fotos de la propiedad (opcional)
      case 9:
        return (
          <RenterRentalPhotosStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            rentalData={rentalData}
            onPickPhotos={() => void handlePhotoPicker()}
            onContinue={() => setStep(10)}
            onSkip={() => setStep(10)}
          />
        )

      // Documentacion (opcional) - paso 10 para externos que agregan datos
      case 10:
        return (
          <RenterRentalDocumentsStep
            animatedStyle={animatedStepStyle}
            colors={tenantColors}
            styles={styles}
            rentalType={rentalType}
            rentalFound={rentalFound}
            rentalData={rentalData}
            onPickDocuments={() => void handleDocumentPicker()}
            onFinish={() => void handleFinish()}
            onRetry={() => setStep(5)}
          />
        )

      default:
        return null
    }
  }

  if (isSearching) {
    return (
      <View style={styles.container}>
        <View style={styles.searchingContainer}>
          <Animated.View style={[styles.searchingLogo, { transform: [{ scale: pulseAnim }] }]}>
            <LogoGris width={80} height={80} />
          </Animated.View>
          
          <Text style={styles.searchingTitle}>Buscando tu renta...</Text>
          <Text style={styles.searchingSubtitle}>
            Estamos verificando nuestros registros para vincular tu contrato
          </Text>
          
          <ActivityIndicator size="large" color={tenantColors.accent} style={styles.loader} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Logo de fondo centrado y transparente */}
      <View style={styles.backgroundLogoContainer}>
        <LogoGris width={280} height={280} style={styles.backgroundLogo} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearFormStepperHeader
            onBack={handleBack}
            backColor={tenantColors.accent}
            progressTrackColor={tenantColors.surface}
            progressFillColor={tenantColors.green ?? tenantColors.accent}
            progressTextColor={tenantColors.textMuted}
            currentStep={Math.min(step, totalSteps)}
            totalSteps={totalSteps}
          progress={Math.min(step, totalSteps) / totalSteps}
          showProgress={step <= 4}
          progressTextAlign="right"
          headerStyle={styles.header}
          backButtonStyle={styles.backButton}
        />

        {/* Contenido del paso */}
        {renderStep()}

        {/* Boton continuar (solo para pasos 1-4) */}
        {step <= 4 && (
          <LinearFormStepperFooter
            disabled={!isCurrentStepValid}
            label="Continuar"
            onPress={handleContinue}
            buttonColor={tenantColors.green ?? tenantColors.accent}
            textColor={tenantColors.background}
            disabledButtonColor={tenantColors.surface}
            disabledTextColor={tenantColors.textMuted}
            footerStyle={styles.footer}
          />
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tenantColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  backgroundLogo: {
    opacity: 0.06,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    zIndex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: tenantColors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: tenantColors.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  hint: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  disabledButton: {
    backgroundColor: tenantColors.surface,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  disabledButtonText: {
    color: tenantColors.textMuted,
  },
  // Question styles
  questionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tenantColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: tenantColors.accent,
  },
  questionTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  questionSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  optionSubtext: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  // Success styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tenantColors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  propertyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  propertyPreviewText: {
    marginLeft: spacing.md,
  },
  propertyPreviewTitle: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  propertyPreviewSubtitle: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  primaryButton: {
    backgroundColor: tenantColors.green,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  secondaryButtonText: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  // Not found styles
  notFoundContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tenantColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: tenantColors.warm,
  },
  notFoundTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  notFoundSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  // Type selector
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: tenantColors.surface,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  typeOptionSelected: {
    backgroundColor: tenantColors.green,
    borderColor: tenantColors.green,
  },
  typeOptionText: {
    color: tenantColors.text,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: tenantColors.text,
    fontWeight: '700',
  },
  // Upload area
  uploadArea: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tenantColors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  uploadText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  uploadHint: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  documentsPreview: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  documentsCount: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
  },
  // Searching
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  searchingLogo: {
    marginBottom: spacing.xl,
  },
  searchingTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  searchingSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
})
