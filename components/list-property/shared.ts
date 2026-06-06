import { StyleSheet } from 'react-native'

import { borderRadius, clientThemes, spacing, typography, colors } from '@/lib/theme'

export const investorColors = clientThemes.investor

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: investorColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: investorColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: investorColors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.md,
  },
  stepContent: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: investorColors.text,
  },
  stepSubtitle: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
    marginTop: -spacing.sm,
  },
  listingOptions: {
    gap: spacing.md,
  },
  listingOption: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: investorColors.border,
    position: 'relative',
  },
  listingOptionSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: investorColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingOptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  listingOptionTitleSelected: {
    color: investorColors.accent,
  },
  listingOptionDesc: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textSecondary,
    marginTop: spacing.xs,
  },
  formGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: investorColors.text,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  inputInner: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
  },
  inputSuffix: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textMuted,
  },
  suggestionCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.accent + '40',
  },
  suggestionLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  suggestionValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.accent,
    marginTop: spacing.xs,
  },
  photoButton: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: investorColors.accent,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  photoButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.accent,
  },
  photoButtonSubtext: {
    fontSize: typography.bodySmall.fontSize,
    color: investorColors.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.info,
    lineHeight: 20,
  },
  skipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  skipOptionSelected: {
    borderColor: investorColors.accent,
    backgroundColor: investorColors.accent + '15',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: investorColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: investorColors.accent,
    borderColor: investorColors.accent,
  },
  skipOptionText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: investorColors.text,
  },
  currentAddressCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  currentAddressLabel: {
    fontSize: typography.caption.fontSize,
    color: investorColors.textMuted,
  },
  currentAddressValue: {
    fontSize: typography.body.fontSize,
    color: investorColors.text,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryTitle: {
    flex: 1,
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: investorColors.border,
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmQuestion: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: investorColors.text,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmButtonNo: {
    flex: 1,
    backgroundColor: investorColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: investorColors.border,
  },
  confirmButtonNoText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: investorColors.text,
  },
  confirmButtonYes: {
    flex: 1,
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmButtonYesText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: investorColors.border,
  },
  continueButton: {
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: investorColors.border,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textMuted,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: investorColors.text,
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.body.fontSize,
    color: investorColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: investorColors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  successButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: investorColors.primary,
  },
})
