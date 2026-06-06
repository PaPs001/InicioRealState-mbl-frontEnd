import { Text, View } from 'react-native'

import { BarChart3, TrendingUp } from 'lucide-react-native'

import type { AppTheme } from '@/lib/theme'
import { colors } from '@/lib/theme'
import { formatCurrency } from '@/lib/utils'

import { styles } from './styles'

type PropertyAnalysis = {
  annualRoiLabel: string
  commission: number
  currentValue: number
  isr: number
  monthlyRentEstimate: number
  notary: number
  totalCosts: number
  value1Year: number
  value3Years: number
  value5Years: number
  yearlyGrowthLabel: string
}

type PropertyAnalysisTabProps = {
  analysis: PropertyAnalysis
  theme: AppTheme
}

export function PropertyAnalysisTab({ analysis, theme }: PropertyAnalysisTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Valor Actual</Text>
        <View style={[styles.valueCard, { backgroundColor: `${theme.accent}15`, borderColor: theme.accent }]}>
          <TrendingUp size={32} color={theme.accent} />
          <Text style={[styles.currentValueLabel, { color: theme.textSecondary }]}>Valor estimado de mercado</Text>
          <Text style={[styles.currentValue, { color: theme.accent }]}>{formatCurrency(analysis.currentValue)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Proyección de Plusvalía</Text>
        <Text style={[styles.projectionNote, { color: theme.textMuted }]}>
          Basado en un crecimiento anual estimado del {analysis.yearlyGrowthLabel}
        </Text>

        <View style={styles.projectionsGrid}>
          <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.projectionYear, { color: theme.textMuted }]}>1 año</Text>
            <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(analysis.value1Year)}</Text>
            <Text style={[styles.projectionGrowth, { color: colors.success }]}>
              +{formatCurrency(analysis.value1Year - analysis.currentValue)}
            </Text>
          </View>
          <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.projectionYear, { color: theme.textMuted }]}>3 años</Text>
            <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(analysis.value3Years)}</Text>
            <Text style={[styles.projectionGrowth, { color: colors.success }]}>
              +{formatCurrency(analysis.value3Years - analysis.currentValue)}
            </Text>
          </View>
          <View style={[styles.projectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.projectionYear, { color: theme.textMuted }]}>5 años</Text>
            <Text style={[styles.projectionValue, { color: theme.text }]}>{formatCurrency(analysis.value5Years)}</Text>
            <Text style={[styles.projectionGrowth, { color: colors.success }]}>
              +{formatCurrency(analysis.value5Years - analysis.currentValue)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Costos Estimados de Compra</Text>
        <View style={[styles.costsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Comision inmobiliaria (5%)</Text>
            <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(analysis.commission)}</Text>
          </View>
          <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Gastos notariales (3%)</Text>
            <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(analysis.notary)}</Text>
          </View>
          <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>ISR estimado (15%)</Text>
            <Text style={[styles.costValue, { color: theme.text }]}>{formatCurrency(analysis.isr)}</Text>
          </View>
          <View style={[styles.costDivider, { backgroundColor: theme.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.costTotalLabel, { color: theme.text }]}>Total costos estimados</Text>
            <Text style={[styles.costTotalValue, { color: theme.accent }]}>{formatCurrency(analysis.totalCosts)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Potencial de Renta</Text>
        <View style={[styles.roiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <BarChart3 size={24} color={theme.accent} />
          <View style={styles.roiInfo}>
            <Text style={[styles.roiLabel, { color: theme.textMuted }]}>Renta mensual estimada</Text>
            <Text style={[styles.roiValue, { color: theme.text }]}>{formatCurrency(analysis.monthlyRentEstimate)}</Text>
          </View>
          <View style={styles.roiInfo}>
            <Text style={[styles.roiLabel, { color: theme.textMuted }]}>ROI anual estimado</Text>
            <Text style={[styles.roiValue, { color: colors.success }]}>{analysis.annualRoiLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
