import { borderColor, generalColors, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  appointmentModalGestureRoot: {
    flex: 1,
  },
  appointmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 31, 0.42)',
    justifyContent: 'flex-end',
  },
  headerContainer:{
    gap: 5,
    alignItems: 'center',
    alignContent: 'center',
  },
  title:{
    fontSize: 23,
    color: generalColors.greenTitle
  },
  subtitle:{
    fontSize: 13,
    color: generalColors.textMuted
  },
  appointmentModalPanel: {
    maxHeight: '92%',
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    backgroundColor: '#fffcfc',
    padding: 12,
  },
   appointmentDatePicker: {
    backgroundColor: '#fffcfc',
    padding: 10,
    gap: 8,
  },
  appointmentDatePickerHeader: {
    borderColor: generalColors.border,
    borderWidth: 1,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignContent: 'center',
    gap: 6
  },
  appointmentDatePickerMonth: {
    color: generalColors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  appointmentDatePickerYear: {
    color: generalColors.black,
    fontSize: 14,
    fontWeight: '700',
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
    height: 42,
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
  informationDateSection:{
    gap: 10
  },
  informationDateContainer:{
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e1e1',
    paddingVertical: 25,
    paddingHorizontal: 25,
    backgroundColor: generalColors.backgroundSections
  },
  dateText:{
    fontSize: 13
  },
  appointmentDatePickerConfirmButton: {
    minHeight: 45,
    borderRadius: 6,
    backgroundColor: userColors.adviser.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  appointmentDatePickerConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  timeContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
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
  appointmentDatePickerFooter: {
    gap: 8,
  },
  appointmentDatePickerValue: {
    color: '#232323',
    fontSize: 11,
    fontWeight: '600',
  },

})
