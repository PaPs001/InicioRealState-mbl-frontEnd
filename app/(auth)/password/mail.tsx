import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { PrimaryButton, SecondaryButton } from '@/components/buttons'
import {
  getPasswordResetErrorMessage,
  requestPasswordReset,
  validatePasswordResetEmail,
} from '@/lib/services/password-reset'

export default function PasswordResetMailScreen() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!validatePasswordResetEmail(email)) {
      setErrorMessage('Ingresa un correo valido.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await requestPasswordReset(email)
      router.push({
        pathname: '/password/verify',
        params: { email: email.trim().toLowerCase() },
      })
    } catch (error) {
      setErrorMessage(getPasswordResetErrorMessage(error, 'No se pudo enviar el codigo.'))
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
              <Text style={styles.title}>Recuperemos tu contraseña </Text>
              <Text style={styles.subTitle}>Ingresa el correo de tu cuenta. </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.emailInput}
                placeholder="Correo electronico"
                placeholderTextColor="#b1aeae"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={email}
                onChangeText={(value) => {
                  setEmail(value)
                  if (errorMessage) setErrorMessage('')
                }}
              />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <View style={styles.buttonContent}>
                <PrimaryButton onPress={handleSubmit}>
                  {isSubmitting ? 'Enviando...' : 'Enviar codigo '}
                </PrimaryButton>
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
  emailInput: {
    color: '#000000',
    borderRadius: 12,
    backgroundColor: '#FCFAF8',
    minHeight: 48,
    width: '100%',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E7DDCF',
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
