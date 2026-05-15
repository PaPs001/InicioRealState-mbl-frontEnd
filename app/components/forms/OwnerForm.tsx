import { useState, useEffect, useRef } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { ArrowLeft, Check, Building2, Plus, ChevronRight } from 'lucide-react-native'
import { useRouter } from 'expo-router'
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

export default function OwnerForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [hasPropertiesWithUs, setHasPropertiesWithUs] = useState<boolean | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [propertiesFound, setPropertiesFound] = useState<boolean | null>(null)
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
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

  // Animacion del logo al inicio
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
  const isStepOneValid = fullName.trim().length >= 3
  const isStepTwoValid = email.trim().includes('@') && email.trim().includes('.')
  const isStepThreeValid = phone.trim().length >= 10
  const isStepFourValid = password.trim().length >= 6

  const handleBack = () => {
    if (step === 1) {
      router.back()
      return
    }
    if (step === 6 && hasPropertiesWithUs === false) {
      setStep(5)
      return
    }
    if (step === 7) {
      setStep(5)
      setPropertiesFound(null)
      setIsSearching(false)
      return
    }
    setStep((currentStep) => currentStep - 1)
  }

  const handleContinue = () => {
    if (step === 1 && isStepOneValid) {
      setStep(2)
      return
    }
    if (step === 2 && isStepTwoValid) {
      setStep(3)
      return
    }
    if (step === 3 && isStepThreeValid) {
      setStep(4)
      return
    }
    if (step === 4 && isStepFourValid) {
      setStep(5) // Ir a pregunta de propiedades
      return
    }
  }

  const handlePropertyQuestion = (answer: boolean) => {
    setHasPropertiesWithUs(answer)
    if (answer) {
      // Simular busqueda de propiedades
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
        // Simular que encontramos propiedades (50% probabilidad para demo)
        const found = Math.random() > 0.5
        setPropertiesFound(found)
        setStep(found ? 6 : 7) // 6: encontradas, 7: no encontradas
      }, 2500)
    } else {
      setStep(8) // Ir a pantalla de beneficios
    }
  }

  const handleFinish = () => {
    router.push({
      pathname: '/register-transition',
      params: {
        title: 'Bienvenido a Inicio',
        subtitle: 'Tu espacio exclusivo de inversiones esta listo.',
        loginUserId: 'user-1',
        nextRoute: '/(tabs)',
        durationMs: '2200',
        variant: 'pulse-orb',
      },
    })
  }

  const isCurrentStepValid =
    (step === 1 && isStepOneValid) ||
    (step === 2 && isStepTwoValid) ||
    (step === 3 && isStepThreeValid) ||
    (step === 4 && isStepFourValid)

  const totalSteps = 4

  // Renderizar contenido segun el paso
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Comencemos con lo basico</Text>
            <Text style={styles.stepSubtitle}>¿Como te gustaria que te llamemos?</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu nombre completo"
                placeholderTextColor={investorColors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoFocus
              />
              <Text style={styles.hint}>Usaremos este nombre para personalizar tu experiencia</Text>
            </View>
          </Animated.View>
        )

      case 2:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Mantente conectado</Text>
            <Text style={styles.stepSubtitle}>Tu correo sera tu acceso exclusivo</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={investorColors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <Text style={styles.hint}>Aqui recibiras actualizaciones de tus inversiones</Text>
            </View>
          </Animated.View>
        )

      case 3:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Una linea directa</Text>
            <Text style={styles.stepSubtitle}>Para que tu asesor pueda contactarte</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de telefono</Text>
              <TextInput
                style={styles.input}
                placeholder="+52 55 1234 5678"
                placeholderTextColor={investorColors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
              <Text style={styles.hint}>Solo te contactaremos cuando sea importante</Text>
            </View>
          </Animated.View>
        )

      case 4:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Protege tu cuenta</Text>
            <Text style={styles.stepSubtitle}>Crea una contrasena segura</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contrasena</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimo 6 caracteres"
                placeholderTextColor={investorColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
              <Text style={styles.hint}>Tu informacion esta protegida con encriptacion</Text>
            </View>
          </Animated.View>
        )

      case 5:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.questionContainer}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Building2 size={48} color={investorColors.gold} />
              </Animated.View>
              
              <Text style={styles.questionTitle}>¿Ya tienes propiedades con nosotros?</Text>
              <Text style={styles.questionSubtitle}>
                Si ya has invertido con Inicio, podemos vincular automaticamente tus propiedades a tu nueva cuenta
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handlePropertyQuestion(true)}
                >
                  <View style={styles.optionContent}>
                    <Check size={24} color={investorColors.gold} />
                    <Text style={styles.optionText}>Si, tengo propiedades</Text>
                  </View>
                  <ChevronRight size={20} color={investorColors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handlePropertyQuestion(false)}
                >
                  <View style={styles.optionContent}>
                    <Plus size={24} color={investorColors.textSecondary} />
                    <Text style={styles.optionText}>No, soy nuevo</Text>
                  </View>
                  <ChevronRight size={20} color={investorColors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )

      case -1: 
        return null

      case 6:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Check size={40} color={investorColors.background} />
              </View>
              
              <Text style={styles.successTitle}>Propiedades vinculadas</Text>
              <Text style={styles.successSubtitle}>
                Hemos encontrado y vinculado tus propiedades a tu cuenta. Ya puedes acceder a toda la informacion desde tu dashboard.
              </Text>

              <View style={styles.propertyPreview}>
                <Building2 size={24} color={investorColors.gold} />
                <View style={styles.propertyPreviewText}>
                  <Text style={styles.propertyPreviewTitle}>2 propiedades encontradas</Text>
                  <Text style={styles.propertyPreviewSubtitle}>Listas para gestionar</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.primaryButtonText}>Ir a mi dashboard</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )

      // Propiedades no encontradas
      case 7:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.notFoundContainer}>
              <View style={styles.notFoundIcon}>
                <Building2 size={40} color={investorColors.goldMuted} />
              </View>
              
              <Text style={styles.notFoundTitle}>No encontramos propiedades</Text>
              <Text style={styles.notFoundSubtitle}>
                No pudimos vincular propiedades automaticamente. Puedes agregarlas manualmente desde tu dashboard o contactar a tu asesor.
              </Text>

              <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.primaryButtonText}>Continuar al dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(5)}>
                <Text style={styles.secondaryButtonText}>Intentar de nuevo</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )

      case 8:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Bienvenido al mundo de las inversiones</Text>
              <Text style={styles.benefitsSubtitle}>
                Como inversionista de Inicio tendras acceso a:
              </Text>

              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Building2 size={20} color={investorColors.gold} />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>Dashboard personal</Text>
                    <Text style={styles.benefitDescription}>Monitorea todas tus propiedades en un solo lugar</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Check size={20} color={investorColors.gold} />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>Control total</Text>
                    <Text style={styles.benefitDescription}>Gestiona rentas, inquilinos y documentos</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Plus size={20} color={investorColors.gold} />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>Proyecciones</Text>
                    <Text style={styles.benefitDescription}>Visualiza el potencial de tus inversiones</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.primaryButtonText}>Comenzar ahora</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Logo de fondo centrado y transparente */}
      <View style={styles.backgroundLogoContainer}>
        <LogoGris width={280} height={280} style={styles.backgroundLogo} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header sin logo */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color={investorColors.gold} />
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de progreso (solo para pasos 1-4) */}
        {step <= 4 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: `${(step / totalSteps) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Paso {step} de {totalSteps}</Text>
          </View>
        )}

        {/* Contenido del paso */}
        {renderStep()}

        {/* Boton continuar (solo para pasos 1-4) */}
        {step <= 4 && (
          <View style={styles.footer}>
            <TouchableOpacity
              disabled={!isCurrentStepValid}
              style={[styles.continueButton, !isCurrentStepValid && styles.disabledButton]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {step === 4 ? 'Crear cuenta' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: investorColors.background,
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
    opacity: .4,
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
  backButtonText: {
    color: investorColors.gold,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: investorColors.gold,
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: investorColors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    marginTop: spacing.sm,
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
  continueButton: {
    backgroundColor: investorColors.gold,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
  },
  disabledButton: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: investorColors.background,
    textAlign: 'center',
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
