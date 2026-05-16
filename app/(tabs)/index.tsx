import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, shadows, clientThemes, ClientRole } from '@/lib/theme'
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
  Megaphone,
  FileText,
  Download,
  UsersRound,
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
  const [tenantActiveTab, setTenantActiveTab] = useState<'general' | 'services'>('general')

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

  // Obtener tema segun el rol del cliente
  const getClientRole = (): ClientRole => {
    if (isInvestor) return 'investor'
    if (isTenant) return 'tenant'
    return 'searching'
  }
  const theme = isClient ? clientThemes[getClientRole()] : null

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
  if (isClient && theme) {
    const dynamicStyles = {
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      greeting: {
        fontSize: typography.h2.fontSize,
        fontWeight: '700' as const,
        color: theme.text,
      },
      subGreeting: {
        fontSize: typography.bodySmall.fontSize,
        color: theme.textSecondary,
        marginTop: spacing.xs,
      },
      notificationButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: theme.surface,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        borderWidth: 1,
        borderColor: theme.border,
      },
      sectionTitle: {
        fontSize: typography.h4.fontSize,
        fontWeight: '600' as const,
        color: theme.text,
        marginBottom: spacing.md,
      },
      quickAccessCard: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: theme.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: theme.border,
      },
      quickAccessIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        backgroundColor: theme.primary + '15',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      quickAccessTitle: {
        fontSize: typography.body.fontSize,
        fontWeight: '600' as const,
        color: theme.text,
      },
      quickAccessSubtitle: {
        fontSize: typography.bodySmall.fontSize,
        color: theme.textSecondary,
        marginTop: 2,
      },
      statCard: {
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
      },
      statLabel: {
        fontSize: typography.bodySmall.fontSize,
        color: theme.textSecondary,
      },
      statValue: {
        fontSize: typography.h3.fontSize,
        fontWeight: '700' as const,
        color: theme.text,
        marginTop: spacing.xs,
      },
      statDescription: {
        fontSize: typography.caption.fontSize,
        color: theme.textMuted,
        marginTop: 2,
      },
    }

    return (
      <SafeAreaView style={dynamicStyles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Saludo con boton de notificaciones */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={dynamicStyles.greeting}>Hola, {currentUser?.name.split(' ')[0]}</Text>
              <Text style={dynamicStyles.subGreeting}>{getSubGreeting()}</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.notificationButton}
              onPress={() => router.push('/notifications-screen')}
            >
              <Bell size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Stats Cards - Solo para Inversionista (grid 2x2) */}
          {isInvestor && (
            <View style={styles.statsGridInvestor}>
              <View style={styles.statsRow}>
                <View style={[dynamicStyles.statCard, styles.statCardHalf]}>
                  <View style={styles.statHeader}>
                    <Text style={dynamicStyles.statLabel}>Propiedades</Text>
                    <Building2 size={20} color={theme.accent} />
                  </View>
                  <Text style={dynamicStyles.statValue}>{userProperties.length}</Text>
                  <Text style={dynamicStyles.statDescription}>En tu portafolio</Text>
                </View>

                <View style={[dynamicStyles.statCard, styles.statCardHalf]}>
                  <View style={styles.statHeader}>
                    <Text style={dynamicStyles.statLabel}>Valor Total</Text>
                    <DollarSign size={20} color={theme.accent} />
                  </View>
                  <Text style={dynamicStyles.statValue}>{formatCurrency(totalValue)}</Text>
                  <Text style={dynamicStyles.statDescription}>Valor actual</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[dynamicStyles.statCard, styles.statCardHalf]}>
                  <View style={styles.statHeader}>
                    <Text style={dynamicStyles.statLabel}>Ganancias</Text>
                    <TrendingUp size={20} color={theme.accent} />
                  </View>
                  <Text style={[dynamicStyles.statValue, { color: colors.success }]}>
                    {formatCurrency(totalGains)}
                  </Text>
                  <Text style={dynamicStyles.statDescription}>Plusvalia</Text>
                </View>

                <View style={[dynamicStyles.statCard, styles.statCardHalf, { backgroundColor: theme.accent }]}>
                  <View style={styles.statHeader}>
                    <Text style={[dynamicStyles.statLabel, { color: theme.primary }]}>Proyeccion</Text>
                    <TrendingUp size={20} color={theme.primary} />
                  </View>
                  <Text style={[dynamicStyles.statValue, { color: theme.primary }]}>
                    {formatCurrency(totalValue * 1.1)}
                  </Text>
                  <Text style={[dynamicStyles.statDescription, { color: theme.primary + 'cc' }]}>Est. 1 ano</Text>
                </View>
              </View>
            </View>
          )}

          {/* Acceso rapido */}
          <View style={styles.section}>
            {!isTenant && (
              <Text style={dynamicStyles.sectionTitle}>Acceso Rapido</Text>
            )}
            
            {/* Inversionista: Ver propiedades, agregar, ganancias + catalogo, favoritos, citas */}
            {isInvestor && (
              <>
                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/my-properties-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Home size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Mis Propiedades</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      {userProperties.length} propiedades en portafolio
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/add-property-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Plus size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Agregar Propiedad</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Registra y monitorea tus inversiones
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/earnings-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <TrendingUp size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Proyecciones</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Ganancias potenciales de tus propiedades
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/catalog-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Building2 size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Explorar Catalogo</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      {availableProperties.length} propiedades disponibles
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/favorites-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Heart size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Mis Favoritos</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Propiedades guardadas
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/appointments-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Calendar size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Mis Citas</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      {userAppointments.length} citas programadas
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/campaigns-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Megaphone size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Campanas</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Publicidad de tus propiedades
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </>
            )}

            {/* Buscador: Catalogo, favoritos, citas, agregar propiedad */}
            {isSearching && (
              <>
                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/catalog-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Building2 size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Explorar Catalogo</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      {availableProperties.length} propiedades disponibles
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/favorites-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Heart size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Mis Favoritos</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Propiedades guardadas
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/appointments-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Calendar size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Mis Citas</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      {userAppointments.length} citas programadas
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.quickAccessCard}
                  onPress={() => router.push('/add-property-screen')}
                >
                  <View style={dynamicStyles.quickAccessIcon}>
                    <Plus size={24} color={theme.accent} />
                  </View>
                  <View style={styles.quickAccessContent}>
                    <Text style={dynamicStyles.quickAccessTitle}>Agregar Propiedad</Text>
                    <Text style={dynamicStyles.quickAccessSubtitle}>
                      Tienes una propiedad para vender?
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </>
            )}

            )}
          </View>

          {/* Seccion Mi Renta - Solo para Inquilino (ARRIBA) */}
          {isTenant && tenantRental && tenantProperty && (
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Mi Renta</Text>
              
              {/* Tab Buttons */}
              <View style={[styles.tenantTabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TouchableOpacity 
                  style={[
                    styles.tenantTabButton,
                    tenantActiveTab === 'general' && { backgroundColor: theme.accent }
                  ]}
                  onPress={() => setTenantActiveTab('general')}
                  >
                    <Home size={18} color={tenantActiveTab === 'general' ? theme.background : theme.textMuted} />
                    <Text style={[
                      styles.tenantTabText,
                      { color: tenantActiveTab === 'general' ? theme.background : theme.textMuted }
                    ]}>General</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.tenantTabButton,
                      tenantActiveTab === 'services' && { backgroundColor: theme.accent }
                    ]}
                    onPress={() => setTenantActiveTab('services')}
                  >
                    <Zap size={18} color={tenantActiveTab === 'services' ? theme.background : theme.textMuted} />
                    <Text style={[
                      styles.tenantTabText,
                      { color: tenantActiveTab === 'services' ? theme.background : theme.textMuted }
                    ]}>Servicios</Text>
                  </TouchableOpacity>
                </View>

                {/* Tab: General - Info de la renta */}
                {tenantActiveTab === 'general' && (
                  <>
                    {/* Property Card */}
                    <View style={[styles.tenantPropertyCard, { backgroundColor: theme.green }]}>
                      <View style={[styles.tenantPropertyIcon, { backgroundColor: theme.green + '80' }]}>
                        <Home size={32} color={theme.accent} />
                      </View>
                      <Text style={[styles.tenantPropertyTitle, { color: theme.textLight }]}>{tenantProperty.title}</Text>
                      <View style={styles.tenantLocationRow}>
                        <MapPin size={16} color={theme.textLight + '80'} />
                        <Text style={[styles.tenantLocationText, { color: theme.textLight + '80' }]}>{tenantProperty.address}, {tenantProperty.city}</Text>
                      </View>
                      
                      <View style={[styles.tenantRentInfo, { backgroundColor: theme.green + '60' }]}>
                        <View style={styles.tenantRentItem}>
                          <Text style={[styles.tenantRentLabel, { color: theme.textLight + '80' }]}>Renta mensual</Text>
                          <Text style={[styles.tenantRentAmount, { color: theme.accent }]}>{formatCurrency(tenantRental.monthlyRent)}</Text>
                        </View>
                        <View style={[styles.tenantRentDivider, { backgroundColor: theme.textLight + '30' }]} />
                        <View style={styles.tenantRentItem}>
                          <Text style={[styles.tenantRentLabel, { color: theme.textLight + '80' }]}>Proximo pago</Text>
                          <Text style={styles.tenantRentDays}>{daysUntilPayment} dias</Text>
                        </View>
                      </View>
                    </View>

                    {/* Arrendador */}
                    {tenantLandlord && (
                      <View style={styles.tenantSection}>
                        <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Propietario</Text>
                        <View style={[styles.tenantContactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                          <View style={styles.tenantContactHeader}>
                            <View style={[styles.tenantContactAvatar, { backgroundColor: theme.green + '20' }]}>
                              <User size={20} color={theme.green} />
                            </View>
                            <View style={styles.tenantContactInfo}>
                              <Text style={[styles.tenantContactName, { color: theme.text }]}>{tenantLandlord.name}</Text>
                              <Text style={[styles.tenantContactRole, { color: theme.textMuted }]}>Dueno de la propiedad</Text>
                            </View>
                            <TouchableOpacity 
                              style={[styles.tenantCallButton, { backgroundColor: theme.green + '15' }]}
                              onPress={() => handleCall(tenantLandlord.phone)}
                            >
                              <Phone size={18} color={theme.green} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Asesor */}
                    {tenantAgent && (
                      <View style={styles.tenantSection}>
                        <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Asesor Encargado</Text>
                        <View style={[styles.tenantContactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                          <View style={styles.tenantContactHeader}>
                            <View style={[styles.tenantContactAvatar, { backgroundColor: theme.accent + '20' }]}>
                              <User size={20} color={theme.accent} />
                            </View>
                            <View style={styles.tenantContactInfo}>
                              <Text style={[styles.tenantContactName, { color: theme.text }]}>{tenantAgent.name}</Text>
                              <Text style={[styles.tenantContactRole, { color: theme.textMuted }]}>Asesor Inicio</Text>
                            </View>
                            <TouchableOpacity 
                              style={[styles.tenantCallButton, { backgroundColor: theme.accent + '15' }]}
                              onPress={() => handleCall(tenantAgent.phone)}
                            >
                              <Phone size={18} color={theme.accent} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Contrato Info */}
                    <View style={styles.tenantSection}>
                      <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Informacion del Contrato</Text>
                      <View style={[styles.tenantInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.tenantInfoRow}>
                          <Calendar size={18} color={theme.green} />
                          <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Inicio del contrato:</Text>
                          <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatDate(tenantRental.startDate)}</Text>
                        </View>
                        <View style={styles.tenantInfoRow}>
                          <Clock size={18} color={theme.warm} />
                          <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Fin del contrato:</Text>
                          <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatDate(tenantRental.endDate)}</Text>
                        </View>
                        <View style={styles.tenantInfoRow}>
                          <DollarSign size={18} color={theme.accent} />
                          <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Dia de pago:</Text>
                          <Text style={[styles.tenantInfoValue, { color: theme.text }]}>Dia {tenantRental.paymentDay} de cada mes</Text>
                        </View>
                        <View style={styles.tenantInfoRow}>
                          <Shield size={18} color={theme.accent} />
                          <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Deposito:</Text>
                          <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatCurrency(tenantRental.depositAmount)}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Reglas */}
                    {tenantRental.rules && tenantRental.rules.length > 0 && (
                      <View style={styles.tenantSection}>
                        <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Reglas del Inmueble</Text>
                        <View style={[styles.tenantRulesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                          {tenantRental.rules.map((rule, index) => (
                            <View key={index} style={styles.tenantRuleItem}>
                              <AlertCircle size={14} color={theme.warm} />
                              <Text style={[styles.tenantRuleText, { color: theme.text }]}>{rule}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* Tab: Servicios */}
                {tenantActiveTab === 'services' && (
                  <>
                    {/* Servicios */}
                    <View style={styles.tenantSection}>
                      <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Servicios</Text>
                      <View style={styles.tenantServicesGrid}>
                        <TouchableOpacity 
                          style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => handleCall(tenantRental.utilities.electricity.phone)}
                        >
                          <View style={[styles.tenantServiceIcon, { backgroundColor: '#fbbf24' + '20' }]}>
                            <Zap size={20} color="#fbbf24" />
                          </View>
                          <Text style={[styles.tenantServiceName, { color: theme.text }]}>Luz</Text>
                          <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>{tenantRental.utilities.electricity.provider}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => handleCall(tenantRental.utilities.water.phone)}
                        >
                          <View style={[styles.tenantServiceIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                            <Droplets size={20} color="#3b82f6" />
                          </View>
                          <Text style={[styles.tenantServiceName, { color: theme.text }]}>Agua</Text>
                          <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>{tenantRental.utilities.water.provider}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => handleCall(tenantRental.utilities.gas.phone)}
                        >
                          <View style={[styles.tenantServiceIcon, { backgroundColor: '#ef4444' + '20' }]}>
                            <Flame size={20} color="#ef4444" />
                          </View>
                          <Text style={[styles.tenantServiceName, { color: theme.text }]}>Gas</Text>
                          <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>{tenantRental.utilities.gas.provider}</Text>
                        </TouchableOpacity>

                        {tenantRental.utilities.internet && (
                          <TouchableOpacity 
                            style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => handleCall(tenantRental.utilities.internet!.phone)}
                          >
                            <View style={[styles.tenantServiceIcon, { backgroundColor: '#22c55e' + '20' }]}>
                              <Wifi size={20} color="#22c55e" />
                            </View>
                            <Text style={[styles.tenantServiceName, { color: theme.text }]}>Internet</Text>
                            <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>{tenantRental.utilities.internet.provider}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Grupos / Comunidad */}
                    <View style={styles.tenantSection}>
                      <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Comunidad</Text>
                      <View style={[styles.tenantCommunityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[styles.tenantCommunityIcon, { backgroundColor: theme.green + '20' }]}>
                          <UsersRound size={24} color={theme.green} />
                        </View>
                        <View style={styles.tenantCommunityInfo}>
                          <Text style={[styles.tenantCommunityTitle, { color: theme.text }]}>Grupo de Residentes</Text>
                          <Text style={[styles.tenantCommunityDesc, { color: theme.textMuted }]}>
                            Unete al grupo de WhatsApp de la comunidad
                          </Text>
                        </View>
                        <ChevronRight size={20} color={theme.textMuted} />
                      </View>
                      
                      <View style={[styles.tenantCommunityCard, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: spacing.sm }]}>
                        <View style={[styles.tenantCommunityIcon, { backgroundColor: theme.accent + '20' }]}>
                          <Shield size={24} color={theme.accent} />
                        </View>
                        <View style={styles.tenantCommunityInfo}>
                          <Text style={[styles.tenantCommunityTitle, { color: theme.text }]}>Administracion del Coto</Text>
                          <Text style={[styles.tenantCommunityDesc, { color: theme.textMuted }]}>
                            Contacto y reglas de la comunidad
                          </Text>
                        </View>
                        <ChevronRight size={20} color={theme.textMuted} />
                      </View>
                    </View>

                    {/* Documentos - Acceso rapido */}
                    <View style={styles.tenantSection}>
                      <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Documentos</Text>
                      <TouchableOpacity 
                        style={[styles.tenantDocumentsCard, { backgroundColor: theme.green, borderColor: theme.green }]}
                        onPress={() => router.push('/documents-screen')}
                      >
                        <View style={styles.tenantDocumentsContent}>
                          <View style={[styles.tenantDocumentsIcon, { backgroundColor: theme.textLight + '20' }]}>
                            <FileText size={28} color={theme.textLight} />
                          </View>
                          <View style={styles.tenantDocumentsInfo}>
                            <Text style={[styles.tenantDocumentsTitle, { color: theme.textLight }]}>Ver Documentos</Text>
                            <Text style={[styles.tenantDocumentsDesc, { color: theme.textLight + '80' }]}>
                              Contrato, comprobantes y mas
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.tenantDocumentsButton, { backgroundColor: theme.accent }]}>
                          <Download size={20} color={theme.background} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
            </View>
          )}

          {/* Accesos rapidos del inquilino (ABAJO) */}
          {isTenant && (
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Acceso Rapido</Text>
              
              <TouchableOpacity 
                style={dynamicStyles.quickAccessCard}
                onPress={() => router.push('/catalog-screen')}
              >
                <View style={dynamicStyles.quickAccessIcon}>
                  <Building2 size={24} color={theme.accent} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={dynamicStyles.quickAccessTitle}>Explorar Catalogo</Text>
                  <Text style={dynamicStyles.quickAccessSubtitle}>
                    {availableProperties.length} propiedades disponibles
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={dynamicStyles.quickAccessCard}
                onPress={() => router.push('/favorites-screen')}
              >
                <View style={dynamicStyles.quickAccessIcon}>
                  <Heart size={24} color={theme.accent} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={dynamicStyles.quickAccessTitle}>Mis Favoritos</Text>
                  <Text style={dynamicStyles.quickAccessSubtitle}>
                    Propiedades guardadas
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={dynamicStyles.quickAccessCard}
                onPress={() => router.push('/appointments-screen')}
              >
                <View style={dynamicStyles.quickAccessIcon}>
                  <Calendar size={24} color={theme.accent} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={dynamicStyles.quickAccessTitle}>Mis Citas</Text>
                  <Text style={dynamicStyles.quickAccessSubtitle}>
                    {userAppointments.length} citas programadas
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={dynamicStyles.quickAccessCard}
                onPress={() => router.push('/add-property-screen')}
              >
                <View style={dynamicStyles.quickAccessIcon}>
                  <Plus size={24} color={theme.accent} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={dynamicStyles.quickAccessTitle}>Agregar Propiedad</Text>
                  <Text style={dynamicStyles.quickAccessSubtitle}>
                    Registra una propiedad para invertir
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Inquilino sin renta activa */}
          {isTenant && !tenantRental && (
            <View style={styles.section}>
              <View style={styles.tenantEmptyState}>
                <Home size={48} color={theme.textMuted} />
                <Text style={[styles.tenantEmptyTitle, { color: theme.text }]}>Sin renta activa</Text>
                <Text style={[styles.tenantEmptyText, { color: theme.textMuted }]}>
                  No tienes una renta activa en este momento
                </Text>
              </View>
            </View>
          )}
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
