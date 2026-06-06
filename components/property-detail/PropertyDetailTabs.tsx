import { Text, TouchableOpacity, View } from 'react-native'

import { Calendar, Info, TrendingUp } from 'lucide-react-native'

import type { PropertyDetailTab } from '@/lib/hooks/use-public-property-detail'
import type { AppTheme } from '@/lib/theme'

import { styles } from './styles'

type PropertyDetailTabsProps = {
  activeTab: PropertyDetailTab
  isForSale: boolean
  isStaffUser: boolean
  setActiveTab: (tab: PropertyDetailTab) => void
  theme: AppTheme
}

export function PropertyDetailTabs({
  activeTab,
  isForSale,
  isStaffUser,
  setActiveTab,
  theme,
}: PropertyDetailTabsProps) {
  return (
    <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'info' && { borderBottomColor: theme.accent }]}
        onPress={() => setActiveTab('info')}
      >
        <Info size={22} color={activeTab === 'info' ? theme.accent : theme.textMuted} />
        <Text style={[styles.tabText, { color: activeTab === 'info' ? theme.accent : theme.textMuted }]}>
          Informacion
        </Text>
      </TouchableOpacity>

      {isForSale ? (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && { borderBottomColor: theme.accent }]}
          onPress={() => setActiveTab('analysis')}
        >
          <TrendingUp size={18} color={activeTab === 'analysis' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'analysis' ? theme.accent : theme.textMuted }]}>
            Plusvalía
          </Text>
        </TouchableOpacity>
      ) : null}

      {!isStaffUser ? (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calendar' && { borderBottomColor: theme.accent }]}
          onPress={() => setActiveTab('calendar')}
        >
          <Calendar size={18} color={activeTab === 'calendar' ? theme.accent : theme.textMuted} />
          <Text style={[styles.tabText, { color: activeTab === 'calendar' ? theme.accent : theme.textMuted }]}>
            Agendar
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}
