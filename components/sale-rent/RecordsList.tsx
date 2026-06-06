import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'

import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import type { SaleRentRegistration } from '@/lib/types'
import { borderRadius, spacing, typography } from '@/lib/theme'
import {
  formatRecordAmount,
  formatRecordDate,
  getRecordAgentName,
  getRecordPropertyTitle,
  getRecordStatusLabel,
} from './records-helpers'
import { advisorTheme } from './theme'

type RecordsListProps = {
  agentCatalogRawData: PropertyCatalogItemResponse[]
  isAdmin: boolean
  onCreateNew: () => void
  onOpenRecord: (recordId: string) => void
  registrations: SaleRentRegistration[]
}

export function RecordsList({
  agentCatalogRawData,
  isAdmin,
  onCreateNew,
  onOpenRecord,
  registrations,
}: RecordsListProps) {
  const handleAdminRecordPress = (record: SaleRentRegistration) => {
    Alert.alert(getRecordPropertyTitle(record, agentCatalogRawData), 'Selecciona una opcion para este registro.', [
      {
        text: 'Ver mas informacion',
        onPress: () => onOpenRecord(record.id),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ])
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.recordsHero}>
        <Text style={styles.recordsHeroLabel}>Registros activos</Text>
        <Text style={styles.recordsHeroValue}>{registrations.length}</Text>
        <Text style={styles.recordsHeroText}>
          {isAdmin ? 'Revisa operaciones de todo el equipo y abre el detalle completo.' : 'Consulta tus ventas y rentas registradas.'}
        </Text>
      </View>

      <View style={styles.recordsSectionHeader}>
        <Text style={styles.recordsSectionTitle}>Ultimos registros</Text>
        {!isAdmin && (
          <TouchableOpacity style={styles.recordsCta} onPress={onCreateNew}>
            <Text style={styles.recordsCtaText}>Nuevo registro</Text>
          </TouchableOpacity>
        )}
      </View>

      {registrations.map(record => {
        const agentName = getRecordAgentName(record.agentId)
        const statusColor =
          record.status === 'approved' ? advisorTheme.success : record.status === 'rejected' ? advisorTheme.error : advisorTheme.accent

        if (isAdmin) {
          return (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              activeOpacity={0.9}
              onPress={() => handleAdminRecordPress(record)}
            >
              <View style={styles.recordCardHeader}>
                <View style={[styles.recordTypeBadge, { backgroundColor: record.type === 'sale' ? advisorTheme.success : '#3b82f6' }]}>
                  <Text style={styles.recordTypeBadgeText}>{record.type === 'sale' ? 'VENTA' : 'RENTA'}</Text>
                </View>
                <View style={[styles.recordStatusBadge, { backgroundColor: `${statusColor}22` }]}>
                  <Text style={[styles.recordStatusText, { color: statusColor }]}>
                    {getRecordStatusLabel(record.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.recordTitle}>{getRecordPropertyTitle(record, agentCatalogRawData)}</Text>

              <View style={styles.adminRecordDetailBlock}>
                <Text style={styles.recordMetricLabel}>Asesor</Text>
                <Text style={styles.adminRecordValue}>{agentName}</Text>
              </View>

              <View style={styles.adminRecordDetailBlock}>
                <Text style={styles.recordMetricLabel}>Usuario</Text>
                <Text style={styles.adminRecordValue}>{record.clientName}</Text>
              </View>

              <View style={styles.recordCardFooter}>
                <Text style={styles.recordFooterText}>Ver mas informacion</Text>
                <ChevronRight size={18} color={advisorTheme.accent} />
              </View>
            </TouchableOpacity>
          )
        }

        return (
          <TouchableOpacity
            key={record.id}
            style={styles.recordCard}
            onPress={() => onOpenRecord(record.id)}
          >
            <View style={styles.recordCardHeader}>
              <View style={[styles.recordTypeBadge, { backgroundColor: record.type === 'sale' ? advisorTheme.success : '#3b82f6' }]}>
                <Text style={styles.recordTypeBadgeText}>{record.type === 'sale' ? 'VENTA' : 'RENTA'}</Text>
              </View>
              <View style={[styles.recordStatusBadge, { backgroundColor: `${statusColor}22` }]}>
                <Text style={[styles.recordStatusText, { color: statusColor }]}>
                  {record.status === 'approved' ? 'Aprobado' : record.status === 'rejected' ? 'Rechazado' : 'En revision'}
                </Text>
              </View>
            </View>

            <Text style={styles.recordTitle}>{getRecordPropertyTitle(record, agentCatalogRawData)}</Text>
            <Text style={styles.recordSubtitle}>
              {agentName} · {record.clientName}
            </Text>

            <View style={styles.recordMetrics}>
              <View style={styles.recordMetric}>
                <Text style={styles.recordMetricLabel}>Monto</Text>
                <Text style={styles.recordMetricValue}>{formatRecordAmount(record.transactionAmount)}</Text>
              </View>
              <View style={styles.recordMetric}>
                <Text style={styles.recordMetricLabel}>Comision</Text>
                <Text style={styles.recordMetricValue}>{formatRecordAmount(record.commissionAmount)}</Text>
              </View>
              <View style={styles.recordMetric}>
                <Text style={styles.recordMetricLabel}>Fecha</Text>
                <Text style={styles.recordMetricValue}>{formatRecordDate(record.createdDate)}</Text>
              </View>
            </View>

            <View style={styles.recordCardFooter}>
              <Text style={styles.recordFooterText}>{record.pendingDocuments.length} documentos pendientes</Text>
              <ChevronRight size={18} color={advisorTheme.accent} />
            </View>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  recordsHero: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  recordsHeroLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  recordsHeroValue: {
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginTop: spacing.xs,
  },
  recordsHeroText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textSecondary,
    marginTop: spacing.xs,
  },
  recordsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  recordsSectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
  },
  recordsCta: {
    backgroundColor: advisorTheme.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recordsCtaText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: advisorTheme.background,
  },
  recordCard: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  recordTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  recordTypeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: '#ffffff',
  },
  recordStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recordStatusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  recordTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
  },
  recordSubtitle: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textSecondary,
    marginTop: spacing.xs,
  },
  recordMetrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  recordMetric: {
    flex: 1,
    backgroundColor: advisorTheme.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  recordMetricLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  recordMetricValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginTop: 4,
  },
  recordCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: advisorTheme.border,
  },
  recordFooterText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  adminRecordDetailBlock: {
    marginTop: spacing.md,
  },
  adminRecordValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
    marginTop: 2,
  },
})
