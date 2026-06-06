import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Lock, Mail, Phone, User } from 'lucide-react-native'
import { BuyerInputStep } from '@/components/forms/buyer/BuyerInputStep'
import { BuyerLoadingStep } from '@/components/forms/buyer/BuyerLoadingStep'
import { BuyerSearchPreferencesStep } from '@/components/forms/buyer/BuyerSearchPreferencesStep'
import { BuyerSuggestionsStep } from '@/components/forms/buyer/BuyerSuggestionsStep'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { AnimatedLinearFormStepperHeader } from '@/components/forms/shared/AnimatedLinearFormStepperHeader'
import { useLinearStepper } from '@/lib/hooks/use-linear-stepper'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import LogoNegro from '@/app/assets/LogoInicioSVGNegro.svg'
import type { BuyerFormData, BuyerInputStepContent, BuyerStep, SuggestedProperty } from '@/components/forms/buyer/types'
import { registerBuyer } from '@/lib/services/registration-flows'
import {
  hasEmailShape,
  hasMinTrimmedLength,
  hasPasswordLength,
  hasPhoneLength,
} from '@/lib/services/form-validation'

const { width } = Dimensions.get('window')

const theme = clientThemes.searching

interface BuyerFormProps {
  onBack: () => void
}

const linearSteps = ['name', 'email', 'phone', 'password', 'search-preferences'] as const

