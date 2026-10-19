import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Mail, RefreshCcw } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import {
  VerificationCodeInput,
  type VerificationCodeInputHandle,
} from '@/components/VerificationCodeInput'
import {
  confirmRegisterVerificationCode,
  formatRegisterVerificationCountdown,
  getRegisterVerificationParams,
  isRegisterVerificationCodeComplete,
  REGISTER_VERIFICATION_CODE_LENGTH,
  REGISTER_VERIFICATION_RESEND_SECONDS,
  requestRegisterVerificationCode,
} from '@/lib/services/register-user-verification'
import { registerOwnerVerifyStyles } from './verify.styles'
export default function RegisterOwnerVerifyScreen() {
  const router = useRouter()
  const codeInputRef = useRef<VerificationCodeInputHandle>(null)
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
  const isComplete = isRegisterVerificationCodeComplete(code)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  const focusCodeInput = (index: number) => {
    codeInputRef.current?.focus(index)
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
        pathname: '/regOwnerHouse/welcome' as never,
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

          <VerificationCodeInput
            ref={codeInputRef}
            value={code}
            length={REGISTER_VERIFICATION_CODE_LENGTH}
            onChange={(value) => {
              setCode(value)
              setShowError(false)
            }}
            containerStyle={registerOwnerVerifyStyles.codeArea}
            boxesStyle={registerOwnerVerifyStyles.codeBoxes}
            boxStyle={registerOwnerVerifyStyles.codeBox}
            boxTextStyle={registerOwnerVerifyStyles.codeBoxText}
            activeBoxStyle={registerOwnerVerifyStyles.codeBoxActive}
            gapAfterIndex={3}
          />

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

