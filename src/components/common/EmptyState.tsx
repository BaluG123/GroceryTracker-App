import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAppSelector } from '../../store/hooks';
import { darkColors, lightColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const emptyWalletAnimation = require('../../assets/lottie/empty-wallet.json');

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  animation?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '📋',
  animation = true,
}) => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      {animation ? (
        <LottieView
          source={emptyWalletAnimation}
          autoPlay
          loop
          style={styles.animation}
        />
      ) : (
        <Text style={styles.emoji}>{icon}</Text>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.massive,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  animation: {
    width: 132,
    height: 132,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
