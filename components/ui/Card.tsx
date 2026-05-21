import React from 'react'
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'
import { colors, spacing, borderRadius, shadows } from '@/lib/theme'

export interface CardProps {
  children: React.ReactNode
  /** Variante visual */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  /** Padding interno */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Si la card es presionable */
  pressable?: boolean
  /** Callback al presionar (solo si pressable es true) */
  onPress?: () => void
  /** Estilo adicional */
  style?: ViewStyle
  /** Colores personalizados del tema */
  theme?: {
    surface?: string
    border?: string
    background?: string
  }
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  pressable = false,
  onPress,
  style,
  theme: customTheme,
}: CardProps) {
  const theme = {
    surface: customTheme?.surface || colors.surface,
    border: customTheme?.border || colors.border,
    background: customTheme?.background || colors.background,
  }

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surface,
          ...shadows.md,
        }
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.border,
        }
      case 'filled':
        return {
          backgroundColor: theme.background,
        }
      default:
        return {
          backgroundColor: theme.surface,
        }
    }
  }

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 }
      case 'sm':
        return { padding: spacing.sm }
      case 'lg':
        return { padding: spacing.lg }
      default:
        return { padding: spacing.md }
    }
  }

  const cardStyles = [
    styles.base,
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ]

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  )
}

// Subcomponentes para estructura semantica
export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  )
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  )
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    marginBottom: spacing.sm,
  },
  content: {
    // El contenido principal
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
})

export default Card
