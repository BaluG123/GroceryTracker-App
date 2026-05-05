import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { darkColors, lightColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import BrandLogo from './BrandLogo';

interface BootLoaderProps {
  theme: 'dark' | 'light';
  message?: string;
}

const BootLoader: React.FC<BootLoaderProps> = ({
  theme,
  message = 'Checking your space and loading your timeline...',
}) => {
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <LinearGradient
      colors={
        theme === 'dark'
          ? ['#0B1220', '#111827', '#1F2937']
          : ['#FFF8F1', '#F8FAFC', '#E0F2FE']
      }
      style={styles.container}
    >
      <View style={styles.glowA} />
      <View style={styles.glowB} />
      <BrandLogo subtitle="Daily Money Flow" color={colors.textPrimary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: 280,
  },
  loader: {
    marginTop: spacing.xl,
  },
  glowA: {
    position: 'absolute',
    top: 80,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,183,3,0.08)',
  },
  glowB: {
    position: 'absolute',
    bottom: 110,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(58,134,255,0.08)',
  },
});

export default BootLoader;
