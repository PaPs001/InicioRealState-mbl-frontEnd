import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import LogoNegro from '@/app/assets/LogoInicioSVGNegro.svg'
import { registerUser } from '@/lib/registerUser'

export default function CompradorForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const isStepOneValid = firstName.trim().length > 0 && lastName.trim().length > 0
  const isStepTwoValid = email.trim().length > 0
  const isStepThreeValid = phone.trim().length > 0
  const isStepFourValid = password.trim().length > 0

  const handleBack = () => {
    if (step === 1) {
      router.back()
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
      router.push({
        pathname: '/register-transition',
        params: {
          title: 'Registro completado',
          subtitle: 'Estamos preparando tu sesión de comprador.',
          loginUserId: 'user-2',
          nextRoute: '/(tabs)',
          durationMs: '1900',
          variant: 'pulse-orb',
        },
      })
      return
    }
  }

  const isCurrentStepValid =
    (step === 1 && isStepOneValid) ||
    (step === 2 && isStepTwoValid) ||
    (step === 3 && isStepThreeValid) ||
    (step === 4 && isStepFourValid)

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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Regresar</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Paso {step} de 4</Text>
          </View>

          {/* Contenido del paso */}
          <View style={styles.stepContent}>
            {step === 1 ? (
              <>
                <Text style={styles.title}>Como te gustaria que te llamemos?</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Escribe tu nombre"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Apellido</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Escribe tu apellido"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Text style={styles.title}>Ahora escribe tu correo electronico.</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Correo electronico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Text style={styles.title}>Agrega tu numero de telefono.</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Numero de telefono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Escribe tu numero"
                    placeholderTextColor={colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <Text style={styles.title}>Por ultimo, crea tu contrasena.</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contrasena</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Crea una contrasena"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </>
            ) : null}
          </View>

          {/* Boton continuar */}
          <View style={styles.footer}>
            <TouchableOpacity
              disabled={!isCurrentStepValid}
              style={[styles.continueButton, !isCurrentStepValid && styles.disabledButton]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {step === 4 ? 'Finalizar' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  stepContent: {
    flex: 1,
  },
  title: {
    color: colors.text,
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
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textInverse,
    textAlign: 'center',
  },
  stepIndicator: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
})
