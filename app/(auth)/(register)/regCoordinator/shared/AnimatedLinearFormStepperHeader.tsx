import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { borderRadius, spacing, typography } from '@/lib/theme'

interface AnimatedLinearFormStepperHeaderProps {
  onBack: () => void
  backColor: string
  progressTrackColor: string
  progressFillColor: string
  progressTextColor: string
  currentStep: number
  totalSteps: number
  progressWidth: Animated.AnimatedInterpolation<string | number>
  headerStyle?: ViewStyle
}

export function AnimatedLinearFormStepperHeader({
  onBack,
  backColor,
  progressTrackColor,
  progressFillColor,
  progressTextColor,
  currentStep,
  totalSteps,
  progressWidth,
  headerStyle,
}: AnimatedLinearFormStepperHeaderProps) {
  return (
    <View style={[styles.header, headerStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color={backColor} />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: progressTrackColor }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: progressFillColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: progressTextColor }]}>
          Paso {currentStep} de {totalSteps}
        </Text>
      </View>

      <View style={styles.headerPlaceholder} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
})
