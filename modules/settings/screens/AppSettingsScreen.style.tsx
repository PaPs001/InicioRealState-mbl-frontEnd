import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1ec',
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
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
    borderColor: '#626c6d',
    padding: 15,
    backgroundColor: '#f5f1ec'
  },
  userInfoRow:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatarContainer:{
    width: 120,
    height: 120,
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
  userTextContainer:{
    //paddingVertical: 10,
    gap: 3
  },
  userName:{
    fontSize: 25,
    fontWeight: '700',
    color: '#1e2d32',
  },
  activeStatusContainer:{
    alignSelf: 'center',
  },
  activeStatus:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  editProfileRow:{
    flexDirection: 'row',
    marginTop: 12,
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
  },
  editButton:{
    borderRadius: 8,
    borderColor: '#b3ada5',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  optionsSection:{
    marginTop: 12,
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
    color: '#1e2d32',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
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

  outlineButton:{
    alignSelf: 'center',
    marginTop: 14,
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
    marginTop: 10,
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
})
