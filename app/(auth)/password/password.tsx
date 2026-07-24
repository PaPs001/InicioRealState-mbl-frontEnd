import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { PrimaryButton, SecondaryButton } from '@/components/buttons'
import { PasswordTextInput } from '@/app/(auth)/shared/PasswordTextInput'
import {
  finishPasswordReset,
  getPasswordResetErrorMessage,
  validateNewPassword,
} from '@/lib/services/password-reset'

export default function PasswordResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; resetToken?: string }>()
  const resetToken = String(params.resetToken || '')
  const email = String(params.email || '').trim().toLowerCase()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!resetToken) {
      setErrorMessage('Primero verifica el codigo enviado a tu correo.')
      return
    }

    if (!validateNewPassword(password)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres e incluir letras y numeros.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contrasenas no coinciden.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await finishPasswordReset(resetToken, password)
      router.replace('/login/login')
    } catch (error) {
      setErrorMessage(getPasswordResetErrorMessage(error, 'No se pudo cambiar la contrasena.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <LogoIRSPrincipal width={146} height={48} />
          </View>

          <View style={styles.content}>
            <View style={styles.titlesContent}>
              <Text style={styles.title}>Crea tu nueva contraseña </Text>
              <Text style={styles.subTitle}>{email || 'Tu cuenta'} quedara lista para iniciar sesion.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.passwordShell}>
                <PasswordTextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  iconColor="#9D6C26"
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#b1aeae"
                  textContentType="newPassword"
                  toggleStyle={styles.passwordToggle}
                />
              </View>

              <View style={styles.passwordShell}>
                <PasswordTextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  iconColor="#9D6C26"
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#b1aeae"
                  textContentType="newPassword"
                  toggleStyle={styles.passwordToggle}
                />
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <View style={styles.buttonContent}>
                <PrimaryButton onPress={handleSubmit}>
                  {isSubmitting ? 'Guardando...' : 'Guardar contraseña '}
                </PrimaryButton>
                <SecondaryButton onPress={() => router.back()}>
                  Volver 
                </SecondaryButton>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fefbf6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  logo: {
    alignItems: 'center',
    marginTop: 10,
  },
  content: {
    marginTop: 30,
    alignItems: 'center',
    maxWidth: 430,
    width: '100%',
  },
  titlesContent: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#9D6C26',
    fontSize: 28,
    textAlign: 'center',
  },
  subTitle: {
    color: '#737373',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: 18,
    gap: 12,
    maxWidth: 340,
  },
  passwordShell: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#FCFAF8',
    borderWidth: 1,
    borderColor: '#E7DDCF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    minHeight: 48,
    color: '#000000',
    paddingRight: 36,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContent: {
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
})
