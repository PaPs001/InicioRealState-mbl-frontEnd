import { useState } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Home, Lock, Mail } from 'lucide-react-native'
import LogoIRSPrincipal from '@/assets/logoIRSprincipal.svg'

import { PasswordTextInput } from '@/app/(auth)/shared/PasswordTextInput'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { API_BUILD_CONFIG, API_URLS, type ApiDebugLogEntry } from '@/lib/api/client'
import { signInWithCredentials } from '@/lib/services/login-session'
import { loginNewStyles } from './login.styles'

const heroImage = require('@/assets/login-new-hero.png')

type VisibleLoginLog = ApiDebugLogEntry & {
  id: string
  time: string
}

const createVisibleLoginLog = (entry: ApiDebugLogEntry): VisibleLoginLog => ({
  ...entry,
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  time: new Date().toLocaleTimeString(),
})

function formatLogDetails(details?: Record<string, unknown>) {
  if (!details) return null

  return JSON.stringify(details, null, 2)
}

function getLogLevelStyle(level: ApiDebugLogEntry['level']) {
  switch (level) {
    case 'success':
      return loginNewStyles.debugLogLevelSuccess
    case 'warning':
      return loginNewStyles.debugLogLevelWarning
    case 'error':
      return loginNewStyles.debugLogLevelError
    default:
      return loginNewStyles.debugLogLevelInfo
  }
}

