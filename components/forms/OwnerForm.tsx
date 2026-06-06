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
import { OwnerBenefitsStep } from '@/components/forms/owner/OwnerBenefitsStep'
import { OwnerPropertiesFoundStep } from '@/components/forms/owner/OwnerPropertiesFoundStep'
import { OwnerPropertiesNotFoundStep } from '@/components/forms/owner/OwnerPropertiesNotFoundStep'
import { OwnerPropertyQuestionStep } from '@/components/forms/owner/OwnerPropertyQuestionStep'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { OnboardingInputStep } from '@/components/forms/shared/OnboardingInputStep'
import { LinearFormStepperFooter } from '@/components/forms/shared/LinearFormStepperFooter'
import { LinearFormStepperHeader } from '@/components/forms/shared/LinearFormStepperHeader'
import { useLinearStepper } from '@/lib/hooks/use-linear-stepper'
import { registerOwner } from '@/lib/services/registration-flows'
import {
  hasEmailShape,
  hasMinTrimmedLength,
  hasPasswordLength,
  hasPhoneLength,
} from '@/lib/services/form-validation'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'

const { width, height } = Dimensions.get('window')

// Colores exclusivos para inversionistas - Azul profundo elegante y Dorado
const investorColors = {
  background: clientThemes.investor.background,
  surface: clientThemes.investor.surface,
  surfaceLight: clientThemes.investor.surfaceLight,
  gold: clientThemes.investor.accent,
  goldMuted: '#8b7355',
  goldLight: clientThemes.investor.accentLight,
  text: clientThemes.investor.text,
  textSecondary: clientThemes.investor.textSecondary,
  textMuted: clientThemes.investor.textMuted,
  border: clientThemes.investor.border,
  success: '#4ade80',
  error: '#ef4444',
}

type Step =
  | 'name'
  | 'email'
  | 'phone'
  | 'password'
  | 'property-question'
  | 'properties-found'
  | 'properties-not-found'
  | 'benefits'

const progressSteps = ['name', 'email', 'phone', 'password', 'property-question'] as const

