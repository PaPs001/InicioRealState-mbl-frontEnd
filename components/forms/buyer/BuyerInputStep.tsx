import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { PasswordTextInput } from '@/components/ui/PasswordTextInput'
import type { BuyerInputStepContent, BuyerStep } from './types'

interface BuyerInputStepProps {
  animatedStyle: object
  styles: any
  theme: any
  step: BuyerStep
  content: BuyerInputStepContent
  onContinue: () => void
  isCurrentStepValid: boolean
}

export function BuyerInputStep({
  animatedStyle,
  styles,
  theme,
  step,
  content,
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
          {content.secureTextEntry ? (
            <PasswordTextInput
              key={`buyer-input-${step}`}
              style={styles.input}
              placeholder={content.placeholder}
              placeholderTextColor={theme.textMuted}
              value={content.value}
              onChangeText={content.onChange}
              keyboardType={content.keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              iconColor={theme.textMuted}
              toggleStyle={styles.passwordToggle}
            />
          ) : (
            <TextInput
              key={`buyer-input-${step}`}
              style={styles.input}
              placeholder={content.placeholder}
              placeholderTextColor={theme.textMuted}
              value={content.value}
              onChangeText={content.onChange}
              keyboardType={content.keyboardType}
              autoCapitalize={step === 'email' ? 'none' : 'sentences'}
              autoCorrect={step !== 'email'}
              textContentType={step === 'email' ? 'emailAddress' : 'none'}
            />
          )}
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
