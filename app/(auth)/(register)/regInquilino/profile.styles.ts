import { Platform, StyleSheet } from 'react-native'

const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
})

export const registerOwnerProfileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fefbf6',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 62,
    paddingBottom: 40,
  },
  main: {
    width: '100%',
    maxWidth: 386,
    alignItems: 'center',
    gap: 4,
  },
  header: {
    width: 363,
    alignItems: 'center',
    gap: 14,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 11,
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    color: '#e4ac73',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 17,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#ddd5c6',
  },
  progressActive: {
    width: '75%',
    height: 2,
    borderRadius: 2,
    backgroundColor: '#c2824b',
  },
  titleBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 1,
  },
  title: {
    width: '100%',
    color: '#155721',
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: 0.32,
  },
  subtitle: {
    color: '#000000',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.65,
    textAlign: 'center',
  },
  sections: {
    width: '100%',
    gap: 8,
    marginTop: 25,
  },
  section: {
    width: '100%',
  },
  sectionTitleWrap: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    color: '#11451a',
    fontFamily: serifFont,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  optionCard: {
    width: '48.5%',
    height: 44,
    borderWidth: 1,
    borderColor: '#e5dfd2',
    borderRadius: 12,
    backgroundColor: '#fffcf7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionCardSelected: {
    borderColor: '#c2824b',
    backgroundColor: '#fff6ea',
  },
  optionContent: {
    width: 128,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  optionContentWide: {
    width: 143,
    gap: 13,
  },
  optionIcon: {
    width: 23,
    height: 23,
  },
  optionIconResidential: {
    width: 27,
    height: 24,
  },
  optionText: {
    flex: 1,
    color: '#155721',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.13,
  },
  continueButton: {
    width: 304,
    height: 45,
    marginTop: 25,
    borderRadius: 12,
    backgroundColor: '#013f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    position: 'relative',
  },
  continueButtonDisabled: {
    opacity: 0.62,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 16,
    textAlign: 'center',
  },
  continueIcon: {
    position: 'absolute',
    right: 24,
  },
  errorText: {
    width: 330,
    marginTop: 6,
    color: '#b42318',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
})

