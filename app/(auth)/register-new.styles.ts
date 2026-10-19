import { fontScale as appFontScale, textSize, platformLineHeight } from '@/theme/typography'
import { Platform, StyleSheet } from 'react-native'

const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
})

export const registerNewStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf7f1',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 63,
    paddingBottom: 40,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    width: '100%',
    maxWidth: 326,
    alignItems: 'center',
    marginBottom: 27,
  },
  title: {
    color: '#214c31',
    fontFamily: serifFont,
    fontSize: appFontScale[31],
    fontWeight: '400',
    lineHeight: platformLineHeight(42),
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    width: 300,
    marginTop: 8,
    color: '#737373',
    fontSize: textSize.body,
    lineHeight: platformLineHeight(20),
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    maxWidth: 387,
    gap: 20,
  },
  optionCard: {
    width: '100%',
    height: 102,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee4db',
    borderRadius: 12,
    backgroundColor: '#fffdf9',
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  optionCopy: {
    zIndex: 2,
    width: 30,
    maxWidth: 220,
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 6,
  },
  optionTitle: {
    color: '#B88E4C',
    fontFamily: 'Cormorant',
    fontSize: appFontScale[25],
    fontWeight: '400',
    lineHeight: platformLineHeight(34),
    letterSpacing: 0,
  },
  optionDescription: {
    marginTop: 2,
    color: '#737373',
    fontSize: textSize.caption,
    lineHeight: platformLineHeight(20),
    letterSpacing: 0.8,
  },
  optionImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  optionImageInner: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  imageFade: {
    flex: 1,
  },
})
