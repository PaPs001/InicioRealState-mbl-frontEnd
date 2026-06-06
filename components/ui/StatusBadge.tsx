import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { borderRadius, spacing, typography } from '@/lib/theme'

type StatusTone = 'neutral' | 'success' | 'warning' | 'error' | 'accent'

type StatusBadgeProps = {
  label: string
  tone?: StatusTone
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const { theme } = useAppTheme()

  const toneColor =
    tone === 'success' ? theme.success :
      tone === 'warning' ? theme.warning :
        tone === 'error' ? theme.error :
          tone === 'accent' ? theme.accent :
            theme.textMuted

  return (
    <View style={[styles.badge, { backgroundColor: `${toneColor}22`, borderColor: `${toneColor}55` }]}>
      <Text style={[styles.text, { color: toneColor }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
})

export default StatusBadge
