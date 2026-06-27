import { useEffect, useRef, useState } from 'react'
import {
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
  formatOwnerVerificationCountdown,
  getOwnerVerificationRegisterParams,
  isOwnerVerificationCodeComplete,
  normalizeOwnerVerificationCode,
  OWNER_VERIFICATION_CODE_LENGTH,
  OWNER_VERIFICATION_RESEND_SECONDS,
} from '@/lib/services/register-owner-verification'
import { registerOwnerVerifyStyles } from './register-owner-verify.styles'

export default function RegisterOwnerVerifyScreen() {
  const router = useRouter()
  const inputRefs = useRef<Array<TextInput | null>>([])
  const params = useLocalSearchParams<{
    fullName?: string
    email?: string
    phone?: string
    password?: string
  }>()
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OWNER_VERIFICATION_RESEND_SECONDS)
  const [showError, setShowError] = useState(false)
  const codeCharacters = Array.from({ length: OWNER_VERIFICATION_CODE_LENGTH }, (_, index) => code[index] ?? '-')
  const isComplete = isOwnerVerificationCodeComplete(code)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  const focusCodeInput = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), OWNER_VERIFICATION_CODE_LENGTH - 1)
    inputRefs.current[safeIndex]?.focus()
  }

  const handleDigitChange = (value: string, index: number) => {
    const digits = normalizeOwnerVerificationCode(value)
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
      if (targetIndex < OWNER_VERIFICATION_CODE_LENGTH) {
        nextCharacters[targetIndex] = digit
      }
    })

    setCode(nextCharacters.join(''))

    const nextIndex = Math.min(index + digits.length, OWNER_VERIFICATION_CODE_LENGTH - 1)
    if (index + digits.length < OWNER_VERIFICATION_CODE_LENGTH) {
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

  const handleVerify = () => {
    if (!isOwnerVerificationCodeComplete(code)) {
      setShowError(true)
      focusCodeInput(code.length)
      return
    }

    router.push({
      pathname: '/register-owner-welcome' as never,
      params: getOwnerVerificationRegisterParams({
        clientType: 'owner',
        ownerAccess: '1',
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        password: params.password,
      }),
    })
  }

  const handleResend = () => {
    if (secondsLeft > 0) return
    setCode('')
    setShowError(false)
    setSecondsLeft(OWNER_VERIFICATION_RESEND_SECONDS)
    focusCodeInput(0)
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
                  maxLength={OWNER_VERIFICATION_CODE_LENGTH}
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
              activeOpacity={secondsLeft > 0 ? 1 : 0.84}
            >
              <RefreshCcw size={28} color="#176b37" strokeWidth={1.8} />
              <Text style={registerOwnerVerifyStyles.cardText}>
                No recibiste el codigo?{'\n'}
                Puedes reenviarlo en{' '}
                <Text style={registerOwnerVerifyStyles.countdownText}>
                  {formatOwnerVerificationCountdown(secondsLeft)}
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
              !isComplete && registerOwnerVerifyStyles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerVerifyStyles.verifyButtonText}>Verificar codigo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
