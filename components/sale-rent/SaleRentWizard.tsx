import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'

import { borderRadius, spacing, typography } from '@/lib/theme'
import { advisorTheme } from './theme'

type SaleRentWizardProps = {
  children: ReactNode
  currentStepIndex: number
  goBack: () => void
  goNext: () => void
  handleSubmit: () => void
  isCurrentStepValid: boolean
  isSummaryStep: boolean
  totalSteps: number
  progress: number
}

export function SaleRentWizard({
  children,
  currentStepIndex,
  goBack,
  goNext,
  handleSubmit,
  isCurrentStepValid,
  isSummaryStep,
  totalSteps,
  progress,
}: SaleRentWizardProps) {
  return (
    <>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>Paso {currentStepIndex + 1} de {totalSteps}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}

          <View style={styles.navigationButtons}>
            {currentStepIndex > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}

            {isSummaryStep ? (
              <TouchableOpacity
                style={[styles.primaryButton, styles.submitButton, currentStepIndex === 0 && styles.fullWidthButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryButtonLabel}>Enviar Registro</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !isCurrentStepValid && styles.primaryButtonDisabled,
                  currentStepIndex === 0 && styles.fullWidthButton,
                ]}
                onPress={goNext}
                disabled={!isCurrentStepValid}
              >
                <Text style={styles.primaryButtonLabel}>Siguiente</Text>
                <ChevronRight size={20} color={advisorTheme.background} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: advisorTheme.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: advisorTheme.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  primaryButton: {
    flex: 2,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  primaryButtonLabel: {
    color: advisorTheme.background,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  fullWidthButton: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: advisorTheme.success,
  },
})
