import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'

import { createCardStyles } from '@/lib/style-helpers'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { spacing, typography } from '@/lib/theme'

type SectionCardProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  style?: StyleProp<ViewStyle>
}

export function SectionCard({ children, style, subtitle, title }: SectionCardProps) {
  const { theme } = useAppTheme()
  const styles = createCardStyles(theme)

  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={localStyles.header}>
          <Text style={[localStyles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[localStyles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  )
}

const localStyles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
  },
})

export default SectionCard
