import { Platform } from 'react-native'

// Base sizes preserve the existing Android and web layouts.
// Calibrate this offset after comparing the same screens on both platforms.
export const IOS_FONT_SIZE_OFFSET = 2

function platformFontSize(baseSize: number): number {
  return Platform.select({
    ios: baseSize + IOS_FONT_SIZE_OFFSET,
    android: baseSize,
    default: baseSize,
  })
}

export const fontScale = {
  5: platformFontSize(5),
  6: platformFontSize(6),
  6.5: platformFontSize(6.5),
  7: platformFontSize(7),
  8: platformFontSize(8),
  9: platformFontSize(9),
  9.5: platformFontSize(9.5),
  10: platformFontSize(10),
  11: platformFontSize(11),
  12: platformFontSize(12),
  13: platformFontSize(13),
  14: platformFontSize(14),
  15: platformFontSize(15),
  16: platformFontSize(16),
  17: platformFontSize(17),
  18: platformFontSize(18),
  20: platformFontSize(20),
  22: platformFontSize(22),
  23: platformFontSize(23),
  24: platformFontSize(24),
  25: platformFontSize(25),
  26: platformFontSize(26),
  27: platformFontSize(27),
  28: platformFontSize(28),
  30: platformFontSize(30),
  31: platformFontSize(31),
  32: platformFontSize(32),
  35: platformFontSize(35),
  36: platformFontSize(36),
  39: platformFontSize(39),
  40: platformFontSize(40),
  45: platformFontSize(45),
} as const

// Keep explicit line heights in step with the iOS font adjustment.
export function platformLineHeight(baseHeight: number): number {
  return platformFontSize(baseHeight)
}

// Shared names for new and migrated text styles.
export const textSize = {
  tiny: fontScale[8],
  micro: fontScale[9],
  captionSmall: fontScale[10],
  label: fontScale[11],
  caption: fontScale[12],
  bodySmall: fontScale[13],
  body: fontScale[14],
  bodyLarge: fontScale[15],
  subtitle: fontScale[16],
  subtitleLarge: fontScale[17],
  titleSmall: fontScale[18],
  title: fontScale[20],
  heading: fontScale[22],
  headingLarge: fontScale[24],
  displaySmall: fontScale[32],
  display: fontScale[40],
} as const

export const fontFamily = {
  system: undefined,
  serif: 'serif',
  cormorant: 'cormorant',
  cormorantTitle: 'Cormorant',
}

export const fontSize = {
  tiny: fontScale[8],
  micro: fontScale[9],
  caption: fontScale[10],
  small: fontScale[11],
  bodySmall: fontScale[12],
  body: fontScale[13],
  bodyLarge: fontScale[14],
  subtitle: fontScale[15],
  titleSmall: fontScale[16],
  title: fontScale[17],
  titleLarge: fontScale[18],
  headingSmall: fontScale[20],
  heading: fontScale[22],
  headingLarge: fontScale[24],
  displaySmall: fontScale[32],
  display: fontScale[40],
}

export const lineHeight = {
  tight: platformLineHeight(12),
  caption: platformLineHeight(13),
  small: platformLineHeight(14),
  bodySmall: platformLineHeight(15),
  body: platformLineHeight(16),
  bodyLarge: platformLineHeight(17),
  subtitle: platformLineHeight(19),
  titleSmall: platformLineHeight(20),
  title: platformLineHeight(22),
  heading: platformLineHeight(25),
  display: platformLineHeight(40),
}

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
} as const

export const typography = {
  label: {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeight.semibold,
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: fontWeight.regular,
  },
  bodyStrong: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    fontWeight: fontWeight.bold,
  },
  heading: {
    fontSize: fontSize.heading,
    lineHeight: lineHeight.heading,
    fontWeight: fontWeight.bold,
  },
}
