import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme'
import { formatCurrency, mockActiveRental, mockUsers, mockProperties, formatDate } from '@/lib/mock-data'
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ChevronRight,
  Users,
  ClipboardCheck,
  Wallet,
  Heart,
  Home,
  Plus,
  Bell,
  MapPin,
  User,
  Phone,
  Clock,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Shield,
  AlertCircle,
} from 'lucide-react-native'
import { useMemo } from 'react'
import { Linking } from 'react-native'

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

  // Determinar tipo especifico de cliente
  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const isTenant = currentUser?.role === 'tenant'

  // Subtitulo basado en el rol
  const getSubGreeting = () => {
    if (isInvestor) return 'Bienvenido a tu panel de inversiones'
    if (isSearching) return 'Encuentra tu propiedad ideal'
    if (isTenant) return 'Bienvenido a tu espacio'
    return 'Bienvenido'
  }

  // Datos de renta para inquilino
  const tenantRental = useMemo(() => {
    if (!currentUser || currentUser.role !== 'tenant') return null
    if (mockActiveRental.tenantId === currentUser.id) {
      return mockActiveRental
    }
    return null
  }, [currentUser])

  const tenantProperty = useMemo(() => {
    if (!tenantRental) return null
    return mockProperties.find(p => p.id === tenantRental.propertyId)
  }, [tenantRental])

  const tenantLandlord = useMemo(() => {
    if (!tenantRental) return null
    return mockUsers.find(u => u.id === tenantRental.landlordId)
  }, [tenantRental])

  const tenantAgent = useMemo(() => {
    if (!tenantRental) return null
    return mockUsers.find(u => u.id === tenantRental.agentId)
  }, [tenantRental])

  const daysUntilPayment = useMemo(() => {
    if (!tenantRental) return 0
    const today = new Date()
    const paymentDate = new Date(today.getFullYear(), today.getMonth(), tenantRental.paymentDay)
    if (paymentDate < today) {
      paymentDate.setMonth(paymentDate.getMonth() + 1)
    }
    const diffTime = paymentDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [tenantRental])

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  // Panel de cliente - diferenciado por tipo
  if (isClient) {
    return (
      <SafeAreaView style={styles.containerLight} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Saludo con boton de notificaciones */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>Hola, {currentUser?.name.split(' ')[0]}</Text>
              <Text style={styles.subGreeting}>{getSubGreeting()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications-screen')}
            >
              <Bell size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Stats Cards - Solo para Inversionista */}
          {isInvestor && (
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
          )}

          {/* Acceso rapido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceso Rapido</Text>
            
            {/* Inversionista: Ver propiedades, agregar, ganancias */}
            {isInvestor && (
              <>
                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/my-properties-screen')}
                >
                  <View style={styles.quickAccessIcon}>
                    <Home size={24} color={colors.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={styles.quickAccessTitle}>Mis Propiedades</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      {userProperties.length} propiedades en portafolio
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/add-property-screen')}
                >
                  <View style={styles.quickAccessIcon}>
                    <Plus size={24} color={colors.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={styles.quickAccessTitle}>Agregar Propiedad</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      Registra y monitorea tus inversiones
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/earnings-screen')}
                >
                  <View style={styles.quickAccessIcon}>
                    <TrendingUp size={24} color={colors.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={styles.quickAccessTitle}>Proyecciones</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      Ganancias potenciales de tus propiedades
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            )}

            {/* Buscador: Catalogo, favoritos, citas, agregar propiedad */}
            {isSearching && (
              <>
                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/catalog-screen')}
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
                  onPress={() => router.push('/favorites-screen')}
                >
                  <View style={styles.quickAccessIcon}>
                    <Heart size={24} color={colors.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={styles.quickAccessTitle}>Mis Favoritos</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      Propiedades guardadas
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/appointments-screen')}
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

                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => router.push('/add-property-screen')}
                >
                  <View style={styles.quickAccessIcon}>
                    <Plus size={24} color={colors.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={styles.quickAccessTitle}>Agregar Propiedad</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      Tienes una propiedad para vender?
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            )}

            {/* Inquilino: Mostrar info de renta directamente */}
            {isTenant && tenantRental && tenantProperty && (
              <>
                {/* Property Card */}
                <View style={styles.tenantPropertyCard}>
                  <View style={styles.tenantPropertyIcon}>
                    <Home size={32} color={colors.accent} />
                  </View>
                  <Text style={styles.tenantPropertyTitle}>{tenantProperty.title}</Text>
                  <View style={styles.tenantLocationRow}>
                    <MapPin size={16} color={colors.textMuted} />
                    <Text style={styles.tenantLocationText}>{tenantProperty.address}, {tenantProperty.city}</Text>
                  </View>
                  
                  <View style={styles.tenantRentInfo}>
                    <View style={styles.tenantRentItem}>
                      <Text style={styles.tenantRentLabel}>Renta mensual</Text>
                      <Text style={styles.tenantRentAmount}>{formatCurrency(tenantRental.monthlyRent)}</Text>
                    </View>
                    <View style={styles.tenantRentDivider} />
                    <View style={styles.tenantRentItem}>
                      <Text style={styles.tenantRentLabel}>Proximo pago</Text>
                      <Text style={styles.tenantRentDays}>{daysUntilPayment} dias</Text>
                    </View>
                  </View>
                </View>

                {/* Contrato Info */}
                <View style={styles.tenantSection}>
                  <Text style={styles.tenantSectionTitle}>Contrato</Text>
                  <View style={styles.tenantInfoCard}>
                    <View style={styles.tenantInfoRow}>
                      <Calendar size={18} color={colors.accent} />
                      <Text style={styles.tenantInfoLabel}>Inicio:</Text>
                      <Text style={styles.tenantInfoValue}>{formatDate(tenantRental.startDate)}</Text>
                    </View>
                    <View style={styles.tenantInfoRow}>
                      <Clock size={18} color={colors.accent} />
                      <Text style={styles.tenantInfoLabel}>Fin:</Text>
                      <Text style={styles.tenantInfoValue}>{formatDate(tenantRental.endDate)}</Text>
                    </View>
                    <View style={styles.tenantInfoRow}>
                      <Shield size={18} color={colors.accent} />
                      <Text style={styles.tenantInfoLabel}>Deposito:</Text>
                      <Text style={styles.tenantInfoValue}>{formatCurrency(tenantRental.depositAmount)}</Text>
                    </View>
                  </View>
                </View>

                {/* Arrendador */}
                {tenantLandlord && (
                  <View style={styles.tenantSection}>
                    <Text style={styles.tenantSectionTitle}>Arrendador</Text>
                    <View style={styles.tenantContactCard}>
                      <View style={styles.tenantContactHeader}>
                        <View style={styles.tenantContactAvatar}>
                          <User size={20} color={colors.accent} />
                        </View>
                        <View style={styles.tenantContactInfo}>
                          <Text style={styles.tenantContactName}>{tenantLandlord.name}</Text>
                          <Text style={styles.tenantContactRole}>Propietario</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.tenantCallButton}
                          onPress={() => handleCall(tenantLandlord.phone)}
                        >
                          <Phone size={18} color={colors.accent} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Asesor */}
                {tenantAgent && (
                  <View style={styles.tenantSection}>
                    <Text style={styles.tenantSectionTitle}>Asesor</Text>
                    <View style={styles.tenantContactCard}>
                      <View style={styles.tenantContactHeader}>
                        <View style={[styles.tenantContactAvatar, { backgroundColor: colors.info + '20' }]}>
                          <User size={20} color={colors.info} />
                        </View>
                        <View style={styles.tenantContactInfo}>
                          <Text style={styles.tenantContactName}>{tenantAgent.name}</Text>
                          <Text style={styles.tenantContactRole}>Asesor Inicio</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.tenantCallButton}
                          onPress={() => handleCall(tenantAgent.phone)}
                        >
                          <Phone size={18} color={colors.accent} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Servicios */}
                <View style={styles.tenantSection}>
                  <Text style={styles.tenantSectionTitle}>Servicios</Text>
                  <View style={styles.tenantServicesGrid}>
                    <TouchableOpacity 
                      style={styles.tenantServiceCard}
                      onPress={() => handleCall(tenantRental.utilities.electricity.phone)}
                    >
                      <View style={[styles.tenantServiceIcon, { backgroundColor: colors.warning + '20' }]}>
                        <Zap size={20} color={colors.warning} />
                      </View>
                      <Text style={styles.tenantServiceName}>Luz</Text>
                      <Text style={styles.tenantServiceProvider}>{tenantRental.utilities.electricity.provider}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.tenantServiceCard}
                      onPress={() => handleCall(tenantRental.utilities.water.phone)}
                    >
                      <View style={[styles.tenantServiceIcon, { backgroundColor: colors.info + '20' }]}>
                        <Droplets size={20} color={colors.info} />
                      </View>
                      <Text style={styles.tenantServiceName}>Agua</Text>
                      <Text style={styles.tenantServiceProvider}>{tenantRental.utilities.water.provider}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.tenantServiceCard}
                      onPress={() => handleCall(tenantRental.utilities.gas.phone)}
                    >
                      <View style={[styles.tenantServiceIcon, { backgroundColor: colors.error + '20' }]}>
                        <Flame size={20} color={colors.error} />
                      </View>
                      <Text style={styles.tenantServiceName}>Gas</Text>
                      <Text style={styles.tenantServiceProvider}>{tenantRental.utilities.gas.provider}</Text>
                    </TouchableOpacity>

                    {tenantRental.utilities.internet && (
                      <TouchableOpacity 
                        style={styles.tenantServiceCard}
                        onPress={() => handleCall(tenantRental.utilities.internet!.phone)}
                      >
                        <View style={[styles.tenantServiceIcon, { backgroundColor: colors.success + '20' }]}>
                          <Wifi size={20} color={colors.success} />
                        </View>
                        <Text style={styles.tenantServiceName}>Internet</Text>
                        <Text style={styles.tenantServiceProvider}>{tenantRental.utilities.internet.provider}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Reglas */}
                <View style={styles.tenantSection}>
                  <Text style={styles.tenantSectionTitle}>Reglas del Inmueble</Text>
                  <View style={styles.tenantRulesCard}>
                    {tenantRental.rules.map((rule, index) => (
                      <View key={index} style={styles.tenantRuleItem}>
                        <AlertCircle size={14} color={colors.accent} />
                        <Text style={styles.tenantRuleText}>{rule}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Inquilino sin renta activa */}
            {isTenant && !tenantRental && (
              <View style={styles.tenantEmptyState}>
                <Home size={48} color={colors.textMuted} />
                <Text style={styles.tenantEmptyTitle}>Sin renta activa</Text>
                <Text style={styles.tenantEmptyText}>
                  No tienes una renta activa en este momento
                </Text>
              </View>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.md,
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
})
