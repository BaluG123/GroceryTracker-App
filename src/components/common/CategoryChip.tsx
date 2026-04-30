import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { darkColors, lightColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface CategoryChipProps {
  label: string;
  icon?: string;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  isSelected,
  onPress,
  color,
  style,
}) => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? (color || colors.primary) + '20'
            : colors.inputBackground,
          borderColor: isSelected ? color || colors.primary : colors.border,
        },
        style,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? color || colors.primary : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.captionBold,
  },
});

export default CategoryChip;
