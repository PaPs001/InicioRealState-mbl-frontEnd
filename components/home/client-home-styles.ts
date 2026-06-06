import { borderRadius, spacing, typography, type AppTheme } from '@/lib/theme'

export function createClientHomeStyles(theme: AppTheme) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    greeting: {
      fontSize: typography.h2.fontSize,
      fontWeight: '700' as const,
      color: theme.text,
    },
    subGreeting: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: theme.surface,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: '600' as const,
      color: theme.text,
      marginBottom: spacing.md,
    },
    quickAccessCard: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border,
    },
    quickAccessIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: `${theme.primary}15`,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    quickAccessTitle: {
      fontSize: typography.body.fontSize,
      fontWeight: '600' as const,
      color: theme.text,
    },
    quickAccessSubtitle: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
      marginTop: 2,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statLabel: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
    },
    statValue: {
      fontSize: typography.h3.fontSize,
      fontWeight: '700' as const,
      color: theme.text,
      marginTop: spacing.xs,
    },
    statDescription: {
      fontSize: typography.caption.fontSize,
      color: theme.textMuted,
      marginTop: 2,
    },
  }
}
