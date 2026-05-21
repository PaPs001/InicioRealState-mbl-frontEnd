import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export interface ButtonProps extends TouchableOpacityProps {
  /** Texto del boton */
  children: string
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** Tamano del boton */
  size?: 'sm' | 'md' | 'lg'
  /** Si el boton esta cargando */
  loading?: boolean
  /** Si el boton ocupa todo el ancho */
  fullWidth?: boolean
  /** Colores personalizados del tema */
  theme?: {
    primary?: string
    accent?: string
    background?: string
    text?: string
    border?: string
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  theme: customTheme,
  ...props
}: ButtonProps) {
  const theme = {
    primary: customTheme?.primary || colors.primary,
    accent: customTheme?.accent || colors.accent,
    background: customTheme?.background || colors.background,
    text: customTheme?.text || colors.text,
    border: customTheme?.border || colors.border,
  }

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.primary,
          },
          text: {
            color: colors.textInverse,
          },
        }
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.accent,
          },
          text: {
            color: theme.primary,
          },
        }
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.border,
          },
          text: {
            color: theme.text,
          },
        }
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.primary,
          },
        }
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error,
          },
          text: {
            color: colors.textInverse,
          },
        }
      default:
        return {
          container: {},
          text: {},
        }
    }
  }

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
          },
          text: {
            fontSize: typography.bodySmall.fontSize,
          },
        }
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
          },
          text: {
            fontSize: typography.h4.fontSize,
          },
        }
      default: // md
        return {
          container: {
            paddingVertical: spacing.sm + 4,
            paddingHorizontal: spacing.lg,
          },
          text: {
            fontSize: typography.body.fontSize,
          },
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default Button
