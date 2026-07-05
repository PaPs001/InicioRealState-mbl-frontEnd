import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Mail, RefreshCcw } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import {
  confirmRegisterVerificationCode,
  formatRegisterVerificationCountdown,
  getRegisterVerificationParams,
  isRegisterVerificationCodeComplete,
  normalizeRegisterVerificationCode,
  REGISTER_VERIFICATION_CODE_LENGTH,
  REGISTER_VERIFICATION_RESEND_SECONDS,
  requestRegisterVerificationCode,
} from '@/lib/services/register-user-verification'
import { registerOwnerVerifyStyles } from './verify.styles'
export default function RegisterOwnerVerifyScreen() {
  const router = useRouter()
  const inputRefs = useRef<Array<TextInput | null>>([])
  const params = useLocalSearchParams<{
    clientType?: string
    fullName?: string
    email?: string
    phone?: string
    password?: string
  }>()
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(REGISTER_VERIFICATION_RESEND_SECONDS)
  const [showError, setShowError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const codeCharacters = Array.from({ length: REGISTER_VERIFICATION_CODE_LENGTH }, (_, index) => code[index] ?? '-')
  const isComplete = isRegisterVerificationCodeComplete(code)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  const focusCodeInput = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), REGISTER_VERIFICATION_CODE_LENGTH - 1)
    inputRefs.current[safeIndex]?.focus()
  }

  const handleDigitChange = (value: string, index: number) => {
    const digits = normalizeRegisterVerificationCode(value)
    setShowError(false)

    if (!digits) {
      const nextCharacters = codeCharacters.map((character) => (character === '-' ? '' : character))
      nextCharacters[index] = ''
      setCode(nextCharacters.join(''))
      return
    }

    const nextCharacters = codeCharacters.map((character) => (character === '-' ? '' : character))
    digits.split('').forEach((digit, offset) => {
      const targetIndex = index + offset
      if (targetIndex < REGISTER_VERIFICATION_CODE_LENGTH) {
        nextCharacters[targetIndex] = digit
      }
    })

    setCode(nextCharacters.join(''))

    const nextIndex = Math.min(index + digits.length, REGISTER_VERIFICATION_CODE_LENGTH - 1)
    if (index + digits.length < REGISTER_VERIFICATION_CODE_LENGTH) {
      focusCodeInput(nextIndex)
    }
  }

  const handleDigitKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== 'Backspace') return

    if (codeCharacters[index] && codeCharacters[index] !== '-') return

    const previousIndex = index - 1
    if (previousIndex < 0) return

    const nextCharacters = codeCharacters.map((character) => (character === '-' ? '' : character))
    nextCharacters[previousIndex] = ''
    setCode(nextCharacters.join(''))
    focusCodeInput(previousIndex)
  }

  const handleVerify = async () => {
    if (!isRegisterVerificationCodeComplete(code) || isVerifying) {
      setShowError(true)
      focusCodeInput(code.length)
      return
    }

    setIsVerifying(true)
    try {
      const verification = await confirmRegisterVerificationCode(params.email ?? '', code)
      router.push({
        pathname: '/regInquilino/welcome' as never,
        params: getRegisterVerificationParams({
          clientType: (params.clientType as never) ?? 'owner',
          registrationAccess: '1',
          fullName: params.fullName,
          email: params.email,
          phone: params.phone,
          password: params.password,
          emailVerificationToken: verification.emailVerificationToken,
        }),
      })
    } catch (error) {
      setShowError(true)
      Alert.alert(
        'Codigo invalido',
        error instanceof Error ? error.message : 'Revisa el codigo e intentalo de nuevo.',
      )
      focusCodeInput(0)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return

    setIsResending(true)
    try {
      await requestRegisterVerificationCode({
        clientType: (params.clientType as never) ?? 'owner',
        registrationAccess: '1',
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        password: params.password,
      })
      setCode('')
      setShowError(false)
      setSecondsLeft(REGISTER_VERIFICATION_RESEND_SECONDS)
      focusCodeInput(0)
    } catch (error) {
      Alert.alert(
        'No se pudo reenviar el codigo',
        error instanceof Error ? error.message : 'Intentalo de nuevo en unos momentos.',
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <SafeAreaView style={registerOwnerVerifyStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <TouchableOpacity
        style={registerOwnerVerifyStyles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={23} color="#064936" strokeWidth={1.8} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={registerOwnerVerifyStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerOwnerVerifyStyles.main}>
          <View style={registerOwnerVerifyStyles.headerArea}>
            <View style={registerOwnerVerifyStyles.logoWrap}>
              <LogoIRSPrincipal width={146} height={48} />
            </View>

            <View style={registerOwnerVerifyStyles.progressRow}>
              <Text style={registerOwnerVerifyStyles.progressLabel}>Paso 2 de 6</Text>
              <View style={registerOwnerVerifyStyles.progressTrack}>
                <View style={registerOwnerVerifyStyles.progressActive} />
              </View>
            </View>

            <View style={registerOwnerVerifyStyles.titleBlock}>
              <Text style={registerOwnerVerifyStyles.title}>Verifica tu acceso</Text>
              <Text style={registerOwnerVerifyStyles.subtitle}>
                Te enviaremos un codigo de 6 digitos para confirmar tu identidad
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={registerOwnerVerifyStyles.codeArea}
            activeOpacity={1}
            onPress={() => focusCodeInput(code.length)}
          >
            <View style={registerOwnerVerifyStyles.codeBoxes}>
              {codeCharacters.map((character, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref
                  }}
                  style={[
                    registerOwnerVerifyStyles.codeBox,
                    registerOwnerVerifyStyles.codeBoxText,
                    index === 3 && registerOwnerVerifyStyles.codeGap,
                    index === code.length && registerOwnerVerifyStyles.codeBoxActive,
                  ]}
                  value={character === '-' ? '' : character}
                  onChangeText={(value) => handleDigitChange(value, index)}
                  onKeyPress={(event) => handleDigitKeyPress(event, index)}
                  keyboardType="number-pad"
                  textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                  maxLength={REGISTER_VERIFICATION_CODE_LENGTH}
                  autoFocus={index === 0}
                  selectTextOnFocus
                  textAlign="center"
                  accessibilityLabel={`Digito ${index + 1} del codigo de verificacion`}
                />
              ))}
            </View>
          </TouchableOpacity>

          <View style={registerOwnerVerifyStyles.cards}>
            <View style={registerOwnerVerifyStyles.infoCard}>
              <Mail size={27} color="#176b37" strokeWidth={1.8} />
              <Text style={registerOwnerVerifyStyles.cardText}>
                Codigo enviado a{'\n'}{params.email || 'correo@ejemplo.com'}
              </Text>
            </View>

            <TouchableOpacity
              style={registerOwnerVerifyStyles.resendCard}
              onPress={handleResend}
              activeOpacity={secondsLeft > 0 || isResending ? 1 : 0.84}
            >
              <RefreshCcw size={28} color="#176b37" strokeWidth={1.8} />
              <Text style={registerOwnerVerifyStyles.cardText}>
                No recibiste el codigo?{'\n'}
                {isResending ? 'Reenviando codigo...' : 'Puedes reenviarlo en'}{' '}
                <Text style={registerOwnerVerifyStyles.countdownText}>
                  {formatRegisterVerificationCountdown(secondsLeft)}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {showError ? (
            <Text style={registerOwnerVerifyStyles.errorText}>
              Ingresa el codigo de 6 digitos para continuar.
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              registerOwnerVerifyStyles.verifyButton,
              (!isComplete || isVerifying) && registerOwnerVerifyStyles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerVerifyStyles.verifyButtonText}>{isVerifying ? 'Verificando...' : 'Verificar codigo'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

