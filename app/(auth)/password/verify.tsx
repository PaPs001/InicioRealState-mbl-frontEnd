import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { PrimaryButton, SecondaryButton } from '@/components/buttons'
import {
  getPasswordResetErrorMessage,
  isPasswordResetCodeComplete,
  normalizePasswordResetCode,
  requestPasswordReset,
  verifyPasswordReset,
} from '@/lib/services/password-reset'

export default function PasswordResetVerifyScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const email = String(params.email || '').trim().toLowerCase()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleVerify = async () => {
    if (isSubmitting) return

    if (!email) {
      setErrorMessage('Primero ingresa tu correo.')
      return
    }

    if (!isPasswordResetCodeComplete(code)) {
      setErrorMessage('Ingresa el codigo de 6 digitos.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const result = await verifyPasswordReset(email, code)
      router.push({
        pathname: '/password/password',
        params: {
          email: result.email,
          resetToken: result.resetToken,
        },
      })
    } catch (error) {
      setErrorMessage(getPasswordResetErrorMessage(error, 'No se pudo verificar el codigo.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email || isResending) return

    setIsResending(true)
    setMessage('')
    setErrorMessage('')

    try {
      await requestPasswordReset(email)
      setMessage('Te enviamos un nuevo codigo.')
    } catch (error) {
      setErrorMessage(getPasswordResetErrorMessage(error, 'No se pudo reenviar el codigo.'))
    } finally {
      setIsResending(false)
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
              <Text style={styles.title}>Ingresa el codigo </Text>
              <Text style={styles.subTitle}>Lo enviamos a {email || 'tu correo'}.</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.codeInput}
                placeholder="000000"
                placeholderTextColor="#b1aeae"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                value={code}
                onChangeText={(value) => {
                  setCode(normalizePasswordResetCode(value))
                  if (errorMessage) setErrorMessage('')
                }}
              />

              {message ? <Text style={styles.messageText}>{message}</Text> : null}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <View style={styles.buttonContent}>
                <PrimaryButton onPress={handleVerify}>
                  {isSubmitting ? 'Verificando...' : 'Verificar codigo '}
                </PrimaryButton>
                <SecondaryButton onPress={handleResend}>
                  {isResending ? 'Reenviando...' : 'Reenviar codigo '}
                </SecondaryButton>
                <SecondaryButton onPress={() => router.back()}>
                  Volver a
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
  codeInput: {
    color: '#000000',
    borderRadius: 12,
    backgroundColor: '#FCFAF8',
    minHeight: 54,
    width: '100%',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E7DDCF',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 0,
  },
  messageText: {
    color: '#027A48',
    fontSize: 13,
    lineHeight: 18,
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
