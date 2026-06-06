import { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, Keyboard, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from 'react-native'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { useRouter } from 'expo-router'
import TextoLogoInicio from '@/app/assets/TextoLogoInicio.svg'
import { AdvisorOnboardingStep } from '@/components/forms/advisor/AdvisorOnboardingStep'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { LinearFormStepperFooter } from '@/components/forms/shared/LinearFormStepperFooter'
import { LinearFormStepperHeader } from '@/components/forms/shared/LinearFormStepperHeader'
import { useLinearStepper } from '@/lib/hooks/use-linear-stepper'
import { registerAdvisor } from '@/lib/services/registration-flows'
import {
  hasEmailShape,
  hasPasswordLength,
  hasPhoneLength,
  hasRequiredText,
} from '@/lib/services/form-validation'

const { width, height } = Dimensions.get('window')

const advisorColors = {
  background: clientThemes.advisor.background,
  surface: clientThemes.advisor.surface,
  accent: clientThemes.advisor.accent,
  text: clientThemes.advisor.text,
  textSecondary: clientThemes.advisor.textSecondary,
  textMuted: clientThemes.advisor.textMuted,
  border: clientThemes.advisor.border,
  success: '#4ade80',
  error: '#ef4444',
}

export default function AsesorForm() {
  const router = useRouter()
  const { setAuthSession } = useSessionDomain()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const stepValidity = {
    1: hasRequiredText(firstName) && hasRequiredText(lastName),
    2: hasEmailShape(email),
    3: hasPhoneLength(phone),
    4: hasPasswordLength(password),
  } as const

  const completeRegistration = async () => {
    const result = await registerAdvisor(
      {
        firstName,
        lastName,
        email,
        phone,
        password,
      },
      setAuthSession
    )

    if (!result.success) {
      console.error('Error al registrar el asesor', result.error)
      return false
    }

    return true
  }

  const { totalSteps, progress, isCurrentStepValid, goBack, goNext } = useLinearStepper({
    currentStep: step,
    steps: [1, 2, 3, 4] as const,
    isStepValid: (currentStep) => stepValidity[currentStep as keyof typeof stepValidity],
    onStepChange: setStep,
    onExit: () => router.back(),
    onComplete: async () => {
      const registered = await completeRegistration()
      if (!registered) return

      router.replace('/(tabs)')
    },
  })

  const handleBack = () => {
    Keyboard.dismiss()
    void goBack()
  }

  const handleContinue = async () => {
    Keyboard.dismiss()
    await goNext()
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLogoContainer}>
        <TextoLogoInicio width={200} height={80} style={styles.backgroundLogo} />
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
            backColor={advisorColors.accent}
            progressTrackColor={advisorColors.border}
            progressFillColor={advisorColors.accent}
            progressTextColor={advisorColors.textMuted}
            currentStep={step}
            totalSteps={totalSteps}
            progress={progress}
          />

          <AdvisorOnboardingStep
            step={step}
            styles={styles}
            colors={advisorColors}
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            password={password}
            onChangeFirstName={setFirstName}
            onChangeLastName={setLastName}
            onChangeEmail={setEmail}
            onChangePhone={setPhone}
            onChangePassword={setPassword}
          />

          {/* Boton continuar */}
          <LinearFormStepperFooter
            disabled={!isCurrentStepValid}
            label={step === totalSteps ? 'Finalizar' : 'Continuar'}
            onPress={() => void handleContinue()}
            buttonColor={advisorColors.accent}
            textColor={advisorColors.background}
            disabledButtonColor={advisorColors.border}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: advisorColors.background,
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
    opacity: 0.08,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  title: {
    color: advisorColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: advisorColors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: advisorColors.surface,
    borderWidth: 1,
    borderColor: advisorColors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: advisorColors.text,
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
})
