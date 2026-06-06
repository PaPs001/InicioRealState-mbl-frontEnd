import type { ReactNode } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'

import { createHeaderStyles } from '@/lib/style-helpers'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

type AppHeaderProps = {
  title: string
  subtitle?: string
  onBack?: () => void
  rightSlot?: ReactNode
}

export function AppHeader({ onBack, rightSlot, subtitle, title }: AppHeaderProps) {
  const { theme } = useAppTheme()
  const styles = createHeaderStyles(theme)

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={20} color={theme.text} />
      </TouchableOpacity>

      <View style={localStyles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={localStyles.side}>
        {rightSlot}
      </View>
    </View>
  )
}

const localStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default AppHeader
