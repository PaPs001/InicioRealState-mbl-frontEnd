import {StyleSheet} from 'react-native';
import { generalColors, textColor, userColors, borderColor, statusColors } from '@/theme';
export const styles = StyleSheet.create({
  //Extras
  point:{
    borderRadius: 999,
    width: 8,
    height: 8,
    backgroundColor: userColors.coordinator.primary
  },
  ////////
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 12
  },
  headerRow:{
    width: '100%',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton:{
    position: 'absolute',
    zIndex: 2,
    left: 0,  
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  headerLogo:{
    alignSelf: 'center', 
  },

  ///Usuario
  profileInformationContainer:{
    borderWidth: 1,
    borderRadius: 12,
    borderColor: generalColors.border,
    padding: 15,
    gap: 15
  },
  userInfoRow:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%'
  },
  profileAvatarContainer:{
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText:{
    color: '#1e2d32',
    fontSize: 24,
    fontWeight: '700',
  },
  userinformationContainer:{
    gap: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  userTextContainer:{
    //paddingVertical: 10,
    width: '100%',
    minWidth: 0,
    gap: 1,
    alignContent: 'center',

  },
  userName:{
    fontSize: 25,
    fontWeight: '700',
    color: '#1e2d32',
    flexShrink: 1
  },
  adviserText:{
    fontSize: 12,
    flexShrink: 1,
    flexWrap: 'wrap',
    color: textColor.accentGolden
  },
  activeStatusContainer:{
    //useful
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center'
  },
  statusText:{
    color: userColors.coordinator.primaryDark
  },
  activeStatus:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderColor.borderSoft,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#a6ebad7a'
  },
  editProfileRow:{
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    paddingHorizontal: 15,
    alignItems: 'center'
  },
  editButton:{
    borderRadius: 8,
    borderColor: generalColors.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  editText:{
    color: textColor.accentGolden,
    fontSize: 12
  },
  optionsSection:{
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.border,
    paddingVertical: 17,
    paddingHorizontal: 10
  },
  optionsHeader:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignContent: 'center',
  },
  title: {
    color: '#1e2d32',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  intro: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: userColors.coordinator.primary,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  rowOptions:{
    flexDirection: 'row',
  },
  options: {
    marginTop: 14,
    flexDirection: 'row',
  },

  //Calendario
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


  finalSection:{
    alignItems: 'center',
  
  },  
  logOutButton:{
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColor.borderSoft,
    backgroundColor: generalColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logOutText:{
    color: statusColors.danger
  },
})
