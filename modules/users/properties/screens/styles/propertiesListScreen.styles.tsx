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
  title: {
    marginTop: 16,
    color: '#3D5A40',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    color: '#717171',
    fontSize: 14,
    lineHeight: 19,
  },
  options: {
    marginTop: 30,
    gap: 12,
  },
  optionCard: {
    minHeight: 86,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#d8d0c5',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f6efe3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  optionTitle: {
    color: '#0c6740',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  optionDescription: {
    marginTop: 3,
    color: '#717171',
    fontSize: 12,
    lineHeight: 17,
  },
})
