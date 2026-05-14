import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
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
  Shield
} from 'lucide-react-native'

export default function ProfileScreen() {
  const { currentUser, logout, isClient, isAgent, isAdmin } = useAuth()
  const router = useRouter()

  const isDark = isAgent || isAdmin

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

  const containerStyle = isDark ? styles.containerDark : styles.container
  const cardStyle = isDark ? styles.cardDark : styles.card
  const textColor = isDark ? colors.textLight : colors.text
  const textSecondaryColor = isDark ? colors.textMuted : colors.textSecondary

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar y nombre */}
        <View style={styles.header}>
          <View style={[styles.avatar, isDark && styles.avatarDark]}>
            <Text style={styles.avatarText}>
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.userName, { color: textColor }]}>{currentUser?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
        </View>

        {/* Informacion de contacto */}
        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Informacion de Contacto</Text>
          
          <View style={styles.infoRow}>
            <Mail size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: textSecondaryColor }]}>{currentUser?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Phone size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: textSecondaryColor }]}>{currentUser?.phone}</Text>
          </View>
        </View>

        {/* Codigo de referido (solo clientes) */}
        {isClient && currentUser?.referralCode && (
          <View style={cardStyle}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Codigo de Referido</Text>
            <View style={styles.referralContainer}>
              <Gift size={24} color={colors.accent} />
              <View style={styles.referralContent}>
                <Text style={[styles.referralCode, { color: colors.accent }]}>
                  {currentUser.referralCode}
                </Text>
                <Text style={[styles.referralHint, { color: textSecondaryColor }]}>
                  Comparte tu codigo y gana recompensas
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Opciones de menu */}
        <View style={cardStyle}>
          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color={colors.accent} />
            <Text style={[styles.menuItemText, { color: textColor }]}>Notificaciones</Text>
            <ChevronRight size={20} color={textSecondaryColor} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color={colors.accent} />
            <Text style={[styles.menuItemText, { color: textColor }]}>Mis Documentos</Text>
            <ChevronRight size={20} color={textSecondaryColor} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color={colors.accent} />
            <Text style={[styles.menuItemText, { color: textColor }]}>Ayuda y Soporte</Text>
            <ChevronRight size={20} color={textSecondaryColor} />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDark: {
    backgroundColor: colors.accent,
  },
  avatarText: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  userName: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.accent + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.border,
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
    color: colors.textMuted,
  },
})
