import { StyleSheet } from 'react-native'

import { borderRadius, colors, spacing, typography } from '@/lib/theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.body.fontSize,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surface,
    marginTop: -75,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: 24,
  },
  featuresCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  featureLabel: {
    fontSize: typography.caption.fontSize,
  },
  featureDivider: {
    width: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  featureChipText: {
    fontSize: typography.bodySmall.fontSize,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  locationCity: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: 2,
  },
  linkButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  linkButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  rentDetailsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  rentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rentDetailLabel: {
    fontSize: typography.body.fontSize,
  },
  rentDetailValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  rentDivider: {
    height: 1,
  },
  valueCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  currentValueLabel: {
    fontSize: typography.bodySmall.fontSize,
  },
  currentValue: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  projectionNote: {
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic',
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  projectionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  projectionYear: {
    fontSize: typography.caption.fontSize,
  },
  projectionValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  projectionGrowth: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  costsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  costLabel: {
    fontSize: typography.body.fontSize,
  },
  costValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
  },
  costTotalLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  costTotalValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  roiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  roiInfo: {
    flex: 1,
  },
  roiLabel: {
    fontSize: typography.caption.fontSize,
  },
  roiValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginTop: 2,
  },
  viewFilters: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
  },
  viewFilterBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  viewFilterText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  monthDayText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  aptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  aptDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotOutline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  legendText: {
    fontSize: typography.caption.fontSize,
  },
  daysScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  dayCard: {
    width: 60,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  dayName: {
    fontSize: typography.caption.fontSize,
    textTransform: 'capitalize',
  },
  dayNum: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlotCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  timeSlotText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  bookedText: {
    fontSize: 10,
  },
  notesInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  whatsappButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  scheduleButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
