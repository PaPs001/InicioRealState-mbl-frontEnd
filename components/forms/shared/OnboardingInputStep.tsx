import { Animated, Text, TextInput, View } from 'react-native'

interface OnboardingInputStepProps {
  animatedStyle: object
  styles: any
  title?: string
  subtitle?: string
  label: string
  placeholder: string
  placeholderTextColor: string
  value: string
  hint?: string
  onChangeText: (text: string) => void
  inputKey?: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  secureTextEntry?: boolean
  autoCorrect?: boolean
}

export function OnboardingInputStep({
  animatedStyle,
  styles,
  title,
  subtitle,
  label,
  placeholder,
  placeholderTextColor,
  value,
  hint,
  onChangeText,
  inputKey,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  autoCorrect = true,
}: OnboardingInputStepProps) {
  return (
    <Animated.View style={[styles.stepContent, animatedStyle]}>
      {title ? <Text style={styles.stepTitle}>{title}</Text> : null}
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          key={inputKey}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          autoCorrect={autoCorrect}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </Animated.View>
  )
}
