import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { darkColors, lightColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: string;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || (value && value.length > 0) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelAnim]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        {leftIcon && (
          <Text style={styles.leftIcon}>{leftIcon}</Text>
        )}
        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelSize,
                color: error
                  ? colors.danger
                  : isFocused
                  ? colors.primary
                  : colors.textSecondary,
                backgroundColor: isFocused || (value && value.length > 0)
                  ? colors.inputBackground
                  : 'transparent',
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.textPrimary },
              leftIcon ? { paddingLeft: 0 } : {},
            ]}
            value={value}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={colors.textTertiary}
            onFocus={e => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </View>
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  leftIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    ...typography.body,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
  },
  eyeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default AnimatedInput;
