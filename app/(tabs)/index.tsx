import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ChevronRight,
  Users,
  ClipboardCheck,
  Wallet
} from 'lucide-react-native'

export default function HomeScreen() {
  const { 
    currentUser, 
    isClient, 
    isAgent, 
    isAdmin,
    userProperties, 
    availableProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
    userAppointments,
    userLeads 
  } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      if (isAgent || isAdmin) {
        await loadCatalogProperties()
      }
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if ((isAgent || isAdmin) && !hasLoadedCatalog && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [hasLoadedCatalog, isAdmin, isAgent, isCatalogLoading, loadCatalogProperties])

  // Calculos para clientes
  const totalValue = userProperties.reduce((acc, p) => acc + (p.currentValue || p.price), 0)
  const totalGains = userProperties.reduce((acc, p) => {
    if (p.currentValue && p.currentValue > p.price) {
      return acc + (p.currentValue - p.price)
    }
    return acc
  }, 0)

  // Calculos para asesores
  const pendingLeads = userLeads.filter(l => l.status === 'nuevo').length
  const negotiatingLeads = userLeads.filter(l => l.status === 'negociando').length
  const pendingAppointments = userAppointments.filter(a => a.status === 'pending').length
  const visibleAvailableProperties = hasLoadedCatalog ? availableProperties : []

  // Panel de cliente
  if (isClient) {
    return (
      <SafeAreaView style={styles.containerLight} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Saludo */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {currentUser?.name.split(' ')[0]}</Text>
            <Text style={styles.subGreeting}>Bienvenido a tu panel de inversiones</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Propiedades</Text>
                <Building2 size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.statValue}>{userProperties.length}</Text>
              <Text style={styles.statDescription}>En tu portafolio</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Valor Total</Text>
                <DollarSign size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(totalValue)}</Text>
              <Text style={styles.statDescription}>Valor actual</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Ganancias</Text>
                <TrendingUp size={20} color={colors.textMuted} />
              </View>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {formatCurrency(totalGains)}
              </Text>
              <Text style={styles.statDescription}>Plusvalia</Text>
            </View>

            <View style={[styles.statCard, styles.statCardHighlight]}>
              <View style={styles.statHeader}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Proyeccion</Text>
                <TrendingUp size={20} color={colors.accent} />
              </View>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {formatCurrency(totalValue * 1.1)}
              </Text>
              <Text style={[styles.statDescription, { color: colors.textMuted }]}>Est. 1 ano</Text>
            </View>
          </View>

          {/* Acceso rapido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceso Rapido</Text>
            
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/(tabs)/catalog')}
            >
              <View style={styles.quickAccessIcon}>
                <Building2 size={24} color={colors.accent} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitle}>Explorar Catalogo</Text>
                <Text style={styles.quickAccessSubtitle}>
                  {availableProperties.length} propiedades disponibles
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <View style={styles.quickAccessIcon}>
                <Calendar size={24} color={colors.accent} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitle}>Mis Citas</Text>
                <Text style={styles.quickAccessSubtitle}>
                  {userAppointments.length} citas programadas
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Panel de asesor/coordinador
  return (
    <SafeAreaView style={styles.containerDark} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollViewDark}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Saludo */}
        <View style={styles.headerDark}>
          <Text style={styles.greetingDark}>Hola, {currentUser?.name.split(' ')[0]}</Text>
          <Text style={styles.subGreetingDark}>
            {isAdmin ? 'Panel de Coordinador' : 'Panel de Asesor'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGridDark}>
          <View style={styles.statCardDark}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabelDark}>Leads Nuevos</Text>
              <Users size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValueDark}>{pendingLeads}</Text>
            <Text style={styles.statDescriptionDark}>Por contactar</Text>
          </View>

          <View style={styles.statCardDark}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabelDark}>Negociando</Text>
              <ClipboardCheck size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValueDark}>{negotiatingLeads}</Text>
            <Text style={styles.statDescriptionDark}>En proceso</Text>
          </View>

          <View style={styles.statCardDark}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabelDark}>Citas</Text>
              <Calendar size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValueDark}>{pendingAppointments}</Text>
            <Text style={styles.statDescriptionDark}>Pendientes</Text>
          </View>

          <View style={styles.statCardDark}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabelDark}>Propiedades</Text>
              <Building2 size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValueDark}>{visibleAvailableProperties.length}</Text>
            <Text style={styles.statDescriptionDark}>Activas</Text>
          </View>
        </View>

        {/* Acceso rapido */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionTitleDark}>Acceso Rapido</Text>
          
          <TouchableOpacity 
            style={styles.quickAccessCardDark}
            onPress={() => router.push('/(tabs)/leads')}
          >
            <View style={styles.quickAccessIconDark}>
              <Users size={24} color={colors.accent} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={styles.quickAccessTitleDark}>Gestion de Leads</Text>
              <Text style={styles.quickAccessSubtitleDark}>
                {userLeads.length} leads totales
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {isAgent && (
            <TouchableOpacity 
              style={styles.quickAccessCardDark}
              onPress={() => router.push('/(tabs)/registration')}
            >
              <View style={styles.quickAccessIconDark}>
                <ClipboardCheck size={24} color={colors.accent} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitleDark}>Registrar Venta/Renta</Text>
                <Text style={styles.quickAccessSubtitleDark}>
                  Nuevo registro de transaccion
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity 
              style={styles.quickAccessCardDark}
              onPress={() => router.push('/(tabs)/reviews')}
            >
              <View style={styles.quickAccessIconDark}>
                <ClipboardCheck size={24} color={colors.accent} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitleDark}>Revisar Registros</Text>
                <Text style={styles.quickAccessSubtitleDark}>
                  Pendientes de aprobacion
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Contenedores
  containerLight: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewDark: {
    flex: 1,
  },

  // Header claro
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Header oscuro
  headerDark: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  greetingDark: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  subGreetingDark: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Stats Grid claro
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardHighlight: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  statDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Stats Grid oscuro
  statsGridDark: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statCardDark: {
    width: '47%',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  statLabelDark: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
  },
  statValueDark: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  statDescriptionDark: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Secciones
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionDark: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitleDark: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.md,
  },

  // Quick Access Cards
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAccessCardDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessIconDark: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  quickAccessTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  quickAccessTitleDark: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  quickAccessSubtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickAccessSubtitleDark: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
})
