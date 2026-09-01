import { colors } from "@/lib/theme";
import { fontSize, generalColors, statusColors, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
   appointmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 31, 0.42)',
    justifyContent: 'flex-end',
    
  },
  appointmentModalPanel: {
    maxHeight: '92%',
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    backgroundColor: '#fffcfc',
    padding: 12,
  },
  appointmentModalHeader: {
    minHeight: 38,
    alignItems: 'center',
  },
  appointmentModalTitle: {
    flex: 1,
    color: '#0c6740',
    fontSize: 20,
    fontWeight: '700',
  },
  appointmentModalClose: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f1ebda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentModalBack: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f1ebda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentModalContent: {
    paddingBottom: 40,
    gap: 8,
  },
  appointmentPickerButton: {
    minHeight: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#fffcfc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  appointmentPickerCopy: {
    flex: 1,
    minWidth: 0,
  },
  appointmentPickerTitle: {
    color: '#3d5a40',
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentPickerMeta: {
    color: '#7e8b86',
    fontSize: 10,
    marginTop: 2,
  },
  appointmentSelectionList: {
    gap: 8,
  },
  appointmentSelectionRow: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  appointmentSelectionRowActive: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  appointmentSelectionRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  appointmentSelectionRowTitle: {
    color: '#232323',
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentSelectionRowTitleActive: {
    color: '#ffffff',
  },
  appointmentSelectionRowMeta: {
    color: '#7e8b86',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  appointmentSelectionRowMetaActive: {
    color: '#ffffff',
  },
   calendarSettingsEmpty: {
    color: '#737373',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    paddingVertical: 10,
  },
  calendarList: {
    gap: 6,
  },
  calendarOptionRow: {
    minHeight: 42,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  calendarToggle: {
    width: 42,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ded6ca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarToggleActive: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  calendarToggleText: {
    color: '#737373',
    fontSize: 9,
    fontWeight: '700',
  },
  calendarToggleTextActive: {
    color: '#ffffff',
  },
  calendarOptionCopy: {
    flex: 1,
    minWidth: 0,
  },
  calendarOptionTitle: {
    color: '#232323',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarOptionMeta: {
    color: '#7e8b86',
    fontSize: 9,
    marginTop: 2,
  },
  calendarPrimaryButton: {
    minWidth: 52,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cbb375',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  calendarPrimaryButtonActive: {
    backgroundColor: '#cbb375',
  },
  calendarPrimaryButtonText: {
    color: '#3d5a40',
    fontSize: 9,
    fontWeight: '700',
  },
  calendarPrimaryButtonTextActive: {
    color: '#19191f',
  },
  calendarActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 9,
  },
  calendarActionButton: {
    flex: 1,
    minHeight: 31,
    borderRadius: 6,
    backgroundColor: '#0c6740',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  calendarActionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarLabel: {
    color: '#3d5a40',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  rentValueContainer:{
    backgroundColor: generalColors.rentColor
  },
  saleValueContainer: {
    backgroundColor: generalColors.saleColor
  },
  generalValueContainer: {
    backgroundColor: generalColors.general,
  },
  coloredValueText: {
    color: generalColors.white,
  },
  relatedLeadSection:{
    gap: 3
  },
  appointmentModeRow: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#969696',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 5,
  },
  appointmentModeButton: {
    flex: 1,
    minHeight: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ded6ca',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  appointmentModeButtonRentActive: {
    backgroundColor: generalColors.rentColor,
    borderColor: generalColors.rentColor,
  },
  appointmentModeButtonSaleActive: {
    backgroundColor: generalColors.saleColor,
    borderColor: generalColors.saleColor,
  },
  appointmentModeButtonGeneralActive: {
    backgroundColor: generalColors.general,
    borderColor: generalColors.general,
  },
  appointmentModeButtonText: {
    color: '#3d5a40',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  appointmentModeButtonTextActive: {
    color: '#ffffff',
  },
  appointmentProvisionalFields: {
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: generalColors.background,
    borderRadius: 12,
    borderColor: generalColors.borderSoft,
    borderWidth: 1,
  },
  informationSection:{
    gap: 5,
  },
  informationText:{
    fontSize: 11
  },
  calendarDestinationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  calendarDestinationChip: {
    maxWidth: '48%',
    minHeight: 26,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#fffcfc',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  calendarDestinationChipActive: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  calendarDestinationChipText: {
    color: '#3d5a40',
    fontSize: 9,
    fontWeight: '700',
  },
  calendarDestinationChipTextActive: {
    color: '#ffffff',
  },
  calendarSelectedNotice: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 6,
  },
  calendarSelectedNoticeTitle: {
    color: '#3d5a40',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarSelectedNoticeMeta: {
    color: '#7e8b86',
    fontSize: 10,
    marginTop: 2,
  },
  calendarTestInput: {
    minHeight: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ded6ca',
    color: '#232323',
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 6,
    backgroundColor: '#fffcfc',
  },
  descriptionInput: {
    minHeight: 80,
  },
  calendarPicker: {
    marginBottom: 6,
  },
  calendarPickerValue: {
    minHeight: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ded6ca',
    color: '#232323',
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: '#fffcfc',
  },
  calendarPickerActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  calendarPickerButton: {
    flex: 1,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#f1ebda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPickerButtonText: {
    color: '#3d5a40',
    fontSize: 10,
    fontWeight: '700',
  },
  calendarPickerInput: {
    flex: 1,
    minHeight: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ded6ca',
    color: '#232323',
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: '#fffcfc',
  },
  calendarButtonsSection:{
    flexDirection: 'row',
    gap: 5
  },
  calendarTestCreateButton: {
    minHeight: 40,
    borderRadius: 6,
    backgroundColor: '#3d5a40',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
    flex: 1
  },
  calendarCloseTab:{
    minHeight: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
    flex: 1,
    borderColor: statusColors.danger,
    borderWidth: .5,
  },
  calendarCreateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarExitButtonText:{
    color: '#0c0c0c',
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentDatePicker: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    padding: 10,
    gap: 8,
  },
  appointmentDatePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentDatePickerNavButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f1ebda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDatePickerHeaderTitle: {
    alignItems: 'center',
  },
  appointmentDatePickerMonth: {
    color: '#19191f',
    fontSize: 14,
    fontWeight: '700',
  },
  appointmentDatePickerYear: {
    color: '#737373',
    fontSize: 11,
  },
  appointmentDatePickerWeekRow: {
    flexDirection: 'row',
  },
  appointmentDatePickerWeekCell: {
    width: '14.2857%',
    alignItems: 'center',
  },
  appointmentDatePickerWeekText: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '700',
  },
  appointmentDatePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  appointmentDatePickerDayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDatePickerDayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDatePickerTodayButton: {
    borderWidth: 1,
    borderColor: '#cbb375',
  },
  appointmentDatePickerSelectedDayButton: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  appointmentDatePickerDayText: {
    color: '#232323',
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDatePickerTodayText: {
    color: '#c09a45',
    fontWeight: '700',
  },
  appointmentDatePickerSelectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  appointmentDatePickerSectionTitle: {
    color: '#3d5a40',
    fontSize: 11,
    fontWeight: '700',
  },
  appointmentDatePickerOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: 'red',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1
  },
  appointmentDatePickerOption: {
    minWidth: 42,
    minHeight: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ded6ca',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  appointmentDatePickerOptionActive: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  appointmentDatePickerOptionText: {
    color: '#3d5a40',
    fontSize: 11,
    fontWeight: '700',
  },
  appointmentDatePickerOptionTextActive: {
    color: '#ffffff',
  },
  appointmentDatePickerFooter: {
    gap: 8,
  },
  appointmentDatePickerValue: {
    color: '#232323',
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDatePickerConfirmButton: {
    minHeight: 32,
    borderRadius: 6,
    backgroundColor: '#f1ebda',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  appointmentDatePickerConfirmText: {
    color: '#3d5a40',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarContainer:{
    
  },
  calendarButton:{
    borderRadius: 12,
    borderColor: generalColors.borderSoft,
    backgroundColor: userColors.adviser.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,   
    alignItems: 'center',
    alignContent: 'center'

  },
  calendarButtonText:{
    color: generalColors.white,
    fontSize: 12
  },
  selectedDateTimeText: {
    color: '#3d5a40',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  createModalContainer: {
    height: '88%',
  },

  createModalContent: {
    flex: 1,
    minHeight: 0,
  },
  modalScroll: {
    flex: 1,
    minHeight: 0,
  },
  modalScrollContent: {
    gap: 14,
    paddingBottom: 24,
  },
  advisorAssignmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  advisorAssignmentButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d8d0c4',
    borderRadius: 10,
    backgroundColor: '#fffdf9',
  },
  advisorAssignmentButtonActive: {
    borderColor: '#3d5a40',
    backgroundColor: '#3d5a40',
  },
  advisorAssignmentButtonText: {
    color: '#3d5a40',
    fontSize: 14,
    fontWeight: '700',
  },
  advisorAssignmentButtonTextActive: {
    color: '#ffffff',
  },
  assignedAdvisorText: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ded6ca',
    borderRadius: 7,
    color: '#193a31',
    backgroundColor: '#f4f0e9',
  },
  fieldSection: {
    gap: 7,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 12,
    borderWidth: .5,
    borderColor: '#ded6ca',
  },
  originalValueContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4ded4',
    backgroundColor: '#f6f3ed',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  originalValueLabel: {
    color: '#7e8b86',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  originalValueText: {
    color: '#232323',
    fontSize: 12,
    marginTop: 3,
  },
  newValueLabel: {
    color: '#3d5a40',
    fontSize: 10,
    fontWeight: '600',
  },
  dateSelectionRow: {
    gap: 8,
  },
  relatedInformationSection: {
    borderRadius: 10,
    backgroundColor: '#f6f3ed',
    padding: 12,
    gap: 9,
  },
  sectionTitle: {
    color: '#3d5a40',
    fontSize: 13,
    fontWeight: '700',
  },
  relatedInformationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  relatedInformationItem: {
    flex: 1,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    padding: 9,
  },
  relatedInformationLabel: {
    color: '#7e8b86',
    fontSize: 9,
    fontWeight: '700',
  },
  relatedInformationValue: {
    color: '#232323',
    fontSize: 11,
    marginTop: 3,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  calendarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarOption: {
    width: '48%',
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  calendarOptionActive: {
    borderColor: '#3d5a40',
    backgroundColor: '#3d5a40',
  },
  calendarOptionTitleActive: {
    color: '#ffffff',
  },
  calendarOptionMetaActive: {
    color: '#e8eee9',
  },
  calendarEmptyText: {
    color: '#7e8b86',
    fontSize: 11,
    paddingVertical: 8,
  },
  relationButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  relationButtonCopy: {
    flex: 1,
    minWidth: 0,
  },
  selectionList: {
    gap: 8,
    paddingBottom: 24,
  },
  clearRelationButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: statusColors.danger,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  clearRelationButtonText: {
    color: statusColors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  selectionItem: {
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded6ca',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectionItemActive: {
    borderColor: '#3d5a40',
    backgroundColor: '#3d5a40',
  },
  selectionItemTitle: {
    color: '#232323',
    fontSize: 12,
    fontWeight: '700',
  },
  selectionItemMeta: {
    color: '#7e8b86',
    fontSize: 10,
    marginTop: 3,
  },
  selectionItemTextActive: {
    color: '#ffffff',
  },
})
