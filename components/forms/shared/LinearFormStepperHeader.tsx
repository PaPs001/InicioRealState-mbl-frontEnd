import { Text, TouchableOpacity, View, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { borderRadius, spacing, typography } from '@/lib/theme'

interface LinearFormStepperHeaderProps {
  onBack: () => void
  backColor: string
  progressTrackColor: string
  progressFillColor: string
  progressTextColor: string
  currentStep: number
  totalSteps: number
  progress: number
  showProgress?: boolean
  progressTextAlign?: TextStyle['textAlign']
  headerStyle?: ViewStyle
  backButtonStyle?: ViewStyle
  progressContainerStyle?: ViewStyle
}

export function LinearFormStepperHeader({
  onBack,
  backColor,
  progressTrackColor,
  progressFillColor,
  progressTextColor,
  currentStep,
  totalSteps,
  progress,
  showProgress = true,
  progressTextAlign = 'center',
  headerStyle,
  backButtonStyle,
  progressContainerStyle,
}: LinearFormStepperHeaderProps) {
  return (
    <>
      <View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={[styles.backButton, backButtonStyle]} onPress={onBack}>
          <ArrowLeft size={20} color={backColor} />
          <Text style={[styles.backButtonText, { color: backColor }]}>Regresar</Text>
        </TouchableOpacity>
      </View>

      {showProgress ? (
        <View style={[styles.progressContainer, progressContainerStyle]}>
          <View style={[styles.progressBar, { backgroundColor: progressTrackColor }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: progressFillColor }]} />
          </View>
          <Text style={[styles.progressText, { color: progressTextColor, textAlign: progressTextAlign }]}>
            Paso {currentStep} de {totalSteps}
          </Text>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
})
