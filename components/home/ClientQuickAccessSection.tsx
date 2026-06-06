import { Text, TouchableOpacity, View } from 'react-native'
import { ChevronRight, type LucideIcon } from 'lucide-react-native'

export interface QuickAccessItem {
  icon: LucideIcon
  title: string
  subtitle: string
  onPress: () => void
}

interface ClientQuickAccessSectionProps {
  title: string
  items: QuickAccessItem[]
  styles: any
  dynamicStyles: any
  theme: any
}

export function ClientQuickAccessSection({
  title,
  items,
  styles,
  dynamicStyles,
  theme,
}: ClientQuickAccessSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={dynamicStyles.sectionTitle}>{title}</Text>

      {items.map((item) => {
        const Icon = item.icon

        return (
          <TouchableOpacity key={item.title} style={dynamicStyles.quickAccessCard} onPress={item.onPress}>
            <View style={dynamicStyles.quickAccessIcon}>
              <Icon size={24} color={theme.accent} />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={dynamicStyles.quickAccessTitle}>{item.title}</Text>
              <Text style={dynamicStyles.quickAccessSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
