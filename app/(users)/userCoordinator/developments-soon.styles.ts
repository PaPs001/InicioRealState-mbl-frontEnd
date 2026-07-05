import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 92,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 68,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#f6efe3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    color: '#3D5A40',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 7,
    maxWidth: 280,
    color: '#717171',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
})
