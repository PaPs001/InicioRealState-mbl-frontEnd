import React, { useState } from 'react'
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export interface InputProps extends RNTextInputProps {
  /** Etiqueta del input */
  label?: string
  /** Mensaje de error */
  error?: string
  /** Texto de ayuda */
  helperText?: string
  /** Si el input es de contrasena (muestra toggle para ver/ocultar) */
  isPassword?: boolean
  /** Icono izquierdo */
  leftIcon?: React.ReactNode
  /** Icono derecho */
  rightIcon?: React.ReactNode
  /** Estilo del contenedor */
  containerStyle?: ViewStyle
  /** Colores personalizados del tema */
  theme?: {
    background?: string
    surface?: string
    border?: string
    text?: string
    textMuted?: string
    accent?: string
    error?: string
  }
}

export function Input({
  label,
  error,
  helperText,
  isPassword = false,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  theme: customTheme,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const theme = {
    background: customTheme?.background || colors.background,
    surface: customTheme?.surface || colors.surface,
    border: customTheme?.border || colors.border,
    text: customTheme?.text || colors.text,
    textMuted: customTheme?.textMuted || colors.textMuted,
    accent: customTheme?.accent || colors.accent,
    error: customTheme?.error || colors.error,
  }

  const getBorderColor = () => {
    if (error) return theme.error
    if (isFocused) return theme.accent
    return theme.border
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: getBorderColor(),
          },
          error && styles.inputError,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        )}
        
        <RNTextInput
          style={[
            styles.input,
            { color: theme.text },
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon || isPassword ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.textMuted} />
            ) : (
              <Eye size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.textMuted }]}>
          {helperText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputError: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  iconLeft: {
    paddingLeft: spacing.md,
  },
  iconRight: {
    paddingRight: spacing.md,
  },
  errorText: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
  },
})

export default Input
