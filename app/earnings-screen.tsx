import { useMemo } from 'react'
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
  PieChart,
} from 'lucide-react-native'

// Colores del inversionista (negro y dorado)
const investorColors = clientThemes.investor

export default function EarningsScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()

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

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ganancias totales</Text>
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
                <TrendingUp size={20} color={colors.info} />
              </View>
              <View>
                <Text style={styles.summaryItemLabel}>Proyeccion anual</Text>
                <Text style={styles.summaryItemValue}>{formatCurrency(projectedAnnual)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <PieChart size={24} color={investorColors.accent} />
            <Text style={styles.statValue}>{myProperties.length}</Text>
            <Text style={styles.statLabel}>Propiedades</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color={colors.success} />
            <Text style={styles.statValue}>
              {myProperties.filter(p => p.status === 'rented').length}
            </Text>
            <Text style={styles.statLabel}>Rentadas</Text>
          </View>

          <View style={styles.statCard}>
            <Home size={24} color={colors.info} />
            <Text style={styles.statValue}>
              {myProperties.filter(p => p.status === 'for_sale' || p.status === 'for_rent').length}
            </Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
        </View>

        {/* Properties Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose por propiedad</Text>

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
                <Text style={styles.propertyCity}>{property.city}</Text>
                
                <View style={styles.propertyStats}>
                  <View style={styles.propertyStat}>
                    <Text style={styles.propertyStatLabel}>Total</Text>
                    <Text style={styles.propertyStatValue}>
                      {formatCurrency(earnings.totalEarnings)}
                    </Text>
                  </View>
                  
                  <View style={styles.propertyStat}>
                    <Text style={styles.propertyStatLabel}>Mensual</Text>
                    <Text style={[styles.propertyStatValue, { color: colors.success }]}>
                      {formatCurrency(earnings.monthlyEarnings)}
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

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Consejos para maximizar ganancias</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Mantiene tus propiedades en buen estado para atraer mejores inquilinos</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Revisa los precios del mercado periodicamente para ajustar tu renta</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Considera contratos a largo plazo para mayor estabilidad</Text>
          </View>
        </View>
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
  tipsCard: {
    backgroundColor: investorColors.accent + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.accent + '30',
  },
  tipsTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.accent,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.accent,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.text,
    lineHeight: 20,
  },
})
