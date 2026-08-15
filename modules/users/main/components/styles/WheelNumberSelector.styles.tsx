import { StyleSheet } from 'react-native'

export const wheelNumberSelectorStyles = StyleSheet.create({
  viewport: {
    width: 60,
    height: 238,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  track: {
    width: 60,
    flexDirection: 'column',
    alignItems: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    minWidth: 42,
    minHeight: 28,
    //borderRadius: 6,
    //borderWidth: 1,
    borderColor: '#ded6ca',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionActive: {
    backgroundColor: '#3d5a40',
    borderColor: '#3d5a40',
  },
  optionText: {
    color: '#3d5a40',
    fontSize: 11,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#ffffff',
  },
})
