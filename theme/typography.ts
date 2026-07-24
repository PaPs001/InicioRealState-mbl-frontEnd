export const fontFamily = {
  system: undefined,
  serif: 'serif',
  cormorant: 'cormorant',
  cormorantTitle: 'Cormorant',
}

export const fontSize = {
  tiny: 8,
  micro: 9,
  caption: 10,
  small: 11,
  bodySmall: 12,
  body: 13,
  bodyLarge: 14,
  subtitle: 15,
  titleSmall: 16,
  title: 17,
  titleLarge: 18,
  headingSmall: 20,
  heading: 22,
  headingLarge: 24,
  displaySmall: 32,
  display: 40,
}

export const lineHeight = {
  tight: 12,
  caption: 13,
  small: 14,
  bodySmall: 15,
  body: 16,
  bodyLarge: 17,
  subtitle: 19,
  titleSmall: 20,
  title: 22,
  heading: 25,
  display: 40,
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
