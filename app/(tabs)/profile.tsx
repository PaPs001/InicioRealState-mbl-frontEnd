import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { 
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
import { AppScreen, SectionCard } from '@/components/ui'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

export default function ProfileScreen() {
  const { currentUser, isClient, isAgent, isAdmin, isInvestor, isTenant, isSearching } = useSessionDomain()
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

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
            // Navegar a pantalla de transicion con el rol del usuario
            router.replace(`/logout-transition?role=${isInvestor ? 'investor' : isTenant ? 'tenant' : 'searching'}`)
          }
        }
      ]
    )
  }

  // Si no hay usuario, redirigir al login
  if (!currentUser) {
    router.replace('/login-new')
    return null
  }

  const getRoleLabel = () => {
    if (currentUser?.systemRole === 'AGENT') return 'Asesor'
    if (currentUser?.systemRole === 'COORDINATOR') return 'Coordinador'
    if (currentUser?.systemRole === 'ADMIN') return 'Administrador'

    if (currentUser?.investment) return 'Inversionista'
    if (currentUser?.tenant) return 'Inquilino'
    if (!currentUser?.investment && !currentUser?.tenant) return 'Buscador'

    return 'Cliente'
  }

  const memberSince = 'Enero 2024'

  return (
    <AppScreen edges={['bottom']}>
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
        <SectionCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Informacion Personal</Text>
            <TouchableOpacity>
              <Text style={[styles.editLink, { color: theme.accent }]}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Mail size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electronico</Text>
              <Text style={styles.infoText}>{currentUser?.email}</Text>
            </View>
          </View>
          
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Phone size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefono</Text>
              <Text style={styles.infoText}>{currentUser?.phone}</Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <MapPin size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicacion</Text>
              <Text style={styles.infoText}>Monterrey, NL</Text>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.accent + '15' }]}>
              <Calendar size={18} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoText}>{memberSince}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Stats segun tipo de cliente */}
        {isClient && (
          <SectionCard style={styles.card}>
            <Text style={styles.sectionTitle}>
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
          </SectionCard>
        )}

        {/* Configuracion - para todos los clientes */}
        {isClient && (
          <SectionCard style={styles.card}>
            <Text style={styles.sectionTitle}>Configuracion</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <Shield size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Seguridad</Text>
                <Text style={styles.menuItemHint}>Contrasena y autenticacion</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <Settings size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Preferencias</Text>
                <Text style={styles.menuItemHint}>Idioma, moneda y mas</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accent + '15' }]}>
                <HelpCircle size={18} color={theme.accent} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Ayuda y Soporte</Text>
                <Text style={styles.menuItemHint}>Centro de ayuda</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </SectionCard>
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
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
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
    color: theme.text,
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
    color: theme.textMuted,
  },
  infoText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: theme.text,
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
    color: theme.text,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
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
    color: theme.text,
  },
  menuItemHint: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
    color: theme.textMuted,
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
    color: theme.textMuted,
  },
})
