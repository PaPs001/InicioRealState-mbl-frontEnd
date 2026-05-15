import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { 
  User, 
  Mail, 
  Phone, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Building2,
  Settings,
  Edit3,
} from 'lucide-react-native'

export default function ProfileScreen() {
  const { currentUser, logout, isClient, isAgent, isAdmin } = useAuth()
  const router = useRouter()

  // Determinar tipo de cliente
  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const isTenant = currentUser?.role === 'tenant'
  const isDark = isAgent || isAdmin || isInvestor

  // Obtener colores segun el tipo de usuario cliente
  const getThemeColors = () => {
    if (isInvestor) return clientThemes.investor
    if (isSearching) return clientThemes.searching
    if (isTenant) return clientThemes.tenant
    if (isAgent || isAdmin) return {
      background: colors.primaryDark,
      surface: colors.surfaceDark,
      border: colors.borderDark,
      text: colors.textLight,
      textSecondary: colors.textMuted,
      textMuted: colors.textMuted,
      accent: colors.accent,
    }
    return clientThemes.searching // Default para clientes
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
          onPress: () => {
            if (isInvestor) {
              // Navegar a pantalla de transicion fuera de tabs
              router.replace('/logout-transition')
            } else {
              // Logout directo para otros usuarios
              logout()
              router.replace('/login')
            }
          }
        }
      ]
    )
  }

  // Si no hay usuario, redirigir al login
  if (!currentUser) {
    router.replace('/login')
    return null
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

  // Fecha de registro simulada
  const memberSince = 'Enero 2024'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar y nombre */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer]}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={[styles.avatarText, { color: isInvestor ? theme.background : theme.background }]}>
                {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Edit3 size={14} color={theme.accent} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{currentUser?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[styles.roleText, { color: theme.accent }]}>{getRoleLabel()}</Text>
          </View>
        </View>

        {/* Informacion de contacto */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Informacion Personal</Text>
            <TouchableOpacity>
              <Text style={[styles.editLink, { color: theme.accent }]}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Mail size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Correo electronico</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>{currentUser?.email}</Text>
            </View>
          </View>
          
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Phone size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Telefono</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>{currentUser?.phone}</Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <MapPin size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Ubicacion</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>Monterrey, NL</Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Calendar size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Miembro desde</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>{memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Stats segun tipo de cliente */}
        {isClient && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isInvestor ? 'Resumen de Portafolio' : isSearching ? 'Tu Busqueda' : 'Tu Renta'}
            </Text>
            
            <View style={styles.statsGrid}>
              {isInvestor && (
                <>
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <Building2 size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>3</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Propiedades</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <CreditCard size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>$4.2M</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Valor total</Text>
                  </View>
                </>
              )}
              
              {isSearching && (
                <>
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <Building2 size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Visitas</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <Calendar size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>2</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Citas</Text>
                  </View>
                </>
              )}
              
              {isTenant && (
                <>
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <Building2 size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>1</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Propiedad</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                    <CreditCard size={20} color={theme.accent} />
                    <Text style={[styles.statValue, { color: theme.text }]}>$18,500</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Renta mensual</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Configuracion - para todos los clientes */}
        {isClient && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Configuracion</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <Shield size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Seguridad</Text>
                <Text style={[styles.menuItemHint, { color: theme.textMuted }]}>Contrasena y autenticacion</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <Settings size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Preferencias</Text>
                <Text style={[styles.menuItemHint, { color: theme.textMuted }]}>Idioma, moneda y mas</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <HelpCircle size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Ayuda y Soporte</Text>
                <Text style={[styles.menuItemHint, { color: theme.textMuted }]}>Centro de ayuda</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Cerrar sesion */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isInvestor ? colors.error + '15' : colors.error + '10' }]} 
          onPress={handleLogout}
        >
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  editLink: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.caption.fontSize,
    marginBottom: 2,
  },
  infoText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    marginLeft: 52,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
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
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  menuItemHint: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 52,
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
