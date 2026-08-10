import {StyleSheet} from 'react-native';
import { generalColors, textColor, userColors, borderColor, statusColors, fontSize } from '@/theme';
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
    backgroundColor: '#FFFDFC',
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
    paddingHorizontal: 12,
    flex: 1,
    height: '100%',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  editText:{
    color: textColor.accentGolden,
    fontSize: 12,
    flexShrink: 1,
    
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

  finalSection:{
    alignItems: 'center',
  
  },  
  logOutButton:{
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d3d1d165',
    backgroundColor: generalColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logOutText:{
    color: statusColors.danger,
    fontSize: 12,
  },
})
