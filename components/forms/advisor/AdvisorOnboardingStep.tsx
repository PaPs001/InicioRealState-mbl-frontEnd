import { Text, TextInput, View } from 'react-native'
import { OnboardingInputStep } from '@/components/forms/shared/OnboardingInputStep'

interface AdvisorOnboardingStepProps {
  step: number
  styles: any
  colors: any
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  onChangeFirstName: (value: string) => void
  onChangeLastName: (value: string) => void
  onChangeEmail: (value: string) => void
  onChangePhone: (value: string) => void
  onChangePassword: (value: string) => void
}

export function AdvisorOnboardingStep({
  step,
  styles,
  colors,
  firstName,
  lastName,
  email,
  phone,
  password,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangePhone,
  onChangePassword,
}: AdvisorOnboardingStepProps) {
  if (step === 1) {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.title}>Como te gustaria que te llamemos?</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            key="advisor-first-name"
            style={styles.input}
            placeholder="Escribe tu nombre"
            placeholderTextColor={colors.textMuted}
            value={firstName}
            onChangeText={onChangeFirstName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            key="advisor-last-name"
            style={styles.input}
            placeholder="Escribe tu apellido"
            placeholderTextColor={colors.textMuted}
            value={lastName}
            onChangeText={onChangeLastName}
          />
        </View>
      </View>
    )
  }

  if (step === 2) {
    return (
      <OnboardingInputStep
        animatedStyle={{}}
        styles={styles}
        title="Ahora escribe tu correo electronico."
        label="Correo electronico"
        inputKey="advisor-email"
        placeholder="correo@ejemplo.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    )
  }

  if (step === 3) {
    return (
      <OnboardingInputStep
        animatedStyle={{}}
        styles={styles}
        title="Agrega tu número de teléfono."
        label="Número de teléfono"
        inputKey="advisor-phone"
        placeholder="Escribe tu numero"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={onChangePhone}
        keyboardType="phone-pad"
      />
    )
  }

  if (step === 4) {
    return (
      <OnboardingInputStep
        animatedStyle={{}}
        styles={styles}
        title="Por último, crea tu contraseña."
        label="Contraseña"
        inputKey="advisor-password"
        placeholder="Crea una contraseña"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
    )
  }

  return null
}
