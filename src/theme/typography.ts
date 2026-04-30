import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,
  hero: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
  },
  amountLarge: {
    fontSize: 42,
    fontWeight: '800' as const,
    lineHeight: 50,
  },
};
