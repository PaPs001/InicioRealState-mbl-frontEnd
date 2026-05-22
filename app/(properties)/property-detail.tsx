import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'

// Colores del inversionista (negro y dorado)
const investorColors = clientThemes.investor
import { mockProperties, mockUsers, mockActiveRental, mockPropertyEarnings, formatCurrency, formatDate } from '@/lib/mock-data'
import { 
  ArrowLeft,
  Home,
  Building2,
  Map,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Info,
  Users,
  Megaphone,
  Ruler,
  ShoppingBag,
  ListPlus,
} from 'lucide-react-native'

type TabType = 'general' | 'tenant' | 'earnings'

export default function PropertyDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const property = useMemo(() => {
    return mockProperties.find(p => p.id === id)
  }, [id])

  const earnings = useMemo(() => {
    return mockPropertyEarnings.find(e => e.propertyId === id)
  }, [id])

  const rental = useMemo(() => {
    if (property?.status === 'rented') {
      return mockActiveRental.propertyId === id ? mockActiveRental : null
    }
    return null
  }, [property, id])

  const tenant = useMemo(() => {
    if (rental) {
      return mockUsers.find(u => u.id === rental.tenantId)
    }
    return null
  }, [rental])

  const agent = useMemo(() => {
    if (property?.agentId) {
      return mockUsers.find(u => u.id === property.agentId)
    }
    return null
  }, [property])

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const isRented = property?.status === 'rented'

  if (!property) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={investorColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={investorColors.textMuted} />
          <Text style={styles.emptyStateText}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const Icon = getPropertyIcon(property.type)

  // Tab de Informacion General
  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      {/* Informacion basica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informacion General</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ruler size={20} color={investorColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tamano</Text>
              <Text style={styles.infoValue}>{property.size} m²</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ShoppingBag size={20} color={investorColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Precio de compra</Text>
              <Text style={styles.infoValue}>{formatCurrency(property.price)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <TrendingUp size={20} color={investorColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Valor actual</Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>
                {formatCurrency(property.currentValue || property.price)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MapPin size={20} color={investorColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicacion</Text>
              <Text style={styles.infoValue}>{property.address}, {property.city}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Info size={20} color={investorColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adquirida</Text>
              <Text style={styles.infoValue}>
                {property.purchasedWithUs ? 'Con Inicio Real Estate' : 'De manera externa'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Amenidades */}
      {property.amenities && property.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenidades</Text>
          <View style={styles.amenitiesContainer}>
            {property.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Asesor que rento/gestiono */}
      {agent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRented ? 'Asesor que rento la propiedad' : 'Asesor asignado'}
          </Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{agent.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefono</Text>
                <Text style={styles.infoValue}>{agent.phone}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Estado de publicidad (si no esta rentada) */}
      {!isRented && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Publicidad</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Megaphone size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Publicidad</Text>
                <Text style={[
                  styles.infoValue, 
                  { color: property.status === 'for_sale' || property.status === 'for_rent' 
                    ? colors.success 
                    : colors.textMuted 
                  }
                ]}>
                  {property.status === 'for_sale' 
                    ? 'Activa - En venta' 
                    : property.status === 'for_rent' 
                      ? 'Activa - En renta'
                      : 'Sin publicidad activa'}
                </Text>
              </View>
            </View>

            {(property.status === 'for_sale' || property.status === 'for_rent') && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Calendar size={20} color={investorColors.accent} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Fecha de listado</Text>
                    <Text style={styles.infoValue}>{formatDate(property.createdAt)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  )

  // Tab de Inquilino (solo si esta rentada)
  const renderTenantTab = () => {
    if (!isRented || !rental || !tenant) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyTabState}>
            <Users size={48} color={investorColors.textMuted} />
            <Text style={styles.emptyTabTitle}>Sin inquilino</Text>
            <Text style={styles.emptyTabText}>
              Esta propiedad no esta rentada actualmente
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.tabContent}>
        {/* Informacion del inquilino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Inquilino</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{tenant.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefono</Text>
                <Text style={styles.infoValue}>{tenant.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Mail size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{tenant.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detalles del contrato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrato</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Inicio del contrato</Text>
                <Text style={styles.infoValue}>{formatDate(rental.startDate)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Clock size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fin del contrato</Text>
                <Text style={styles.infoValue}>{formatDate(rental.endDate)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <DollarSign size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Renta mensual</Text>
                <Text style={styles.infoValue}>{formatCurrency(rental.monthlyRent)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Calendar size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dia de pago</Text>
                <Text style={styles.infoValue}>Dia {rental.paymentDay} de cada mes</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <DollarSign size={20} color={investorColors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Deposito</Text>
                <Text style={styles.infoValue}>{formatCurrency(rental.depositAmount)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Documentacion */}
        {rental.documents && rental.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentacion</Text>
            
            <View style={styles.infoCard}>
              {rental.documents.map((doc, index) => (
                <View key={doc.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity style={styles.documentRow}>
                    <FileText size={20} color={investorColors.accent} />
                    <View style={styles.documentContent}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={styles.documentDate}>{formatDate(doc.uploadDate)}</Text>
                    </View>
                    <View style={[
                      styles.documentStatus,
                      doc.status === 'approved' && { backgroundColor: colors.success + '20' },
                      doc.status === 'pending' && { backgroundColor: colors.warning + '20' },
                      doc.status === 'rejected' && { backgroundColor: colors.error + '20' },
                    ]}>
                      <Text style={[
                        styles.documentStatusText,
                        doc.status === 'approved' && { color: colors.success },
                        doc.status === 'pending' && { color: colors.warning },
                        doc.status === 'rejected' && { color: colors.error },
                      ]}>
                        {doc.status === 'approved' ? 'Aprobado' : doc.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }

  // Tab de Ganancias
  const renderEarningsTab = () => {
    const hasEarnings = earnings && earnings.totalEarnings > 0

    if (!hasEarnings) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyTabState}>
            <DollarSign size={48} color={investorColors.textMuted} />
            <Text style={styles.emptyTabTitle}>Sin ganancias registradas</Text>
            <Text style={styles.emptyTabText}>
              Cuando esta propiedad genere ingresos, apareceran aqui
            </Text>
          </View>

          {/* Proyeccion de ganancias */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyeccion de Ganancias</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <TrendingUp size={20} color={investorColors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Si se renta (estimado)</Text>
                  <Text style={[styles.infoValue, { color: colors.success }]}>
                    {formatCurrency((property.currentValue || property.price) * 0.006)}/mes
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <TrendingUp size={20} color={investorColors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Plusvalia anual estimada</Text>
                  <Text style={[styles.infoValue, { color: colors.success }]}>
                    {formatCurrency((property.currentValue || property.price) * 0.10)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.tabContent}>
        {/* Resumen de ganancias */}
        <View style={styles.earningsGrid}>
          <View style={styles.earningCard}>
            <DollarSign size={24} color={colors.success} />
            <Text style={styles.earningAmount}>
              {formatCurrency(earnings.totalEarnings)}
            </Text>
            <Text style={styles.earningLabel}>Total acumulado</Text>
          </View>

          <View style={styles.earningCard}>
            <TrendingUp size={24} color={colors.info} />
            <Text style={styles.earningAmount}>{earnings.occupancyRate}%</Text>
            <Text style={styles.earningLabel}>Ocupacion</Text>
          </View>
        </View>

        {/* Proximos pagos */}
        {earnings.nextPaymentDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proximos Pagos</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Calendar size={20} color={investorColors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Proximo pago</Text>
                  <Text style={styles.infoValue}>{formatDate(earnings.nextPaymentDate)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <DollarSign size={20} color={investorColors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Monto esperado</Text>
                  <Text style={[styles.infoValue, { color: colors.success }]}>
                    {formatCurrency(earnings.monthlyEarnings)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Historial de pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Pagos</Text>
          
          <View style={styles.infoCard}>
            {earnings.paymentHistory.map((payment, index) => (
              <View key={index}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentMonth}>{payment.month}</Text>
                  <View style={[
                    styles.paymentStatus,
                    payment.status === 'paid' && { backgroundColor: colors.success + '20' },
                    payment.status === 'pending' && { backgroundColor: colors.warning + '20' },
                    payment.status === 'late' && { backgroundColor: colors.error + '20' },
                  ]}>
                    <Text style={[
                      styles.paymentStatusText,
                      payment.status === 'paid' && { color: colors.success },
                      payment.status === 'pending' && { color: colors.warning },
                      payment.status === 'late' && { color: colors.error },
                    ]}>
                      {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Atrasado'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.paymentAmount,
                    payment.status === 'paid' && { color: colors.success },
                    payment.status === 'pending' && { color: colors.warning },
                    payment.status === 'late' && { color: colors.error },
                  ]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={investorColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Property Header Card */}
      <View style={styles.propertyHeader}>
        <View style={styles.propertyIconLarge}>
          <Icon size={40} color={investorColors.accent} />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={investorColors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>{property.city}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'general' && styles.tabActive]}
          onPress={() => setActiveTab('general')}
        >
          <Info size={18} color={activeTab === 'general' ? colors.accent : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>
            General
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tenant' && styles.tabActive]}
          onPress={() => setActiveTab('tenant')}
        >
          <Users size={18} color={activeTab === 'tenant' ? colors.accent : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'tenant' && styles.tabTextActive]}>
            Inquilino
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'earnings' && styles.tabActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <DollarSign size={18} color={activeTab === 'earnings' ? colors.accent : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
            Ganancias
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'tenant' && renderTenantTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
      </ScrollView>

      {/* Boton Enlistar Propiedad - solo si no esta rentada ni en venta/renta */}
      {property.status !== 'rented' && property.status !== 'for_sale' && property.status !== 'for_rent' && (
        <View style={styles.listButtonContainer}>
          <TouchableOpacity 
            style={styles.listButton}
            onPress={() => router.push(`/list-property?id=${property.id}`)}
          >
            <ListPlus size={20} color={colors.primary} />
            <Text style={styles.listButtonText}>Enlistar esta propiedad</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: investorColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: investorColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  propertyIconLarge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: investorColors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: investorColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: investorColors.accent,
  },
  tabText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: investorColors.textMuted,
  },
  tabTextActive: {
    color: investorColors.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  infoCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  infoValue: {
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: investorColors.border,
    marginVertical: spacing.xs,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityTag: {
    backgroundColor: investorColors.accent + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  amenityText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: investorColors.accent,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginTop: 2,
  },
  documentStatus: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  documentStatusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  earningCard: {
    flex: 1,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  earningAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: investorColors.text,
    marginTop: spacing.sm,
  },
  earningLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  paymentMonth: {
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    flex: 1,
  },
  paymentStatus: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  paymentStatusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyTabState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTabTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
    marginTop: spacing.md,
  },
  emptyTabText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  listButtonContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: investorColors.border,
    backgroundColor: investorColors.background,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  listButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
})
