import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { spacing, typography } from '@/lib/theme'

type InfoRowProps = {
  label: string
  value: string
}

export function InfoRow({ label, value }: InfoRowProps) {
  const { theme } = useAppTheme()

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.caption.fontSize,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})

export default InfoRow
