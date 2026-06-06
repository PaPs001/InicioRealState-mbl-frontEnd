import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ChevronRight, Eye, EyeOff } from 'lucide-react-native'
import type { BuyerInputStepContent, BuyerStep } from './types'

interface BuyerInputStepProps {
  animatedStyle: object
  styles: any
  theme: any
  step: BuyerStep
  content: BuyerInputStepContent
  showPassword: boolean
  onTogglePassword: () => void
  onContinue: () => void
  isCurrentStepValid: boolean
}

export function BuyerInputStep({
  animatedStyle,
  styles,
  theme,
  step,
  content,
  showPassword,
  onTogglePassword,
  onContinue,
  isCurrentStepValid,
}: BuyerInputStepProps) {
  const Icon = content.icon

  return (
    <Animated.View style={[styles.stepContainer, animatedStyle]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{content.title}</Text>
        <Text style={styles.stepSubtitle}>{content.subtitle}</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Icon size={20} color={theme.textMuted} />
          <TextInput
            key={`buyer-input-${step}`}
            style={styles.input}
            placeholder={content.placeholder}
            placeholderTextColor={theme.textMuted}
            value={content.value}
            onChangeText={content.onChange}
            keyboardType={content.keyboardType}
            secureTextEntry={content.secureTextEntry && !showPassword}
            autoCapitalize={step === 'email' || step === 'password' ? 'none' : 'sentences'}
            autoCorrect={step !== 'email' && step !== 'password'}
            textContentType={step === 'email' ? 'emailAddress' : step === 'password' ? 'password' : 'none'}
          />
          {content.secureTextEntry ? (
            <TouchableOpacity onPress={onTogglePassword}>
              {showPassword ? (
                <EyeOff size={20} color={theme.textMuted} />
              ) : (
                <Eye size={20} color={theme.textMuted} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.inputHint}>{content.hint}</Text>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !isCurrentStepValid && styles.continueButtonDisabled]}
        onPress={onContinue}
        disabled={!isCurrentStepValid}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
        <ChevronRight size={20} color={theme.textLight} />
      </TouchableOpacity>
    </Animated.View>
  )
}
