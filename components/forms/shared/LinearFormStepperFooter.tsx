import { Text, TouchableOpacity, View, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { borderRadius, spacing, typography } from '@/lib/theme'

interface LinearFormStepperFooterProps {
  disabled: boolean
  label: string
  onPress: () => void
  buttonColor: string
  textColor: string
  disabledButtonColor: string
  disabledTextColor?: string
  footerStyle?: ViewStyle
  buttonStyle?: ViewStyle
  textStyle?: TextStyle
}

export function LinearFormStepperFooter({
  disabled,
  label,
  onPress,
  buttonColor,
  textColor,
  disabledButtonColor,
  disabledTextColor,
  footerStyle,
  buttonStyle,
  textStyle,
}: LinearFormStepperFooterProps) {
  return (
    <View style={[styles.footer, footerStyle]}>
      <TouchableOpacity
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: disabled ? disabledButtonColor : buttonColor },
          buttonStyle,
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.buttonText,
            { color: disabled && disabledTextColor ? disabledTextColor : textColor },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
