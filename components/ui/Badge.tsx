import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export interface BadgeProps {
  /** Texto del badge */
  children: string
  /** Variante de color */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** Tamano del badge */
  size?: 'sm' | 'md'
  /** Estilo adicional */
  style?: ViewStyle
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          container: { backgroundColor: colors.success + '20' },
          text: { color: colors.success },
        }
      case 'warning':
        return {
          container: { backgroundColor: colors.warning + '20' },
          text: { color: colors.warning },
        }
      case 'error':
        return {
          container: { backgroundColor: colors.error + '20' },
          text: { color: colors.error },
        }
      case 'info':
        return {
          container: { backgroundColor: colors.info + '20' },
          text: { color: colors.info },
        }
      default:
        return {
          container: { backgroundColor: colors.border },
          text: { color: colors.text },
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.xs / 2,
            paddingHorizontal: spacing.sm,
          },
          text: { fontSize: typography.caption.fontSize },
        }
      default:
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm + 4,
          },
          text: { fontSize: typography.bodySmall.fontSize },
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <View
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
    >
      <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
})

export default Badge
