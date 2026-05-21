import { useMemo, useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { mockProperties, mockPropertyEarnings, formatCurrency } from '@/lib/mock-data'
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  Home,
  Building2,
  ChevronRight,
  Banknote,
  ArrowUpRight,
  Clock,
  Target,
} from 'lucide-react-native'

// Colores del inversionista (negro y dorado)
const investorColors = clientThemes.investor

type TabType = 'plusvalia' | 'rentas'

export default function EarningsScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('plusvalia')

  const myProperties = useMemo(() => {
    if (!currentUser) return []
    return mockProperties.filter(p => p.ownerId === currentUser.id)
  }, [currentUser])

  const totalEarnings = useMemo(() => {
    return mockPropertyEarnings.reduce((sum, e) => {
      const property = myProperties.find(p => p.id === e.propertyId)
      if (property) {
        return sum + e.totalEarnings
      }
      return sum
    }, 0)
  }, [myProperties])

  const monthlyIncome = useMemo(() => {
    return myProperties
      .filter(p => p.status === 'rented' && p.monthlyRent)
      .reduce((sum, p) => sum + (p.monthlyRent || 0), 0)
  }, [myProperties])

  const projectedAnnual = useMemo(() => {
    return monthlyIncome * 12
  }, [monthlyIncome])

  // Calculos de plusvalia
  const totalPropertyValue = useMemo(() => {
    return myProperties.reduce((sum, p) => sum + p.price, 0)
  }, [myProperties])

  const projectedValue1Year = useMemo(() => {
    // Asumiendo 8% de plusvalia anual promedio
    return totalPropertyValue * 1.08
  }, [totalPropertyValue])

  const projectedValue5Years = useMemo(() => {
    // Plusvalia compuesta al 8% anual
    return totalPropertyValue * Math.pow(1.08, 5)
  }, [totalPropertyValue])

  const potentialGain = useMemo(() => {
    return projectedValue1Year - totalPropertyValue
  }, [projectedValue1Year, totalPropertyValue])

  const propertyEarningsData = useMemo(() => {
    return myProperties.map(property => {
      const earnings = mockPropertyEarnings.find(e => e.propertyId === property.id)
      return {
        property,
        earnings: earnings || {
          propertyId: property.id,
          totalEarnings: 0,
          monthlyEarnings: 0,
          occupancyRate: 0,
          paymentHistory: [],
        },
      }
    })
  }, [myProperties])

  // Proyecciones de renta por propiedad
  const rentProjections = useMemo(() => {
    return myProperties.map(property => {
      // Estimacion de renta mensual basada en el valor (0.5% del valor)
      const estimatedRent = property.monthlyRent || Math.round(property.price * 0.005)
      const annualRent = estimatedRent * 12
      const roi = ((annualRent / property.price) * 100).toFixed(1)
      
      return {
        property,
        estimatedRent,
        annualRent,
        roi,
        currentlyRented: property.status === 'rented',
      }
    })
  }, [myProperties])

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
        <Text style={styles.headerTitle}>Ganancias</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'plusvalia' && styles.tabButtonActive]}
          onPress={() => setActiveTab('plusvalia')}
        >
          <TrendingUp size={18} color={activeTab === 'plusvalia' ? investorColors.primary : investorColors.textMuted} />
          <Text style={[styles.tabButtonText, activeTab === 'plusvalia' && styles.tabButtonTextActive]}>
            Plusvalia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rentas' && styles.tabButtonActive]}
          onPress={() => setActiveTab('rentas')}
        >
          <Banknote size={18} color={activeTab === 'rentas' ? investorColors.primary : investorColors.textMuted} />
          <Text style={[styles.tabButtonText, activeTab === 'rentas' && styles.tabButtonTextActive]}>
            Rentas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab: Plusvalia */}
        {activeTab === 'plusvalia' && (
          <>
            {/* Valor Actual Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Valor actual de tu portafolio</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalPropertyValue)}</Text>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
                    <ArrowUpRight size={20} color={colors.success} />
                  </View>
                  <View>
                    <Text style={styles.summaryItemLabel}>Ganancia potencial</Text>
                    <Text style={[styles.summaryItemValue, { color: colors.success }]}>
                      +{formatCurrency(potentialGain)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
                    <TrendingUp size={20} color={colors.info} />
                  </View>
                  <View>
                    <Text style={styles.summaryItemLabel}>Tasa anual est.</Text>
                    <Text style={styles.summaryItemValue}>8%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Proyecciones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proyecciones de valor</Text>

              <View style={styles.projectionCard}>
                <View style={styles.projectionHeader}>
                  <Clock size={20} color={investorColors.accent} />
                  <Text style={styles.projectionTitle}>En 1 ano</Text>
                </View>
                <Text style={styles.projectionValue}>{formatCurrency(projectedValue1Year)}</Text>
                <Text style={styles.projectionGain}>
                  +{formatCurrency(projectedValue1Year - totalPropertyValue)} de plusvalia
                </Text>
              </View>

              <View style={styles.projectionCard}>
                <View style={styles.projectionHeader}>
                  <Target size={20} color={investorColors.accent} />
                  <Text style={styles.projectionTitle}>En 5 anos</Text>
                </View>
                <Text style={styles.projectionValue}>{formatCurrency(projectedValue5Years)}</Text>
                <Text style={styles.projectionGain}>
                  +{formatCurrency(projectedValue5Years - totalPropertyValue)} de plusvalia
                </Text>
              </View>
            </View>

            {/* Desglose por propiedad - Plusvalia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Valor por propiedad</Text>

              {myProperties.map(property => {
                const value1Year = property.price * 1.08
                const gain = value1Year - property.price
                
                return (
                  <TouchableOpacity 
                    key={property.id}
                    style={styles.propertyCard}
                    onPress={() => router.push(`/property-detail-screen?id=${property.id}`)}
                  >
                    <View style={styles.propertyIconContainer}>
                      {property.type === 'house' ? (
                        <Home size={24} color={investorColors.accent} />
                      ) : (
                        <Building2 size={24} color={investorColors.accent} />
                      )}
                    </View>

                    <View style={styles.propertyContent}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={styles.propertyCity}>{property.city}</Text>
                      
                      <View style={styles.propertyStats}>
                        <View style={styles.propertyStat}>
                          <Text style={styles.propertyStatLabel}>Valor actual</Text>
                          <Text style={styles.propertyStatValue}>
                            {formatCurrency(property.price)}
                          </Text>
                        </View>
                        
                        <View style={styles.propertyStat}>
                          <Text style={styles.propertyStatLabel}>En 1 ano</Text>
                          <Text style={[styles.propertyStatValue, { color: colors.success }]}>
                            +{formatCurrency(gain)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <ChevronRight size={20} color={investorColors.textMuted} />
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Costos estimados para venta */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Costos estimados para venta</Text>
              
              <View style={styles.costsCard}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Comision inmobiliaria (5%)</Text>
                  <Text style={styles.costValue}>{formatCurrency(totalPropertyValue * 0.05)}</Text>
                </View>
                <View style={styles.costDivider} />
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Gastos notariales (2%)</Text>
                  <Text style={styles.costValue}>{formatCurrency(totalPropertyValue * 0.02)}</Text>
                </View>
                <View style={styles.costDivider} />
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>ISR (estimado)</Text>
                  <Text style={styles.costValue}>{formatCurrency(potentialGain * 0.35)}</Text>
                </View>
                <View style={styles.costDivider} />
                <View style={[styles.costRow, { marginTop: spacing.sm }]}>
                  <Text style={[styles.costLabel, { fontWeight: '600', color: investorColors.text }]}>
                    Ganancia neta estimada (1 ano)
                  </Text>
                  <Text style={[styles.costValue, { color: colors.success, fontWeight: '700' }]}>
                    {formatCurrency(potentialGain - (totalPropertyValue * 0.07) - (potentialGain * 0.35))}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Tab: Rentas */}
        {activeTab === 'rentas' && (
          <>
            {/* Summary Card - Rentas */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Ingresos por renta</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalEarnings)}</Text>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
                    <DollarSign size={20} color={colors.success} />
                  </View>
                  <View>
                    <Text style={styles.summaryItemLabel}>Mensual</Text>
                    <Text style={styles.summaryItemValue}>{formatCurrency(monthlyIncome)}</Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
                    <Calendar size={20} color={colors.info} />
                  </View>
                  <View>
                    <Text style={styles.summaryItemLabel}>Proyeccion anual</Text>
                    <Text style={styles.summaryItemValue}>{formatCurrency(projectedAnnual)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Home size={24} color={investorColors.accent} />
                <Text style={styles.statValue}>
                  {myProperties.filter(p => p.status === 'rented').length}
                </Text>
                <Text style={styles.statLabel}>Rentadas</Text>
              </View>

              <View style={styles.statCard}>
                <Building2 size={24} color={colors.info} />
                <Text style={styles.statValue}>
                  {myProperties.filter(p => p.status !== 'rented').length}
                </Text>
                <Text style={styles.statLabel}>Disponibles</Text>
              </View>
            </View>

            {/* Desglose por propiedad - Rentas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingresos por propiedad</Text>

              {propertyEarningsData.map(({ property, earnings }) => (
                <TouchableOpacity 
                  key={property.id}
                  style={styles.propertyCard}
                  onPress={() => router.push(`/property-detail-screen?id=${property.id}`)}
                >
                  <View style={styles.propertyIconContainer}>
                    {property.type === 'house' ? (
                      <Home size={24} color={investorColors.accent} />
                    ) : (
                      <Building2 size={24} color={investorColors.accent} />
                    )}
                  </View>

                  <View style={styles.propertyContent}>
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                      {property.title}
                    </Text>
                    <View style={styles.propertyStatusRow}>
                      <Text style={styles.propertyCity}>{property.city}</Text>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: property.status === 'rented' ? colors.success + '20' : investorColors.border }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: property.status === 'rented' ? colors.success : investorColors.textMuted }
                        ]}>
                          {property.status === 'rented' ? 'Rentada' : 'Disponible'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.propertyStats}>
                      <View style={styles.propertyStat}>
                        <Text style={styles.propertyStatLabel}>Total ganado</Text>
                        <Text style={styles.propertyStatValue}>
                          {formatCurrency(earnings.totalEarnings)}
                        </Text>
                      </View>
                      
                      <View style={styles.propertyStat}>
                        <Text style={styles.propertyStatLabel}>Renta mensual</Text>
                        <Text style={[styles.propertyStatValue, { color: colors.success }]}>
                          {formatCurrency(earnings.monthlyEarnings || property.monthlyRent || 0)}
                        </Text>
                      </View>

                      <View style={styles.propertyStat}>
                        <Text style={styles.propertyStatLabel}>Ocupacion</Text>
                        <Text style={styles.propertyStatValue}>
                          {earnings.occupancyRate}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ChevronRight size={20} color={investorColors.textMuted} />
                </TouchableOpacity>
              ))}

              {propertyEarningsData.length === 0 && (
                <View style={styles.emptyState}>
                  <DollarSign size={48} color={investorColors.textMuted} />
                  <Text style={styles.emptyStateText}>
                    Agrega propiedades para ver tus ganancias
                  </Text>
                </View>
              )}
            </View>

            {/* Proyeccion de rentas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Potencial de renta</Text>
              
              {rentProjections.map(({ property, estimatedRent, annualRent, roi, currentlyRented }) => (
                <View key={property.id} style={styles.rentProjectionCard}>
                  <View style={styles.rentProjectionHeader}>
                    <Text style={styles.rentProjectionTitle} numberOfLines={1}>{property.title}</Text>
                    {currentlyRented && (
                      <View style={styles.rentingBadge}>
                        <Text style={styles.rentingBadgeText}>Rentando</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rentProjectionStats}>
                    <View style={styles.rentProjectionStat}>
                      <Text style={styles.rentProjectionLabel}>Renta estimada</Text>
                      <Text style={styles.rentProjectionValue}>{formatCurrency(estimatedRent)}/mes</Text>
                    </View>
                    <View style={styles.rentProjectionStat}>
                      <Text style={styles.rentProjectionLabel}>Anual</Text>
                      <Text style={styles.rentProjectionValue}>{formatCurrency(annualRent)}</Text>
                    </View>
                    <View style={styles.rentProjectionStat}>
                      <Text style={styles.rentProjectionLabel}>ROI</Text>
                      <Text style={[styles.rentProjectionValue, { color: investorColors.accent }]}>{roi}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
    paddingVertical: spacing.md,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: investorColors.surface,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  tabButtonActive: {
    backgroundColor: investorColors.accent,
    borderColor: investorColors.accent,
  },
  tabButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.textMuted,
  },
  tabButtonTextActive: {
    color: investorColors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  summaryCard: {
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.primary + 'cc',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: investorColors.primary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: investorColors.primary + '30',
    marginVertical: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.primary + 'cc',
  },
  summaryItemValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  statValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginTop: 2,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  projectionCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  projectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.textSecondary,
  },
  projectionValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  projectionGain: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.success,
    marginTop: spacing.xs,
  },
  costsCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  costLabel: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
  },
  costValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.text,
  },
  costDivider: {
    height: 1,
    backgroundColor: investorColors.border,
    marginVertical: spacing.xs,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  propertyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: investorColors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  propertyContent: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  propertyCity: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    marginTop: 2,
  },
  propertyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  propertyStats: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  propertyStat: {},
  propertyStatLabel: {
    fontSize: 10,
    color: investorColors.textMuted,
  },
  propertyStatValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  rentProjectionCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  rentProjectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rentProjectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
    flex: 1,
  },
  rentingBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  rentingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  rentProjectionStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rentProjectionStat: {},
  rentProjectionLabel: {
    fontSize: 10,
    color: investorColors.textMuted,
  },
  rentProjectionValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
})
