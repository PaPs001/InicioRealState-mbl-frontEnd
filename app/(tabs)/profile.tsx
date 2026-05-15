import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { 
  User, 
  Mail, 
  Phone, 
  Gift, 
  Bell, 
  FileText, 
  HelpCircle, 
  LogOut,
  ChevronRight,
} from 'lucide-react-native'

export default function ProfileScreen() {
  const { currentUser, logout, isClient, isAgent, isAdmin } = useAuth()
  const router = useRouter()

  // Determinar si es inversionista para usar tema oscuro
  const isInvestor = currentUser?.role === 'investor'
  const isDark = isAgent || isAdmin || isInvestor

  // Obtener colores segun el tipo de usuario
  const getThemeColors = () => {
    if (isInvestor) return clientThemes.investor
    if (isAgent || isAdmin) return {
      background: colors.primaryDark,
      surface: colors.surfaceDark,
      border: colors.borderDark,
      text: colors.textLight,
      textSecondary: colors.textMuted,
      textMuted: colors.textMuted,
      accent: colors.accent,
    }
    return {
      background: colors.background,
      surface: colors.surface,
      border: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      accent: colors.accent,
    }
  }
  
  const theme = getThemeColors()

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesion',
      'Estas seguro que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesion', 
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login')
          }
        }
      ]
    )
  }

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case 'investor': return 'Inversionista'
      case 'searching': return 'Buscando Propiedad'
      case 'tenant': return 'Inquilino'
      case 'agent': return 'Asesor'
      case 'admin': return 'Coordinador'
      default: return 'Usuario'
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar y nombre */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={[styles.avatarText, { color: theme.background }]}>
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{currentUser?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[styles.roleText, { color: theme.accent }]}>{getRoleLabel()}</Text>
          </View>
        </View>

        {/* Informacion de contacto */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informacion de Contacto</Text>
          
          <View style={styles.infoRow}>
            <Mail size={20} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{currentUser?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Phone size={20} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{currentUser?.phone}</Text>
          </View>
        </View>

        {/* Codigo de referido (solo clientes) */}
        {isClient && currentUser?.referralCode && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Codigo de Referido</Text>
            <View style={[styles.referralContainer, { backgroundColor: theme.background }]}>
              <Gift size={24} color={theme.accent} />
              <View style={styles.referralContent}>
                <Text style={[styles.referralCode, { color: theme.accent }]}>
                  {currentUser.referralCode}
                </Text>
                <Text style={[styles.referralHint, { color: theme.textSecondary }]}>
                  Comparte tu codigo y gana recompensas
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Opciones de menu */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color={theme.accent} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Notificaciones</Text>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color={theme.accent} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Mis Documentos</Text>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color={theme.accent} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Ayuda y Soporte</Text>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  userName: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  roleBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: {
    fontSize: typography.body.fontSize,
  },
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  referralContent: {
    flex: 1,
  },
  referralCode: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    letterSpacing: 2,
  },
  referralHint: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.body.fontSize,
  },
  menuDivider: {
    height: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error + '10',
  },
  logoutText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  version: {
    fontSize: typography.caption.fontSize,
  },
})