export default function BuyerForm({ onBack }: BuyerFormProps) {
  const router = useRouter()
  const { setAuthSession } = useSessionDomain()
  const { availableProperties, loadCatalogProperties, hasLoadedCatalog, isCatalogLoading } = usePropertyDomain()
  
  const [step, setStep] = useState<BuyerStep>('name')
  const [formData, setFormData] = useState<BuyerFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    searchType: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [suggestedProperties, setSuggestedProperties] = useState<SuggestedProperty[]>([])

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const stepValidity: Record<(typeof linearSteps)[number], boolean> = {
    name: hasMinTrimmedLength(formData.name, 2),
    email: hasEmailShape(formData.email),
    phone: hasPhoneLength(formData.phone),
    password: hasPasswordLength(formData.password),
    'search-preferences': formData.searchType !== '',
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
    steps: linearSteps,
    isStepValid: (currentStep) => {
      switch (currentStep) {
        case 'name':
        case 'email':
        case 'phone':
        case 'password':
        case 'search-preferences':
          return stepValidity[currentStep]
        default:
          return false
      }
    },
    onStepChange: setStep,
    onExit: onBack,
    onComplete: () => setStep('loading'),
  })

  useEffect(() => {
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [step, progress])

  useEffect(() => {
    if (step === 'loading') {
      const pulseLoop = Animated.loop(
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
      pulseLoop.start()

      const loadAndFilter = async () => {
        await loadCatalogProperties()
      }
      
      loadAndFilter()

      return () => {
        pulseLoop.stop()
      }
    }
  }, [step])

  useEffect(() => {
    if (step === 'loading' && hasLoadedCatalog && !isCatalogLoading) {
      const timer = setTimeout(() => {
        let filtered = [...availableProperties]
        
        if (formData.searchType === 'rent') {
          filtered = filtered.filter(p => p.status === 'for_rent' || p.status === 'available')
        } else if (formData.searchType === 'buy') {
          filtered = filtered.filter(p => p.status === 'for_sale' || p.status === 'available')
        }

        setSuggestedProperties(filtered.slice(0, 4))
        setStep('suggestions')
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [step, hasLoadedCatalog, isCatalogLoading, availableProperties])

  const handleNext = () => {
    Keyboard.dismiss()
    void goNext()
  }

  const handleBack = () => {
    Keyboard.dismiss()
    void goBack()
  }

  const handleSkipPreferences = async () => {
    const registered = await completeRegistration()
    if (!registered) return
    router.replace('/(tabs)')
  }

  const completeRegistration = async () => {
    const result = await registerBuyer(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        searchType: formData.searchType,
      },
      setAuthSession
    )

    if (!result.success) {
      console.error('Error al registrar el usuario', result.error)
    }

    return result.success
  }

  const handlePropertySelect = async () => {
    const registered = await completeRegistration()
    if (!registered) return
    router.replace(`/(tabs)/catalog`)
  }

  const handleExploreAll = async () => {
    const registered = await completeRegistration()
    if (!registered) return
    router.replace('/(tabs)/catalog')
  }

  const getStepContent = (): BuyerInputStepContent | null => {
    switch (step) {
      case 'name':
        return {
          title: 'Hola, bienvenido',
          subtitle: 'Empecemos con tu nombre',
          hint: 'Asi te llamaremos en la app',
          icon: User,
          placeholder: 'Tu nombre completo',
          value: formData.name,
          onChange: (text: string) => updateFormData('name', text),
          keyboardType: 'default' as const,
        }
      case 'email':
        return {
          title: 'Mantente conectado',
          subtitle: 'Tu correo electronico',
          hint: 'Para enviarte las mejores opciones',
          icon: Mail,
          placeholder: 'correo@ejemplo.com',
          value: formData.email,
          onChange: (text: string) => updateFormData('email', text),
          keyboardType: 'email-address' as const,
        }
      case 'phone':
        return {
          title: 'Una linea directa',
          subtitle: 'Tu número de teléfono',
          hint: 'Solo para contactarte sobre propiedades de tu interes',
          icon: Phone,
          placeholder: '55 1234 5678',
          value: formData.phone,
          onChange: (text: string) => updateFormData('phone', text),
          keyboardType: 'phone-pad' as const,
        }
      case 'password':
        return {
          title: 'Protege tu cuenta',
          subtitle: 'Crea una contraseña segura',
          hint: 'Minimo 6 caracteres',
          icon: Lock,
          placeholder: 'Tu contraseña',
          value: formData.password,
          onChange: (text: string) => updateFormData('password', text),
          keyboardType: 'default' as const,
          secureTextEntry: true,
        }
      default:
        return null
    }
  }

  const inputStepContent = getStepContent()

  return (
    <View style={styles.container}>
      {/* Logo de fondo centrado y transparente */}
      <View style={styles.backgroundLogoContainer}>
        <LogoNegro width={280} height={280} style={styles.backgroundLogo} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header con progreso */}
        {step !== 'loading' && step !== 'suggestions' && (
          <AnimatedLinearFormStepperHeader
            onBack={handleBack}
            backColor={theme.text}
            progressTrackColor={theme.border}
            progressFillColor={theme.primary}
            progressTextColor={theme.textMuted}
            currentStep={Math.min(currentStepIndex + 1, totalSteps)}
            totalSteps={totalSteps}
            progressWidth={progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            })}
          />
        )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'loading' && (
          <BuyerLoadingStep
            styles={styles}
            pulseStyle={{ transform: [{ scale: pulseAnim }] }}
            Logo={LogoNegro}
          />
        )}
        {step === 'suggestions' && (
          <BuyerSuggestionsStep
            animatedStyle={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            styles={styles}
            theme={theme}
            suggestedProperties={suggestedProperties}
            searchType={formData.searchType}
            onSelectProperty={() => void handlePropertySelect()}
            onExploreAll={() => void handleExploreAll()}
          />
        )}
        {step === 'search-preferences' && (
          <BuyerSearchPreferencesStep
            animatedStyle={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            styles={styles}
            theme={theme}
            formData={formData}
            isCurrentStepValid={isCurrentStepValid}
            onSelectSearchType={(value) => updateFormData('searchType', value)}
            onContinue={handleNext}
            onSkip={() => void handleSkipPreferences()}
          />
        )}
        {['name', 'email', 'phone', 'password'].includes(step) && inputStepContent ? (
          <BuyerInputStep
            animatedStyle={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            styles={styles}
            theme={theme}
            step={step}
            content={inputStepContent}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((current) => !current)}
            onContinue={handleNext}
            isCurrentStepValid={isCurrentStepValid}
          />
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepHeader: {
    gap: spacing.sm,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
  },
  stepSubtitle: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: theme.text,
  },
  inputHint: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    paddingLeft: spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: theme.border,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.textLight,
  },
  // Search preferences
  searchTypeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  searchTypeOption: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    gap: spacing.sm,
    position: 'relative',
  },
  searchTypeOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '08',
  },
  searchTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: theme.warmLight || theme.surfaceLight || theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTypeIconSelected: {
    backgroundColor: theme.primary,
  },
  searchTypeTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  searchTypeTitleSelected: {
    color: theme.primary,
  },
  searchTypeDesc: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferencesButtons: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.body.fontSize,
    color: theme.textMuted,
    textDecorationLine: 'underline',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  loadingText: {
    fontSize: typography.h4.fontSize,
    fontWeight: '500',
    color: theme.text,
    marginTop: spacing.lg,
  },
  // Suggestions
  suggestionsContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  suggestionsHeader: {
    gap: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },
  suggestionsSubtitle: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
  },
  propertiesList: {
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.md,
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.warmLight || theme.surfaceLight || theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
    gap: 2,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyAddress: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    flex: 1,
  },
  propertyPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: theme.primary,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  noResultsText: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  exploreAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: 'auto',
  },
  exploreAllButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.surface,
  },
})
