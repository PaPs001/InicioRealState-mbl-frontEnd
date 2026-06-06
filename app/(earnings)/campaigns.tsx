import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowLeft,
  Megaphone,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Home,
  TrendingUp,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Target,
} from 'lucide-react-native'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useCampaignsDomain } from '@/contexts/auth/use-campaigns-domain'
import type { Campaign } from '@/lib/types'

// Colores del inversionista
const theme = clientThemes.investor

export default function CampaignsScreen() {
  const router = useRouter()
  const {
    activeCampaigns,
    historyCampaigns,
    activeStats,
    historyStats,
    getProperty,
    getDaysRemaining,
    getProgressPercent,
    getResultText,
  } = useCampaignsDomain()
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle size={16} color={colors.success} />
      case 'paused':
        return <PauseCircle size={16} color={colors.warning} />
      case 'completed':
        return <CheckCircle size={16} color={colors.success} />
      case 'cancelled':
        return <XCircle size={16} color={colors.error} />
      default:
        return null
    }
  }

  // Obtener color de resultado
  const getResultColor = (result?: string) => {
    switch (result) {
      case 'rented':
      case 'sold':
        return colors.success
      case 'not_achieved':
        return colors.warning
      case 'cancelled':
        return colors.error
      default:
        return theme.textMuted
    }
  }

  const renderActiveCampaign = (campaign: Campaign) => {
    const property = getProperty(campaign.propertyId)
    const daysRemaining = getDaysRemaining(campaign.endDate)
    const progressPercent = getProgressPercent(campaign)

    return (
      <View key={campaign.id} style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignTitleRow}>
            <View style={styles.propertyIcon}>
              <Home size={18} color={theme.accent} />
            </View>
            <View style={styles.campaignTitleContent}>
              <Text style={styles.campaignTitle} numberOfLines={1}>
                {property?.title || 'Propiedad'}
              </Text>
              <Text style={styles.campaignLocation} numberOfLines={1}>
                {property?.city}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            {getStatusIcon(campaign.status)}
            <Text style={[styles.statusText, { 
              color: campaign.status === 'active' ? colors.success : colors.warning 
            }]}>
              {campaign.status === 'active' ? 'Activa' : 'Pausada'}
            </Text>
          </View>
        </View>

        <View style={styles.typeBadgeContainer}>
          <View style={[styles.typeBadge, { 
            backgroundColor: campaign.type === 'rent' ? theme.accent + '20' : colors.info + '20' 
          }]}>
            <Text style={[styles.typeBadgeText, { 
              color: campaign.type === 'rent' ? theme.accent : colors.info 
            }]}>
              {campaign.type === 'rent' ? 'Renta' : 'Venta'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={16} color={theme.accent} />
            <Text style={styles.statValue}>{campaign.leadsCount}</Text>
            <Text style={styles.statLabel}>Leads</Text>
          </View>
          <View style={styles.statItem}>
            <DollarSign size={16} color={theme.accent} />
            <Text style={styles.statValue}>{formatCurrency(campaign.spentBudget)}</Text>
            <Text style={styles.statLabel}>Gastado</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={16} color={theme.accent} />
            <Text style={styles.statValue}>{formatCurrency(campaign.remainingBudget)}</Text>
            <Text style={styles.statLabel}>Restante</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Presupuesto</Text>
            <Text style={styles.progressValue}>{Math.round(progressPercent)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Calendar size={14} color={theme.textMuted} />
            <Text style={styles.dateLabel}>Inicio:</Text>
            <Text style={styles.dateValue}>{formatDate(campaign.startDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={14} color={theme.textMuted} />
            <Text style={styles.dateLabel}>Fin:</Text>
            <Text style={styles.dateValue}>{formatDate(campaign.endDate)}</Text>
          </View>
        </View>

        <View style={styles.remainingDays}>
          <Text style={styles.remainingDaysText}>
            {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Finaliza hoy'}
          </Text>
        </View>

        <View style={styles.platformsRow}>
          <Text style={styles.platformsLabel}>Plataformas:</Text>
          <Text style={styles.platformsValue}>{campaign.platform.join(', ')}</Text>
        </View>
      </View>
    )
  }

  const renderHistoryCampaign = (campaign: Campaign) => {
    const property = getProperty(campaign.propertyId)

    return (
      <View key={campaign.id} style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignTitleRow}>
            <View style={styles.propertyIcon}>
              <Home size={18} color={theme.accent} />
            </View>
            <View style={styles.campaignTitleContent}>
              <Text style={styles.campaignTitle} numberOfLines={1}>
                {property?.title || 'Propiedad'}
              </Text>
              <Text style={styles.campaignLocation} numberOfLines={1}>
                {property?.city}
              </Text>
            </View>
          </View>
          <View style={[styles.resultBadge, { backgroundColor: getResultColor(campaign.result) + '20' }]}>
            <Text style={[styles.resultText, { color: getResultColor(campaign.result) }]}>
              {getResultText(campaign.result)}
            </Text>
          </View>
        </View>

        <View style={styles.typeBadgeContainer}>
          <View style={[styles.typeBadge, { 
            backgroundColor: campaign.type === 'rent' ? theme.accent + '20' : colors.info + '20' 
          }]}>
            <Text style={[styles.typeBadgeText, { 
              color: campaign.type === 'rent' ? theme.accent : colors.info 
            }]}>
              {campaign.type === 'rent' ? 'Renta' : 'Venta'}
            </Text>
          </View>
        </View>

        <View style={styles.historyStatsRow}>
          <View style={styles.historyStatItem}>
            <Text style={styles.historyStatLabel}>Costo Total</Text>
            <Text style={styles.historyStatValue}>{formatCurrency(campaign.spentBudget)}</Text>
          </View>
          <View style={styles.historyStatItem}>
            <Text style={styles.historyStatLabel}>Leads Totales</Text>
            <Text style={styles.historyStatValue}>{campaign.leadsCount}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.historyDatesRow}>
          <View style={styles.historyDateItem}>
            <Text style={styles.historyDateLabel}>Inicio</Text>
            <Text style={styles.historyDateValue}>{formatDate(campaign.startDate)}</Text>
          </View>
          <View style={styles.historyDateItem}>
            <Text style={styles.historyDateLabel}>Fin</Text>
            <Text style={styles.historyDateValue}>{formatDate(campaign.endDate)}</Text>
          </View>
          <View style={styles.historyDateItem}>
            <Text style={styles.historyDateLabel}>Duracion</Text>
            <Text style={styles.historyDateValue}>{campaign.durationDays} dias</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campanas</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Megaphone size={18} color={activeTab === 'active' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Activas ({activeCampaigns.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Clock size={18} color={activeTab === 'history' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Historial ({historyCampaigns.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          <>
            {/* Stats de campanas activas */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{activeStats.count}</Text>
                  <Text style={styles.summaryLabel}>Campanas</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{activeStats.totalLeads}</Text>
                  <Text style={styles.summaryLabel}>Leads totales</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCurrency(activeStats.totalSpent)}</Text>
                  <Text style={styles.summaryLabel}>Invertido</Text>
                </View>
              </View>
            </View>

            {/* Lista de campanas activas */}
            <View style={styles.campaignsList}>
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map(renderActiveCampaign)
              ) : (
                <View style={styles.emptyState}>
                  <Megaphone size={48} color={theme.textMuted} />
                  <Text style={styles.emptyStateTitle}>Sin campanas activas</Text>
                  <Text style={styles.emptyStateText}>
                    Inicia una campana publicitaria para promocionar tus propiedades
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Stats de historial */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{historyStats.count}</Text>
                  <Text style={styles.summaryLabel}>Campanas</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {historyStats.successful}
                  </Text>
                  <Text style={styles.summaryLabel}>Exitosas</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{historyStats.totalLeads}</Text>
                  <Text style={styles.summaryLabel}>Leads totales</Text>
                </View>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Inversion total historica</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(historyStats.totalSpent)}</Text>
              </View>
            </View>

            {/* Lista de historial */}
            <View style={styles.campaignsList}>
              {historyCampaigns.length > 0 ? (
                historyCampaigns.map(renderHistoryCampaign)
              ) : (
                <View style={styles.emptyState}>
                  <Clock size={48} color={theme.textMuted} />
                  <Text style={styles.emptyStateTitle}>Sin historial</Text>
                  <Text style={styles.emptyStateText}>
                    Aqui aparecera el historial de tus campanas finalizadas
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    borderBottomColor: theme.accent,
  },
  tabText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: theme.textMuted,
  },
  tabTextActive: {
    color: theme.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: theme.accent,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: spacing.md,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
  },
  summaryTotalValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  campaignsList: {
    gap: spacing.md,
  },
  campaignCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  campaignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignTitleContent: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  campaignLocation: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: theme.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  typeBadgeContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
  },
  progressValue: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: borderRadius.full,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: spacing.md,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
  },
  dateValue: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    color: theme.text,
  },
  remainingDays: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  remainingDaysText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.accent,
  },
  platformsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  platformsLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
  },
  platformsValue: {
    fontSize: typography.caption.fontSize,
    color: theme.textSecondary,
    flex: 1,
  },
  resultBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  resultText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  historyStatItem: {
    alignItems: 'center',
  },
  historyStatLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    marginBottom: spacing.xs,
  },
  historyStatValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  historyDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDateItem: {
    alignItems: 'center',
  },
  historyDateLabel: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    marginBottom: 2,
  },
  historyDateValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: theme.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
})
