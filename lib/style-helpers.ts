import { StyleSheet } from 'react-native'

import type { AppTheme } from '@/lib/theme'
import { borderRadius, shadows, spacing, typography } from '@/lib/theme'

export function createScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: spacing.lg,
    },
  })
}

export function createHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      fontSize: typography.h4.fontSize,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: typography.caption.fontSize,
      color: theme.textMuted,
      marginTop: 2,
    },
  })
}

export function createCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.md,
    },
    elevated: {
      ...shadows.md,
    },
  })
}

export function createFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      minHeight: 48,
      borderWidth: 1,
      borderColor: theme.border,
      gap: spacing.sm,
    },
    label: {
      fontSize: typography.caption.fontSize,
      color: theme.textMuted,
      marginBottom: 4,
    },
    textInput: {
      flex: 1,
      fontSize: typography.body.fontSize,
      color: theme.text,
    },
    helperText: {
      fontSize: typography.caption.fontSize,
      color: theme.textMuted,
      marginTop: spacing.xs,
    },
  })
}
