import { useMemo } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CalendarDays, FileText, Plus, UserRound } from 'lucide-react-native'

import { AppHeader, AppScreen, SectionCard, StatusBadge } from '@/components/ui'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { getRentalContracts, type RentalContractCard } from '@/lib/services/documents-domain'
import { borderRadius, spacing, typography } from '@/lib/theme'
import { formatDate } from '@/lib/utils'

export default function DocumentsScreen() {
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

  const contracts = useMemo<RentalContractCard[]>(() => {
    return getRentalContracts()
  }, [])

  const handleContractPress = (contract: RentalContractCard) => {
    Alert.alert(contract.propertyTitle, 'Selecciona una opcion para este contrato.', [
      {
        text: 'Editar contrato',
        onPress: () => Alert.alert('Editar contrato', `Proximamente podras editar el contrato de ${contract.tenantName}.`),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ])
  }

  const handleAddContract = () => {
    Alert.alert('Agregar contrato', 'Proximamente podras registrar un nuevo contrato de renta.')
  }

  return (
    <AppScreen>
      <AppHeader title="Contratos de Rentas" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <FileText size={24} color={theme.accent} />
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Contratos establecidos</Text>
              <Text style={styles.heroValue}>{contracts.length}</Text>
              <Text style={styles.heroText}>Consulta vigencias y participantes de cada renta.</Text>
            </View>
          </View>
        </SectionCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Listado de contratos</Text>
          <Text style={styles.sectionSubtitle}>{contracts.length} contratos visibles</Text>
        </View>

        {contracts.map(contract => (
          <TouchableOpacity
            key={contract.id}
            style={styles.contractCard}
            activeOpacity={0.9}
            onPress={() => handleContractPress(contract)}
          >
            <View style={styles.contractCardHeader}>
              <Text style={styles.contractProperty}>{contract.propertyTitle}</Text>
              <StatusBadge label={contract.statusLabel} tone="accent" />
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <UserRound size={16} color={theme.accent} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Inquilino</Text>
                <Text style={styles.detailValue}>{contract.tenantName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <UserRound size={16} color={theme.accent} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Propietario</Text>
                <Text style={styles.detailValue}>{contract.ownerName}</Text>
              </View>
            </View>

            <View style={styles.datesRow}>
              <View style={styles.dateCard}>
                <CalendarDays size={16} color={theme.accent} />
                <Text style={styles.dateLabel}>Inicio</Text>
                <Text style={styles.dateValue}>{formatDate(contract.startDate)}</Text>
              </View>
              <View style={styles.dateCard}>
                <CalendarDays size={16} color={theme.accent} />
                <Text style={styles.dateLabel}>Finalizacion</Text>
                <Text style={styles.dateValue}>{formatDate(contract.endDate)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={handleAddContract}>
        <Plus size={28} color={theme.background} />
      </TouchableOpacity>
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    marginTop: 2,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  heroText: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: theme.textMuted,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: theme.textMuted,
  },
  contractCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing.md,
  },
  contractCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  contractProperty: {
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    marginRight: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.body.fontSize,
    color: theme.text,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dateCard: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateLabel: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
  },
  dateValue: {
    marginTop: 2,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
})