export default function OwnerForm() {
  const { setAuthSession } = useSessionDomain()
  
  const router = useRouter()
  const [step, setStep] = useState<Step>('name')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [hasPropertiesWithUs, setHasPropertiesWithUs] = useState<boolean | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [propertiesFound, setPropertiesFound] = useState<boolean | null>(null)
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

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

  const stepValidity: Record<(typeof progressSteps)[number], boolean> = {
    name: hasMinTrimmedLength(fullName, 3),
    email: hasEmailShape(email),
    phone: hasPhoneLength(phone),
    password: hasPasswordLength(password),
    'property-question': true,
  }

  const completeRegistration = async () => {
    const result = await registerOwner(
      {
        fullName,
        email,
        phone,
        password,
      },
      setAuthSession
    )

    if (!result.success) {
      console.error('Error al registrar el usuario inversionista', result.error)
    }

    return result.success
  }

  const {
    currentIndex: currentStepIndex,
    totalSteps,
    progress,
    isCurrentStepValid,
    goBack,
    goNext,
  } = useLinearStepper({
    currentStep: step,
    steps: progressSteps,
    isStepValid: (currentStep) => {
      switch (currentStep) {
        case 'name':
        case 'email':
        case 'phone':
        case 'password':
        case 'property-question':
          return stepValidity[currentStep]
        default:
          return false
      }
    },
    onStepChange: setStep,
    onExit: () => router.back(),
  })

  const handleBack = () => {
    Keyboard.dismiss()

    switch (step) {
      case 'name':
      case 'email':
      case 'phone':
      case 'password':
      case 'property-question':
        void goBack()
        return
      case 'properties-found':
      case 'properties-not-found':
        setStep('property-question')
        setPropertiesFound(null)
        setIsSearching(false)
        return
      case 'benefits':
        setStep('property-question')
        return
    }
  }

  const handleContinue = () => {
    Keyboard.dismiss()

    switch (step) {
      case 'name':
      case 'email':
      case 'phone':
      case 'password':
        void goNext()
        return
    }
  }
 //esto tiene que ser cambiado despues de todo solo es simulacion para encontrar usuario y sus propiedades
  const handlePropertyQuestion = (answer: boolean) => {
    setHasPropertiesWithUs(answer)
    if (answer) {
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
        const found = Math.random() > 0.5
        setPropertiesFound(found)
        setStep(found ? 'properties-found' : 'properties-not-found')
      }, 2500)
    } else {
      setStep('benefits')
    }
  }

  const handleFinish = async () => {
    const registered = await completeRegistration()
    if (!registered) return

    router.replace('/(tabs)')
  }

  const renderStep = () => {
    const animatedStepStyle = { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }

    switch (step) {
      case 'name':
        return (
          <OnboardingInputStep
            animatedStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            styles={styles}
            title="Comencemos con lo basico"
            subtitle="¿Cómo te gustaría que te llamemos?"
            label="Nombre completo"
            inputKey="owner-name"
            placeholder="Escribe tu nombre completo"
            placeholderTextColor={investorColors.textMuted}
            value={fullName}
            hint="Usaremos este nombre para personalizar tu experiencia"
            onChangeText={setFullName}
          />
        )

      case 'email':
        return (
          <OnboardingInputStep
            animatedStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            styles={styles}
            title="Mantente conectado"
            subtitle="Tu correo sera tu acceso exclusivo"
            label="Correo electronico"
            inputKey="owner-email"
            placeholder="tu@correo.com"
            placeholderTextColor={investorColors.textMuted}
            value={email}
            hint="Aqui recibiras actualizaciones de tus inversiones"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )

      case 'phone':
        return (
          <OnboardingInputStep
            animatedStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            styles={styles}
            title="Una linea directa"
            subtitle="Para que tu asesor pueda contactarte"
            label="Número de teléfono"
            inputKey="owner-phone"
            placeholder="+52 55 1234 5678"
            placeholderTextColor={investorColors.textMuted}
            value={phone}
            hint="Solo te contactaremos cuando sea importante"
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )

      case 'password':
        return (
          <OnboardingInputStep
            animatedStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            styles={styles}
            title="Protege tu cuenta"
            subtitle="Crea una contraseña segura"
            label="Contraseña"
            inputKey="owner-password"
            placeholder="Minimo 6 caracteres"
            placeholderTextColor={investorColors.textMuted}
            value={password}
            hint="Tu información está protegida con encriptación"
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        )

      case 'property-question':
        return (
          <OwnerPropertyQuestionStep
            animatedStyle={animatedStepStyle}
            colors={investorColors}
            styles={styles}
            pulseStyle={{ transform: [{ scale: pulseAnim }] }}
            onSelect={handlePropertyQuestion}
          />
        )

      case 'properties-found':
        return (
          <OwnerPropertiesFoundStep
            animatedStyle={animatedStepStyle}
            colors={investorColors}
            styles={styles}
            onFinish={handleFinish}
          />
        )

      case 'properties-not-found':
        return (
          <OwnerPropertiesNotFoundStep
            animatedStyle={animatedStepStyle}
            colors={investorColors}
            styles={styles}
            onFinish={handleFinish}
            onRetry={() => setStep('property-question')}
          />
        )

      case 'benefits':
        return (
          <OwnerBenefitsStep
            animatedStyle={animatedStepStyle}
            colors={investorColors}
            styles={styles}
            onFinish={handleFinish}
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
          
          <Text style={styles.searchingTitle}>Buscando tus propiedades...</Text>
          <Text style={styles.searchingSubtitle}>
            Estamos verificando nuestros registros para vincular tus inversiones
          </Text>
          
          <ActivityIndicator size="large" color={investorColors.gold} style={styles.loader} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Logo de fondo centrado y transparente - fuera del KeyboardAvoidingView para que no se mueva */}
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
          backColor={investorColors.gold}
          progressTrackColor={investorColors.surface}
          progressFillColor={investorColors.gold}
          progressTextColor={investorColors.textMuted}
          currentStep={Math.max(currentStepIndex + 1, 1)}
          totalSteps={totalSteps}
          progress={progress}
          showProgress={progressSteps.includes(step as (typeof progressSteps)[number])}
          headerStyle={styles.header}
          backButtonStyle={styles.backButton}
        />

        {/* Contenido del paso */}
        {renderStep()}

        {/* Boton continuar (solo para pasos 1-4) */}
        {['name', 'email', 'phone', 'password'].includes(step) && (
          <LinearFormStepperFooter
            disabled={!isCurrentStepValid}
            label={step === 'password' ? 'Crear cuenta' : 'Continuar'}
            onPress={handleContinue}
            buttonColor={investorColors.gold}
            textColor={investorColors.background}
            disabledButtonColor={investorColors.surface}
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
    backgroundColor: investorColors.background,
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
    color: investorColors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    color: investorColors.textSecondary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: investorColors.gold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: investorColors.surface,
    borderWidth: 1,
    borderColor: investorColors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 4,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
  },
  hint: {
    color: investorColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },

  // Pantalla de pregunta de propiedades
  questionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: investorColors.gold,
  },
  questionTitle: {
    color: investorColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  questionSubtitle: {
    color: investorColors.textSecondary,
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
    justifyContent: 'space-between',
    backgroundColor: investorColors.surface,
    borderWidth: 1,
    borderColor: investorColors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionText: {
    color: investorColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },

  // Pantalla de busqueda
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
    color: investorColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  searchingSubtitle: {
    color: investorColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.lg,
  },

  // Pantalla de exito
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: investorColors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    color: investorColors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    color: investorColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  propertyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
    gap: spacing.md,
  },
  propertyPreviewText: {
    flex: 1,
  },
  propertyPreviewTitle: {
    color: investorColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  propertyPreviewSubtitle: {
    color: investorColors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  primaryButton: {
    backgroundColor: investorColors.gold,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: investorColors.background,
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.textSecondary,
    textAlign: 'center',
  },

  // Pantalla de no encontrado
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: investorColors.border,
  },
  notFoundTitle: {
    color: investorColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  notFoundSubtitle: {
    color: investorColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  // Pantalla de beneficios
  benefitsContainer: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  benefitsTitle: {
    color: investorColors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  benefitsSubtitle: {
    color: investorColors.textSecondary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
  },
  benefitsList: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    color: investorColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDescription: {
    color: investorColors.textMuted,
    fontSize: typography.bodySmall.fontSize,
  },
})
