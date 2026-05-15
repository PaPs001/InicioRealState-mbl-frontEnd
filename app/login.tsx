//Imagenes
import LogoGris from './assets/LogoInicioSVGris.svg';
import LogoNegro from './assets/LogoInicioSVGNegro.svg';
import TextoLogoInicio from './assets/TextoLogoInicio.svg';

//configuraciones
import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme'
import { User, Lock, UserPlus, ArrowLeft } from 'lucide-react-native'

export default function LoginScreen() {
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleQuickLogin = async (userId: string) => {
    await login(userId)
    router.replace('/(tabs)')
  }

  if (isAgentMode) {
    return (
      <SafeAreaView style={styles.containerDark}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setIsAgentMode(false)}
            >
              <ArrowLeft size={20} color={colors.accent} />
              <Text style={styles.backButtonText}>Volver a clientes</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <LogoGris width={150} height={150} />
              {/*<View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>Avion</Text>
                <Text style={styles.logoSubtext}>REAL ESTATE</Text>
              </View>*/}
            </View>

            <Text style={styles.subtitleDark}>Portal de Asesores y Coordinadores</Text>

            <View style={styles.formContainerDark}>
              <View style={styles.inputContainerDark}>
                <TextInput
                  style={styles.inputDark}
                  placeholder="Correo electronico"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainerDark}>
                <TextInput
                  style={styles.inputDark}
                  placeholder="Contraseña"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity style={styles.buttonAccent}>
                <User size={18} color={colors.primaryDark} />
                <Text style={styles.buttonAccentText}>Iniciar Sesion</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickAccessContainer}>
              <Text style={styles.quickAccessLabel}>Acceso rapido (Demo)</Text>
              <View style={styles.quickAccessButtons}>
                <TouchableOpacity 
                  style={styles.quickButtonAgent}
                  onPress={() => handleQuickLogin('user-4')}
                >
                  <Text style={styles.quickButtonAgentText}>Asesor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickButtonAdmin}
                  onPress={() => handleQuickLogin('user-5')}
                >
                  <Text style={styles.quickButtonAdminText}>Coordinador</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => setIsAgentMode(true)}
          >
            <TextoLogoInicio width={200} height={80} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Correo electronico"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={styles.buttonPrimary}>
              <User size={18} color={colors.textInverse} />
              <Text style={styles.buttonPrimaryText}>Iniciar Sesion</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.buttonGhost}
              onPress={() => router.push('/create-account')}
            >
              <UserPlus size={18} color={colors.text} />
              <Text style={styles.buttonGhostText}>Crear cuenta nueva</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ paddingVertical: 8, paddingHorizontal: 16 }}
              onPress={() => router.push('/animation-demo-screen')}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Ver demos de animacion</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickAccessContainer}>
            <Text style={styles.quickAccessLabelLight}>Acceso rapido (Demo)</Text>
            <View style={styles.quickAccessButtonsRow}>
              <TouchableOpacity 
                style={styles.quickButtonInvestor}
                onPress={() => handleQuickLogin('user-1')}
              >
                <Text style={styles.quickButtonInvestorText}>Inversionista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButtonClient}
                onPress={() => handleQuickLogin('user-2')}
              >
                <Text style={styles.quickButtonClientText}>Buscando</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButtonClient}
                onPress={() => handleQuickLogin('user-3')}
              >
                <Text style={styles.quickButtonClientText}>Inquilino</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: typography.bodySmall.fontSize,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceDark,
  },
  logoPlaceholderLight: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  logoSubtext: {
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 2,
  },
  logoTextLight: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  logoSubtextLight: {
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 2,
  },
  subtitleDark: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    marginBottom: spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  formContainerDark: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputContainerDark: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  inputDark: {
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonPrimaryText: {
    color: colors.textInverse,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  buttonAccent: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonAccentText: {
    color: colors.primaryDark,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  buttonGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  buttonGhostText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  quickAccessContainer: {
    marginTop: spacing.xl,
  },
  quickAccessLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.md,
  },
  quickAccessLabelLight: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.md,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quickAccessButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  quickButtonAgent: {
    backgroundColor: '#0c74af',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  quickButtonAgentText: {
    color: colors.textLight,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  quickButtonAdmin: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  quickButtonAdminText: {
    color: colors.primaryDark,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  quickButtonInvestor: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  quickButtonInvestorText: {
    color: colors.accent,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  quickButtonClient: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  quickButtonClientText: {
    color: colors.textInverse,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
})
