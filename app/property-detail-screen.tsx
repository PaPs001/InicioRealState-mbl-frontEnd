import { useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
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
  Users,
  AlertCircle,
} from 'lucide-react-native'

export default function PropertyDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

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

  if (!property) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={colors.textMuted} />
          <Text style={styles.emptyStateText}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const Icon = getPropertyIcon(property.type)

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Header Card */}
        <View style={styles.propertyHeader}>
          <View style={styles.propertyIconLarge}>
            <Icon size={48} color={colors.accent} />
          </View>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>{property.address}, {property.city}</Text>
          </View>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Valor actual</Text>
              <Text style={styles.valueAmount}>
                {formatCurrency(property.currentValue || property.price)}
              </Text>
            </View>
            {property.monthlyRent && (
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>Renta/mes</Text>
                <Text style={[styles.valueAmount, { color: colors.success }]}>
                  {formatCurrency(property.monthlyRent)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Si esta rentado - Info del inquilino */}
        {property.status === 'rented' && rental && tenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacion del Inquilino</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Inquilino</Text>
                  <Text style={styles.infoValue}>{tenant.name}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Phone size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefono</Text>
                  <Text style={styles.infoValue}>{tenant.phone}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Mail size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{tenant.email}</Text>
                </View>
              </View>
            </View>

            {/* Detalles del contrato */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Calendar size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Inicio del contrato</Text>
                  <Text style={styles.infoValue}>{formatDate(rental.startDate)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Clock size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fin del contrato</Text>
                  <Text style={styles.infoValue}>{formatDate(rental.endDate)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <DollarSign size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dia de pago</Text>
                  <Text style={styles.infoValue}>Dia {rental.paymentDay} de cada mes</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Users size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Deposito</Text>
                  <Text style={styles.infoValue}>{formatCurrency(rental.depositAmount)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Si esta en venta */}
        {(property.status === 'for_sale' || property.status === 'available') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado de Venta</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Calendar size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fecha de listado</Text>
                  <Text style={styles.infoValue}>{formatDate(property.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <AlertCircle size={20} color={colors.info} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Estado publicidad</Text>
                  <Text style={[styles.infoValue, { color: colors.info }]}>Activa</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Ganancias */}
        {earnings && earnings.totalEarnings > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ganancias</Text>
            
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

            {/* Historial de pagos */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Historial de pagos</Text>
              {earnings.paymentHistory.slice(0, 3).map((payment, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentMonth}>{payment.month}</Text>
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
        )}

        {/* Asesor asignado */}
        {agent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asesor Asignado</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nombre</Text>
                  <Text style={styles.infoValue}>{agent.name}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Phone size={20} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefono</Text>
                  <Text style={styles.infoValue}>{agent.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Documentos */}
        {rental && rental.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos</Text>
            
            <View style={styles.infoCard}>
              {rental.documents.map((doc, index) => (
                <View key={doc.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity style={styles.documentRow}>
                    <FileText size={20} color={colors.accent} />
                    <Text style={styles.documentName}>{doc.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
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
  propertyHeader: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyIconLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  locationText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  valueItem: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  valueAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  earningCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  earningAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  earningLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  paymentMonth: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  paymentAmount: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  documentName: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
})
