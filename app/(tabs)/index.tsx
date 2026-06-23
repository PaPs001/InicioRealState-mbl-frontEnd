import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ClientHomeHeader } from '@/components/home/ClientHomeHeader'
import { ClientQuickAccessSection, type QuickAccessItem } from '@/components/home/ClientQuickAccessSection'
import { InvestorPortfolioStats } from '@/components/home/InvestorPortfolioStats'
import { StaffDashboardSection, type StaffQuickAccessItem } from '@/components/home/StaffDashboardSection'
import { TenantEmptyState } from '@/components/home/TenantEmptyState'
import { TenantRentalSection } from '@/components/home/TenantRentalSection'
import { createClientHomeStyles } from '@/components/home/client-home-styles'
import { useHomeDashboard } from '@/contexts/auth/use-home-dashboard'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Building2, 
  ClipboardCheck,
  Heart,
  Home,
  Plus,
  Calendar,
  Wallet,
  FileText,
  FolderOpen,
  Megaphone,
  TrendingUp,
  Eye,
} from 'lucide-react-native'
import { Linking } from 'react-native'

export default function HomeScreen() {
  const { 
    currentUser, 
    isClient, 
    isAgent, 
    isAdmin,
    isCoordinator,
    isInvestor,
    isSearching,
    isTenant,
    userProperties, 
    userAppointments,
    userLeads,
    theme,
    subGreeting,
    visibleAvailableProperties,
    totalValue,
    totalGains,
    projectedValue,
    pendingLeads,
    negotiatingLeads,
    pendingAppointments,
    tenantRental,
    tenantProperty,
    tenantLandlord,
    tenantAgent,
    daysUntilPayment,
    refreshHomeData,
  } = useHomeDashboard()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [tenantActiveTab, setTenantActiveTab] = useState<'general' | 'services'>('general')
  const isCoordinatorPanel = isAdmin || isCoordinator

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshHomeData()
    } finally {
      setRefreshing(false)
    }
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  useEffect(() => {
    if (isCoordinator) {
      router.replace('/coordinator' as never)
    }
  }, [isCoordinator, router])

  if (isCoordinator) {
    return null
  }

  const clientQuickAccessItems: QuickAccessItem[] = isInvestor
    ? [
        {
          icon: Home,
          title: 'Mis Propiedades',
          subtitle: `${userProperties.length} propiedades en portafolio`,
          onPress: () => router.push('/my-properties'),
        },
        {
          icon: Plus,
          title: 'Agregar Propiedad',
          subtitle: 'Registra y monitorea tus inversiones',
          onPress: () => router.push('/add-property'),
        },
        {
          icon: TrendingUp,
          title: 'Proyecciones',
          subtitle: 'Ganancias potenciales de tus propiedades',
          onPress: () => router.push('/earnings'),
        },
        {
          icon: Building2,
          title: 'Explorar Catalogo',
          subtitle: `${visibleAvailableProperties.length} propiedades disponibles`,
          onPress: () => router.push('/catalog'),
        },
        {
          icon: Heart,
          title: 'Mis Favoritos',
          subtitle: 'Propiedades guardadas',
          onPress: () => router.push('/favorites'),
        },
        {
          icon: Calendar,
          title: 'Mis Citas',
          subtitle: `${userAppointments.length} citas programadas`,
          onPress: () => router.push('/appointments'),
        },
        {
          icon: Megaphone,
          title: 'Campañas',
          subtitle: 'Publicidad de tus propiedades',
          onPress: () => router.push('/campaigns'),
        },
      ]
    : isSearching
      ? [
          {
            icon: Building2,
            title: 'Explorar Catalogo',
            subtitle: `${visibleAvailableProperties.length} propiedades disponibles`,
            onPress: () => router.push('/catalog'),
          },
          {
            icon: Heart,
            title: 'Mis Favoritos',
            subtitle: 'Propiedades guardadas',
            onPress: () => router.push('/favorites'),
          },
          {
            icon: Calendar,
            title: 'Mis Citas',
            subtitle: `${userAppointments.length} citas programadas`,
            onPress: () => router.push('/appointments'),
          },
          {
            icon: Plus,
            title: 'Agregar Propiedad',
            subtitle: 'Tienes una propiedad para vender?',
            onPress: () => router.push('/add-property'),
          },
        ]
      : []

  const tenantQuickAccessItems: QuickAccessItem[] = [
    {
      icon: Building2,
      title: 'Explorar Catalogo',
      subtitle: `${visibleAvailableProperties.length} propiedades disponibles`,
      onPress: () => router.push('/catalog'),
    },
    {
      icon: Heart,
      title: 'Mis Favoritos',
      subtitle: 'Propiedades guardadas',
      onPress: () => router.push('/favorites'),
    },
    {
      icon: Calendar,
      title: 'Mis Citas',
      subtitle: `${userAppointments.length} citas programadas`,
      onPress: () => router.push('/appointments'),
    },
    {
      icon: Plus,
      title: 'Agregar Propiedad',
      subtitle: 'Registra una propiedad para invertir',
      onPress: () => router.push('/add-property'),
    },
  ]

  const staffQuickAccessItems: StaffQuickAccessItem[] = [
    {
      icon: Building2,
      title: 'Propiedades',
      subtitle: `${visibleAvailableProperties.length} propiedades activas`,
      onPress: () => router.push('/agent-catalog'),
    },
    ...(isAgent
      ? [
          {
            icon: ClipboardCheck,
            title: 'Registrar Venta/Renta',
            subtitle: 'Nuevo registro de transacción',
            onPress: () => router.push('/sale-rent-registration'),
          } satisfies StaffQuickAccessItem,
        ]
      : []),
    ...(isCoordinatorPanel
      ? [
          {
            icon: ClipboardCheck,
            title: 'Registrar Venta/Renta',
            subtitle: 'Alta y seguimiento de operaciones',
            onPress: () => router.push('/sale-rent-registration'),
          },
          {
            icon: Calendar,
            title: 'Citas',
            subtitle: `${userAppointments.length} citas registradas`,
            onPress: () => router.push('/appointments'),
          },
          {
            icon: FolderOpen,
            title: 'Agregar Archivos',
            subtitle: 'Documentos, recibos y anexos',
            onPress: () => router.push('/documents-screen'),
          },
          {
            icon: Wallet,
            title: 'Comisiones',
            subtitle: 'Seguimiento de pagos y pendientes',
            onPress: () => router.push('/(tabs)/commissions'),
          },
          {
            icon: FileText,
            title: 'Contratos de Rentas',
            subtitle: 'Consulta contratos y respaldo documental',
            onPress: () => router.push('/documents-screen'),
          },
          {
            icon: ClipboardCheck,
            title: 'Revisar Registros',
            subtitle: 'Pendientes de aprobación',
            onPress: () => router.push('/(tabs)/reviews'),
          },
        ].map(item => item satisfies StaffQuickAccessItem)
      : []),
  ]

  if (isClient && theme) {
    const dynamicStyles = createClientHomeStyles(theme)

    return (
      <SafeAreaView style={dynamicStyles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ClientHomeHeader
            dynamicStyles={dynamicStyles}
            firstName={currentUser?.name.split(' ')[0]}
            onNotificationsPress={() => router.push('/notifications')}
            styles={styles}
            subGreeting={subGreeting}
            theme={theme}
          />

          {/* Stats Cards - Solo para Inversionista (grid 2x2) */}
          {isInvestor ? (
            <InvestorPortfolioStats
              dynamicStyles={dynamicStyles}
              formatCurrency={formatCurrency}
              projectedValue={projectedValue}
              styles={styles}
              theme={theme}
              totalGains={totalGains}
              totalValue={totalValue}
              userPropertiesCount={userProperties.length}
            />
          ) : null}

          {!isTenant && clientQuickAccessItems.length > 0 ? (
            <ClientQuickAccessSection
              title="Acceso Rapido"
              items={clientQuickAccessItems}
              styles={styles}
              dynamicStyles={dynamicStyles}
              theme={theme}
            />
          ) : null}

          {isTenant && tenantRental && tenantProperty ? (
            <TenantRentalSection
              styles={styles}
              dynamicStyles={dynamicStyles}
              theme={theme}
              tenantActiveTab={tenantActiveTab}
              setTenantActiveTab={setTenantActiveTab}
              tenantRental={tenantRental}
              tenantProperty={tenantProperty}
              tenantLandlord={tenantLandlord}
              tenantAgent={tenantAgent}
              daysUntilPayment={daysUntilPayment}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onCall={handleCall}
              onOpenDocuments={() => router.push('/documents-screen')}
            />
          ) : null}

          {isTenant ? (
            <ClientQuickAccessSection
              title="Acceso Rapido"
              items={tenantQuickAccessItems}
              styles={styles}
              dynamicStyles={dynamicStyles}
              theme={theme}
            />
          ) : null}

          {isTenant && !tenantRental ? <TenantEmptyState styles={styles} theme={theme} /> : null}
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
            {isCoordinatorPanel ? 'Panel de Coordinador' : 'Panel de Asesor'}
          </Text>
        </View>

        {isCoordinatorPanel ? (
          <View style={styles.previewSectionDark}>
            <TouchableOpacity
              style={styles.previewButtonDark}
              onPress={() => router.push('/coordinator' as never)}
              activeOpacity={0.85}
            >
              <Eye size={20} color={colors.primaryDark} />
              <Text style={styles.previewButtonTextDark}>Vista previa</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <StaffDashboardSection
          isAdmin={isCoordinatorPanel}
          pendingAppointments={pendingAppointments}
          pendingLeads={pendingLeads}
          primaryAction={
            isAgent || isCoordinatorPanel
              ? {
                  title: 'Registrar Venta/Renta',
                  subtitle: 'Crear un nuevo registro comercial',
                  onPress: () => router.push('/sale-rent-registration'),
                }
              : null
          }
          quickAccessItems={[
            {
              icon: Building2,
              title: 'Gestion de Leads',
              subtitle: `${userLeads.length} leads totales`,
              onPress: () => router.push('/(tabs)/leads'),
            },
            ...staffQuickAccessItems,
          ]}
          styles={styles}
          totalProperties={visibleAvailableProperties.length}
          totalUserLeads={userLeads.length}
          negotiatingLeads={negotiatingLeads}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerContent: {
    flex: 1,
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
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Header oscuro
  headerDark: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  primaryActionSectionDark: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  previewSectionDark: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  previewButtonDark: {
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  previewButtonTextDark: {
    color: colors.primaryDark,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  primaryActionButtonDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  primaryActionIconDark: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.textLight + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  primaryActionTitleDark: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  primaryActionSubtitleDark: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primaryDark + 'cc',
    marginTop: 2,
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
  // Stats Grid Inversionista (2x2)
  statsGridInvestor: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCardHalf: {
    flex: 1,
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

  // Estilos para inquilino
  tenantPropertyCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tenantPropertyIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tenantPropertyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
  },
  tenantLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tenantLocationText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textLight + '80',
  },
  tenantRentInfo: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
  },
  tenantRentItem: {
    flex: 1,
    alignItems: 'center',
  },
  tenantRentDivider: {
    width: 1,
    backgroundColor: colors.borderDark,
  },
  tenantRentLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight + '80',
  },
  tenantRentAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 2,
  },
  tenantRentDays: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.success,
    marginTop: 2,
  },
  tenantSection: {
    marginBottom: spacing.lg,
  },
  tenantSectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tenantInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  tenantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tenantInfoLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    width: 60,
  },
  tenantInfoValue: {
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  tenantContactCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tenantContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantContactAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantContactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tenantContactName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  tenantContactRole: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  tenantCallButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tenantServiceCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tenantServiceIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tenantServiceName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  tenantServiceProvider: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  tenantRulesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  tenantRuleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tenantRuleText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
    lineHeight: 20,
  },
  tenantEmptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  tenantEmptyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  tenantEmptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Tabs del inquilino
  tenantTabsContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  tenantTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  tenantTabText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  // Comunidad
  tenantCommunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  tenantCommunityIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantCommunityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tenantCommunityTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  tenantCommunityDesc: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  // Documentos
  tenantDocumentsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  tenantDocumentsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantDocumentsIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantDocumentsInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  tenantDocumentsTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
  tenantDocumentsDesc: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  tenantDocumentsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
