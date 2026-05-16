import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import LogoNegro from '@/app/assets/LogoInicioSVGNegro.svg'

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

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.card}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>¿Cómo te gustaría que te llamemos?</Text>

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
            <Text style={styles.title}>Ahora escribe tu correo electrónico.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
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
            <Text style={styles.title}>Agrega tu número de teléfono.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Número de teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu número"
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
            <Text style={styles.title}>Por último, crea tu contraseña.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Crea una contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </>
        ) : null}

        <Text style={styles.stepIndicator}>Paso {step} de 4</Text>

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
      </View>
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
    opacity: 0.04,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    zIndex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
  continueButton: {
    marginTop: spacing.sm,
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
