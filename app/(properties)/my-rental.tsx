import { useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { mockActiveRental, mockUsers, mockProperties, formatCurrency, formatDate } from '@/lib/mock-data'
import { 
  ArrowLeft,
  Home,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  Zap,
  Droplets,
  Flame,
  Wifi,
  AlertCircle,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react-native'

export default function MyRentalScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()

  const rental = useMemo(() => {
    if (!currentUser) return null
    if (mockActiveRental.tenantId === currentUser.id) {
      return mockActiveRental
    }
    return null
  }, [currentUser])

  const property = useMemo(() => {
    if (!rental) return null
    return mockProperties.find(p => p.id === rental.propertyId)
  }, [rental])

  const landlord = useMemo(() => {
    if (!rental) return null
    return mockUsers.find(u => u.id === rental.landlordId)
  }, [rental])

  const agent = useMemo(() => {
    if (!rental) return null
    return mockUsers.find(u => u.id === rental.agentId)
  }, [rental])

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const daysUntilPayment = useMemo(() => {
    if (!rental) return 0
    const today = new Date()
    const paymentDate = new Date(today.getFullYear(), today.getMonth(), rental.paymentDay)
    if (paymentDate < today) {
      paymentDate.setMonth(paymentDate.getMonth() + 1)
    }
    const diffTime = paymentDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [rental])

  if (!rental || !property) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Renta</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Home size={48} color={colors.textMuted} />
          <Text style={styles.emptyStateTitle}>Sin renta activa</Text>
          <Text style={styles.emptyStateText}>
            No tienes una renta activa en este momento
          </Text>
        </View>
      </SafeAreaView>
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
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Renta</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Card */}
        <View style={styles.propertyCard}>
          <View style={styles.propertyIcon}>
            <Home size={32} color={colors.accent} />
          </View>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>{property.address}, {property.city}</Text>
          </View>
          
          <View style={styles.rentInfo}>
            <View style={styles.rentItem}>
              <Text style={styles.rentLabel}>Renta mensual</Text>
              <Text style={styles.rentAmount}>{formatCurrency(rental.monthlyRent)}</Text>
            </View>
            <View style={styles.rentDivider} />
            <View style={styles.rentItem}>
              <Text style={styles.rentLabel}>Proximo pago</Text>
              <Text style={styles.rentDays}>{daysUntilPayment} dias</Text>
            </View>
          </View>
        </View>

        {/* Contract Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informacion del Contrato</Text>
          
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
              <Shield size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Deposito</Text>
                <Text style={styles.infoValue}>{formatCurrency(rental.depositAmount)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Landlord Info */}
        {landlord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arrendador</Text>
            
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactAvatar}>
                  <User size={24} color={colors.accent} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{landlord.name}</Text>
                  <Text style={styles.contactRole}>Propietario</Text>
                </View>
              </View>

              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleCall(landlord.phone)}
                >
                  <Phone size={20} color={colors.accent} />
                  <Text style={styles.contactButtonText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => router.push('/messages')}
                >
                  <Mail size={20} color={colors.accent} />
                  <Text style={styles.contactButtonText}>Mensaje</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Agent Info */}
        {agent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asesor Encargado</Text>
            
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactAvatar}>
                  <User size={24} color={colors.info} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{agent.name}</Text>
                  <Text style={styles.contactRole}>Asesor Inicio Real Estate</Text>
                </View>
              </View>

              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleCall(agent.phone)}
                >
                  <Phone size={20} color={colors.accent} />
                  <Text style={styles.contactButtonText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => router.push('/messages')}
                >
                  <Mail size={20} color={colors.accent} />
                  <Text style={styles.contactButtonText}>Mensaje</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Utilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>
          
          <View style={styles.infoCard}>
            <TouchableOpacity 
              style={styles.utilityRow}
              onPress={() => handleCall(rental.utilities.electricity.phone)}
            >
              <View style={[styles.utilityIcon, { backgroundColor: colors.warning + '20' }]}>
                <Zap size={20} color={colors.warning} />
              </View>
              <View style={styles.utilityContent}>
                <Text style={styles.utilityName}>Electricidad</Text>
                <Text style={styles.utilityProvider}>{rental.utilities.electricity.provider}</Text>
                {rental.utilities.electricity.accountNumber && (
                  <Text style={styles.utilityAccount}>
                    Cuenta: {rental.utilities.electricity.accountNumber}
                  </Text>
                )}
              </View>
              <ExternalLink size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.utilityRow}
              onPress={() => handleCall(rental.utilities.water.phone)}
            >
              <View style={[styles.utilityIcon, { backgroundColor: colors.info + '20' }]}>
                <Droplets size={20} color={colors.info} />
              </View>
              <View style={styles.utilityContent}>
                <Text style={styles.utilityName}>Agua</Text>
                <Text style={styles.utilityProvider}>{rental.utilities.water.provider}</Text>
                {rental.utilities.water.accountNumber && (
                  <Text style={styles.utilityAccount}>
                    Cuenta: {rental.utilities.water.accountNumber}
                  </Text>
                )}
              </View>
              <ExternalLink size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.utilityRow}
              onPress={() => handleCall(rental.utilities.gas.phone)}
            >
              <View style={[styles.utilityIcon, { backgroundColor: colors.error + '20' }]}>
                <Flame size={20} color={colors.error} />
              </View>
              <View style={styles.utilityContent}>
                <Text style={styles.utilityName}>Gas</Text>
                <Text style={styles.utilityProvider}>{rental.utilities.gas.provider}</Text>
                {rental.utilities.gas.accountNumber && (
                  <Text style={styles.utilityAccount}>
                    Cuenta: {rental.utilities.gas.accountNumber}
                  </Text>
                )}
              </View>
              <ExternalLink size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {rental.utilities.internet && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.utilityRow}
                  onPress={() => handleCall(rental.utilities.internet!.phone)}
                >
                  <View style={[styles.utilityIcon, { backgroundColor: colors.success + '20' }]}>
                    <Wifi size={20} color={colors.success} />
                  </View>
                  <View style={styles.utilityContent}>
                    <Text style={styles.utilityName}>Internet</Text>
                    <Text style={styles.utilityProvider}>{rental.utilities.internet.provider}</Text>
                    {rental.utilities.internet.accountNumber && (
                      <Text style={styles.utilityAccount}>
                        Cuenta: {rental.utilities.internet.accountNumber}
                      </Text>
                    )}
                  </View>
                  <ExternalLink size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglas del Inmueble</Text>
          
          <View style={styles.rulesCard}>
            {rental.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <AlertCircle size={16} color={colors.accent} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Documents */}
        {rental.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos</Text>
            
            <View style={styles.infoCard}>
              {rental.documents.map((doc, index) => (
                <View key={doc.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity style={styles.documentRow}>
                    <FileText size={20} color={colors.accent} />
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <ExternalLink size={16} color={colors.textMuted} />
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
    paddingVertical: spacing.xxl,
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
  propertyCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  propertyIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textLight,
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
    color: colors.textLight + '80',
  },
  rentInfo: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
  },
  rentItem: {
    flex: 1,
    alignItems: 'center',
  },
  rentDivider: {
    width: 1,
    backgroundColor: colors.borderDark,
  },
  rentLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textLight + '80',
  },
  rentAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 2,
  },
  rentDays: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.success,
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
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  contactRole: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  contactButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilityContent: {
    flex: 1,
  },
  utilityName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
  },
  utilityProvider: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  utilityAccount: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  ruleText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
    lineHeight: 22,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  documentName: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
})
