import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { createFormStyles } from '@/lib/style-helpers'
import { spacing } from '@/lib/theme'

type FormFieldProps = {
  children: ReactNode
  helperText?: string
  label?: string
}

export function FormField({ children, helperText, label }: FormFieldProps) {
  const { theme } = useAppTheme()
  const styles = createFormStyles(theme)

  return (
    <View style={localStyles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  )
}

const localStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
})

export default FormField
