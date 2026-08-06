import { StyleSheet } from "react-native";
import { generalColors } from "@/theme";

export const styles = StyleSheet.create({
  //Calendario
    sectionTitle: {
      color: '#0c6740',
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '600',
    },
    calendarSection:{
      borderRadius: 12,
      borderWidth: 1,
      borderColor: generalColors.border,
      paddingVertical: 15,
      paddingHorizontal: 10,
      gap: 10
    },
    calendarHeader:{
      flexDirection: 'row',
      alignItems: 'center',
      alignContent: 'center',
      gap: 10,
    },
    outlineButton:{
      alignSelf: 'center',
      height: 32,
      minWidth: 127,
      borderRadius: 5,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#dcdcdc',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
    },
    centerButton:{
      alignSelf: 'center',
      height: 33,
      flex: 1,
      minWidth: 0,
      borderRadius: 5,
      backgroundColor: '#c89c4c',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 16,
    },
    outlineButtonText:{
      color: '#006b43',
      fontSize: 12,
      fontWeight: '700',
    },
    centerButtonText:{
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '700',
    },
  
  
    calendarSmallButton: {
      minWidth: 78,
      height: 25,
      borderRadius: 5,
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    calendarSmallButtonText: {
      color: '#0c6740',
      fontSize: 10,
      fontWeight: '600',
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
  
})
