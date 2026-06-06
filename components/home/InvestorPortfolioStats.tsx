import { Text, View } from 'react-native'
import { Building2, DollarSign, TrendingUp } from 'lucide-react-native'

import { colors } from '@/lib/theme'

type InvestorPortfolioStatsProps = {
  dynamicStyles: any
  formatCurrency: (value: number) => string
  projectedValue: number
  styles: any
  theme: {
    accent: string
    primary: string
  }
  totalGains: number
  totalValue: number
  userPropertiesCount: number
}

export function InvestorPortfolioStats({
  dynamicStyles,
  formatCurrency,
  projectedValue,
  styles,
  theme,
  totalGains,
  totalValue,
  userPropertiesCount,
}: InvestorPortfolioStatsProps) {
  return (
    <View style={styles.statsGridInvestor}>
      <View style={styles.statsRow}>
        <View style={[dynamicStyles.statCard, styles.statCardHalf]}>
          <View style={styles.statHeader}>
            <Text style={dynamicStyles.statLabel}>Propiedades</Text>
            <Building2 size={20} color={theme.accent} />
          </View>
          <Text style={dynamicStyles.statValue}>{userPropertiesCount}</Text>
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
          <Text style={dynamicStyles.statDescription}>Plusvalía</Text>
        </View>

        <View style={[dynamicStyles.statCard, styles.statCardHalf, { backgroundColor: theme.accent }]}>
          <View style={styles.statHeader}>
            <Text style={[dynamicStyles.statLabel, { color: theme.primary }]}>Proyeccion</Text>
            <TrendingUp size={20} color={theme.primary} />
          </View>
          <Text style={[dynamicStyles.statValue, { color: theme.primary }]}>
            {formatCurrency(projectedValue)}
          </Text>
          <Text style={[dynamicStyles.statDescription, { color: theme.primary + 'cc' }]}>Est. 1 año</Text>
        </View>
      </View>
    </View>
  )
}