export default function LoginNewScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false)
  const [loginLogs, setLoginLogs] = useState<VisibleLoginLog[]>([
    createVisibleLoginLog({
      level: 'info',
      message: 'Diagnostico listo. Intenta iniciar sesion para ver cada paso aqui.',
      details: {
        platform: Platform.OS,
        apiBaseUrl: API_URLS.CORE,
        apiBuildConfig: API_BUILD_CONFIG,
      },
    }),
  ])
  const { setAuthSession } = useSessionDomain()
  const router = useRouter()

  const addLoginLog = (entry: ApiDebugLogEntry) => {
    setLoginLogs((currentLogs) => [...currentLogs.slice(-11), createVisibleLoginLog(entry)])
  }

  const handleLogin = async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setLoginLogs([
        createVisibleLoginLog({
          level: 'info',
          message: 'Iniciando intento de login desde esta pantalla.',
          details: {
            platform: Platform.OS,
            apiBaseUrl: API_URLS.CORE,
            apiBuildConfig: API_BUILD_CONFIG,
            hasEmail: !!email.trim(),
            passwordLength: password.length,
          },
        }),
      ])

      const { user, token } = await signInWithCredentials(email, password, addLoginLog)
      addLoginLog({
        level: 'info',
        message: 'La API aprobo el login; guardando usuario y token en el estado local.',
        details: {
          userId: user.id,
          email: user.email,
          systemRole: user.systemRole,
          investment: user.investment,
          tenant: user.tenant,
        },
      })
      await setAuthSession(user, token)
      const destination = getUserHomeRoute(user)
      addLoginLog({
        level: 'success',
        message: 'Sesion guardada correctamente. La app va a navegar al home del usuario.',
        details: {
          destination,
        },
      })
      console.info('[auth][login-new][navigation]', {
        userId: user.id,
        email: user.email,
        systemRole: user.systemRole,
        investment: user.investment,
        tenant: user.tenant,
        destination,
      })
      router.replace(destination)
    } catch (error) {
      console.error('Error al iniciar sesion', error)
      addLoginLog({
        level: 'error',
        message: 'El intento de login fallo antes de navegar. Este mensaje indica el punto final visible para depurar.',
        details: {
          message: error instanceof Error ? error.message : 'No se pudo iniciar sesion',
          errorType: error instanceof Error ? error.name : typeof error,
        },
      })
      setErrorMessage('El correo o la contraseña estan mal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasCredentialError = !!errorMessage

  return (
    <SafeAreaView style={loginNewStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginNewStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={loginNewStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={loginNewStyles.hero}>
            <ImageBackground source={heroImage} style={loginNewStyles.heroImage} imageStyle={loginNewStyles.heroImageContent}>
              <TouchableOpacity
                style={loginNewStyles.brandArc}
                onPress={() => setIsDebugPanelVisible((isVisible) => !isVisible)}
                activeOpacity={0.92}
                accessibilityRole="button"
                accessibilityLabel="Mostrar diagnostico de inicio de sesion"
              >
                <LogoIRSPrincipal width={146} height={48} />
              </TouchableOpacity>
            </ImageBackground>
          </View>

          <View style={loginNewStyles.homeBadge}>
            <Home size={18} color="#bf8638" strokeWidth={1.7} />
          </View>

          <View style={loginNewStyles.content}>
            <Text style={loginNewStyles.title}>Inicia Sesion</Text>
            <Text style={loginNewStyles.subtitle}>Accede a tu cuenta y mejora junto a tus propiedades</Text>

            <View style={loginNewStyles.form}>
              <View style={[loginNewStyles.inputShell, hasCredentialError && loginNewStyles.inputShellError]}>
                <View style={loginNewStyles.inputIcon}>
                  <Mail size={17} color="#33363f" strokeWidth={1.8} />
                </View>
                <TextInput
                  style={loginNewStyles.input}
                  placeholder="Correo electronico"
                  placeholderTextColor="#737373"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
              </View>

              <View style={[loginNewStyles.inputShell, hasCredentialError && loginNewStyles.inputShellError]}>
                <View style={loginNewStyles.inputIcon}>
                  <Lock size={17} color="#33363f" strokeWidth={1.8} />
                </View>
                <PasswordTextInput
                  style={[loginNewStyles.input, loginNewStyles.passwordInput]}
                  placeholder="Contraseña"
                  placeholderTextColor="#737373"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  iconColor="#33363f"
                  toggleStyle={loginNewStyles.passwordToggle}
                  textContentType="password"
                />
              </View>
              {hasCredentialError ? <Text style={loginNewStyles.fieldErrorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[loginNewStyles.primaryButton, isSubmitting && loginNewStyles.primaryButtonDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.82}
              >
                <Text style={loginNewStyles.primaryButtonText}>
                  {isSubmitting ? 'Iniciando... ' : 'Iniciar Sesion '}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={loginNewStyles.registerPrompt}>No tienes cuenta?, !Registrate! </Text>

            <TouchableOpacity
              style={loginNewStyles.secondaryButton}
              onPress={() => router.push('/register-new' as never)}
              activeOpacity={0.82}
            >
              <Text style={loginNewStyles.secondaryButtonText}>Registrarse </Text>
            </TouchableOpacity>

            {isDebugPanelVisible ? (
              <View style={loginNewStyles.debugPanel}>
                <Text style={loginNewStyles.debugTitle}>Diagnostico de inicio de sesion</Text>
                {loginLogs.map((log) => {
                  const details = formatLogDetails(log.details)

                  return (
                    <View key={log.id} style={loginNewStyles.debugLogItem}>
                      <View style={loginNewStyles.debugLogHeader}>
                        <Text style={[loginNewStyles.debugLogLevel, getLogLevelStyle(log.level)]}>
                          {log.level.toUpperCase()}
                        </Text>
                        <Text style={loginNewStyles.debugLogTime}>{log.time}</Text>
                      </View>
                      <Text style={loginNewStyles.debugLogMessage}>{log.message}</Text>
                      {details ? <Text style={loginNewStyles.debugLogDetails}>{details}</Text> : null}
                    </View>
                  )
                })}
              </View>
            ) : null}

            <Text style={loginNewStyles.legal}>
              Uso exclusivo para clientes, propietarios, inquilinos y equipo INICIO
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function getUserHomeRoute(user: {
  systemRole?: string | null
  roles?: string[] | null
  investment?: boolean | null
  tenant?: boolean | null
}) {
  const roles = user.roles ?? []
  if (user.systemRole === 'COORDINATOR' || user.systemRole === 'ADMIN' || roles.includes('COORDINATOR') || roles.includes('ADMIN')) {
    return '/userCoordinator' as never
  }
  if (user.systemRole === 'AGENT' || roles.includes('AGENT')) {
    return '/userAdviser' as never
  }
  return '/registration-complete' as never
}
