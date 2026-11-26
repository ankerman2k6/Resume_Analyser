export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  headlineLarge: { fontFamily: fontFamilies.bold, fontSize: 26, lineHeight: 36 },
  headlineMedium: { fontFamily: fontFamilies.semibold, fontSize: 24, lineHeight: 36 },
  headlineSmall: { fontFamily: fontFamilies.semibold, fontSize: 20, lineHeight: 30 },
  titleMedium: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 24 },
  titleSmall: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 21 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21 },
  bodySmall: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 },
  labelMedium: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 21 },
  labelSmall: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 18 },
} as const;
