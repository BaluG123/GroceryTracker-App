import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { darkColors, lightColors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadiusValue?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadiusValue = borderRadius.sm,
}) => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.shimmerBase, colors.shimmerHighlight],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: borderRadiusValue,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton patterns
export const CardSkeleton: React.FC = () => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card }]}>
      <SkeletonLoader width="60%" height={18} />
      <SkeletonLoader width="40%" height={14} style={{ marginTop: spacing.sm }} />
      <SkeletonLoader width="80%" height={14} style={{ marginTop: spacing.sm }} />
    </View>
  );
};

export const ListItemSkeleton: React.FC = () => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[skeletonStyles.listItem, { backgroundColor: colors.card }]}>
      <SkeletonLoader width={44} height={44} borderRadiusValue={22} />
      <View style={skeletonStyles.listContent}>
        <SkeletonLoader width="70%" height={16} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
      <SkeletonLoader width={60} height={20} />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default SkeletonLoader;
