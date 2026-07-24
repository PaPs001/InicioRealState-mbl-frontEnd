export const colors = {
  primary: '#1e2d32',
  secondary: '#31454d',
  primaryDark: '#0c1427',
  accent: '#cbb375',
  
  background: '#f5f1ec',
  surface: '#ffffff',
  surfaceDark: '#1f2b38',
  
  border: '#e5e0d8',
  borderDark: '#3a4857',
  
  text: '#1e2d32',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textLight: '#e5e5e5',
  textInverse: '#f5f1ec',
  
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#6366f1',
  
  dark: {
    background: '#0c1427',
    surface: '#1f2b38',
    border: '#3a4857',
    text: '#e5e5e5',
    textSecondary: '#9ca3af',
  },
  
  light: {
    background: '#f5f1ec',
    surface: '#ffffff',
    border: '#e5e0d8',
    text: '#1e2d32',
    textSecondary: '#6b7280',
  }
}

export type ClientTheme = {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  border: string
  text: string
  textSecondary: string
  textMuted: string
  textLight: string
  surfaceLight?: string
  accentLight?: string
  accentGold?: string
  green?: string
  warm?: string
  warmLight?: string
  success?: string
  warning?: string
  error?: string
}

export type AppThemeMode = 'searching' | 'investor' | 'tenant' | 'advisor' | 'default'

export type AppTheme = ClientTheme & {
  mode: AppThemeMode
  isDark: boolean
  success: string
  warning: string
  error: string
}

export const clientThemes: Record<'searching' | 'investor' | 'tenant' | 'advisor', ClientTheme> = {
  searching: {
    primary: '#083b52',
    secondary: '#0c74af',
    accent: '#0c74af',
    background: '#f5f1ec',
    surface: '#ffffff',
    border: '#e5e0d8',
    text: '#202c38',
    textSecondary: '#5a6673',
    textMuted: '#8a949e',
    textLight: '#f5f1ec',
    warmLight: '#f0e6d9',
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  
  investor: {
    primary: '#0a1628',
    secondary: '#152238',
    accent: '#cbb375',
    background: '#050d18',
    surface: '#0a1628',
    surfaceLight: '#152238',
    border: '#1a2d4a',
    text: '#f5f1ec',
    textSecondary: '#a8b4c8',
    textMuted: '#5a6a82',
    textLight: '#f5f1ec',
    accentLight: '#e5d4a8',
    warmLight: '#1a2438',
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  
  tenant: {
    primary: '#3d5a40',
    secondary: '#4a6d4d',
    accent: '#907a63',
    accentGold: '#cbb375',
    background: '#1f2b38',
    surface: '#2a3847',
    surfaceLight: '#354555',
    border: '#3d5a40',
    text: '#f5f1ec',
    textSecondary: '#c4bdb4',
    textMuted: '#8a9a8c',
    textLight: '#f5f1ec',
    green: '#3d5a40',
    warm: '#907a63',
    warmLight: '#4f6750',
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  
  advisor: {
    primary: '#0c1427',
    secondary: '#1f2b38',
    accent: '#cbb375',
    background: '#0c1427',
    surface: '#1f2b38',
    surfaceLight: '#2a3847',
    border: '#3a4857',
    text: '#e5e5e5',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    textLight: '#e5e5e5',
    warmLight: '#28384a',
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
}

export type ClientRole = 'searching' | 'investor' | 'tenant'

export function getClientTheme(role: ClientRole) {
  return clientThemes[role] || clientThemes.searching
}

function ensureAppTheme(mode: AppThemeMode, theme: ClientTheme, isDark: boolean): AppTheme {
  return {
    ...theme,
    mode,
    isDark,
    success: theme.success || colors.success,
    warning: theme.warning || colors.warning,
    error: theme.error || colors.error,
  }
}

export function getAppThemeByRole(params: {
  isInvestor?: boolean
  isTenant?: boolean
  isSearching?: boolean
  isAdvisor?: boolean
}): AppTheme {
  const { isAdvisor, isInvestor, isSearching, isTenant } = params

  if (isInvestor) {
    return ensureAppTheme('investor', clientThemes.investor, true)
  }

  if (isTenant) {
    return ensureAppTheme('tenant', clientThemes.tenant, true)
  }

  if (isAdvisor) {
    return ensureAppTheme('advisor', clientThemes.advisor, true)
  }

  if (isSearching) {
    return ensureAppTheme('searching', clientThemes.searching, false)
  }

  return ensureAppTheme('default', clientThemes.searching, false)
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
}
