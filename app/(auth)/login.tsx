import TextoLogoInicio from '../assets/TextoLogoInicio.svg';
import { loginStyles } from './login.style'
import { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { Sparkles, User, UserPlus } from 'lucide-react-native'
import { loginUser } from '@/lib/api/endpoints/auth'
import { PasswordTextInput } from '@/components/ui/PasswordTextInput'
import { colors } from '@/lib/theme'

export default function LoginScreen() {
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, setAuthSession } = useSessionDomain()
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const loginResponse = await loginUser({
        email,
        password,
      })

      const authToken =
        loginResponse.accessToken ??
        null

      if (!authToken) {
        throw new Error(loginResponse.error || 'La API no devolvio un token de sesion')
      }

      const sessionUser = loginResponse.user ?? null
      if (!sessionUser) {
        throw new Error('La API no devolvio el usuario autenticado')
      }

      await setAuthSession(sessionUser, authToken)

      console.log('[auth][login-session]', {
        userId: sessionUser.id ?? null,
        email: sessionUser.email,
        name: sessionUser.name,
        systemRole: sessionUser.systemRole ?? null,
        investment: sessionUser.investment ?? null,
        tenant: sessionUser.tenant ?? null,
        hasAccessToken: !!authToken,
        accessTokenPreview: authToken.slice(0, 16),
      })

      router.replace('/(tabs)')
    } catch (error) {
      console.error('Error al iniciar sesion', error)
    }
  }

  const handleQuickLogin = async (userId: string) => {
    await login(userId)
    router.replace('/(tabs)')
  }

  if (isAgentMode) {
    return (
      <SafeAreaView style={loginStyles.containerDark}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={loginStyles.keyboardView}
        >
          <ScrollView contentContainerStyle={loginStyles.scrollContent}>
            <TouchableOpacity 
              style={loginStyles.logoContainer}
              onPress={() => setIsAgentMode(false)}
            >
              <TextoLogoInicio width={200} height={80} />
            </TouchableOpacity>

            <Text style={loginStyles.subtitleDark}>Portal de Asesores y Coordinadores</Text>

            <View style={loginStyles.formContainerDark}>
              <View style={loginStyles.inputContainerDark}>
                <TextInput
                  style={loginStyles.inputDark}
                  placeholder="Correo electronico"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={loginStyles.inputContainerDark}>
                <PasswordTextInput
                  style={[loginStyles.inputDark, loginStyles.passwordInput]}
                  placeholder="Contraseña"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  iconColor={colors.textMuted}
                  toggleStyle={loginStyles.passwordToggle}
                />
              </View>
              <TouchableOpacity style={loginStyles.buttonAccent} onPress={handleLogin}>
                <User size={18} color={colors.primaryDark} />
                <Text style={loginStyles.buttonAccentText}>Iniciar Sesion</Text>
              </TouchableOpacity>
            </View>

            {__DEV__ ? (
              <View style={loginStyles.quickAccessContainer}>
                <Text style={loginStyles.quickAccessLabel}>Acceso rapido (Demo)</Text>
                <View style={loginStyles.quickAccessButtons}>
                  <TouchableOpacity 
                    style={loginStyles.quickButtonAgent}
                    onPress={() => handleQuickLogin('user-4')}
                  >
                    <Text style={loginStyles.quickButtonAgentText}>Asesor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={loginStyles.quickButtonAdmin}
                    onPress={() => handleQuickLogin('user-5')}
                  >
                    <Text style={loginStyles.quickButtonAdminText}>Coordinador</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={loginStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginStyles.keyboardView}
      >
        <ScrollView contentContainerStyle={loginStyles.scrollContent}>
          <TouchableOpacity 
            style={loginStyles.logoContainer}
            onPress={() => setIsAgentMode(true)}
          >
            <TextoLogoInicio width={200} height={80} />
          </TouchableOpacity>

          <View style={loginStyles.formContainer}>
            <View style={loginStyles.inputContainer}>
              <TextInput
                style={loginStyles.input}
                placeholder="Correo electronico"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={loginStyles.inputContainer}>
              <PasswordTextInput
                style={[loginStyles.input, loginStyles.passwordInput]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                iconColor={colors.textMuted}
                toggleStyle={loginStyles.passwordToggle}
              />
            </View>
            <TouchableOpacity style={loginStyles.buttonPrimary} onPress={handleLogin}>
              <User size={18} color={colors.textInverse} />
              <Text style={loginStyles.buttonPrimaryText}>Iniciar Sesion</Text>
            </TouchableOpacity>
            
            <View style={loginStyles.divider} />
            
            <TouchableOpacity
              style={loginStyles.buttonGhost}
              onPress={() => router.push('/create-account')}
            >
              <UserPlus size={18} color={colors.text} />
              <Text style={loginStyles.buttonGhostText}>Crear cuenta nueva</Text>
            </TouchableOpacity>

            {__DEV__ ? (
              <TouchableOpacity
                style={loginStyles.buttonGhost}
                onPress={() => router.push('/login-new')}
              >
                <Sparkles size={18} color={colors.text} />
                <Text style={loginStyles.buttonGhostText}>Ver nuevo login</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
