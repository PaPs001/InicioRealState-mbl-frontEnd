import { clientThemes } from '@/lib/theme'

export const advisorTheme = {
  ...clientThemes.advisor,
  surface: clientThemes.advisor.surface,
  surfaceLight: clientThemes.advisor.surfaceLight || clientThemes.advisor.surface,
  success: clientThemes.advisor.success || '#10b981',
  error: clientThemes.advisor.error || '#ef4444',
} as const
