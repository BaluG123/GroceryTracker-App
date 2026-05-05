import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AnimatedInput from '../components/common/AnimatedInput';
import BrandLogo from '../components/common/BrandLogo';
import GradientButton from '../components/common/GradientButton';
import { AuthStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { forgotPassword } from '../store/slices/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Nav = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [username, setUsername] = useState('');
  const [resetAnswer, setResetAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canSubmit =
    username.trim() &&
    resetAnswer.trim() &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await dispatch(
        forgotPassword({
          username: username.trim(),
          reset_answer: resetAnswer.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      ).unwrap();

      Alert.alert('Password updated', 'Use your new password to sign in.', [
        { text: 'Go to login', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Reset failed', String(error));
    }
  };

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#0B1220', '#111827', '#1F2937'] : ['#FFF8F1', '#F8FAFC']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <BrandLogo subtitle="Local reset" color={colors.textPrimary} />
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Reset your password</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            No email flow here. Answer your saved reset prompt and create a new password.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AnimatedInput
              label="Username"
              leftIcon="👤"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <AnimatedInput
              label="Reset answer"
              leftIcon="🗝️"
              value={resetAnswer}
              onChangeText={setResetAnswer}
              autoCapitalize="sentences"
            />
            <AnimatedInput
              label="New password"
              leftIcon="🔒"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              autoCapitalize="none"
            />
            <AnimatedInput
              label="Confirm password"
              leftIcon="✅"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
            />

            <GradientButton
              title="Update password"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!canSubmit}
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
              <Text style={[styles.backText, { color: colors.textSecondary }]}>
                Back to sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  heading: {
    ...typography.heading,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subheading: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
  },
  backLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backText: {
    ...typography.body,
  },
});

export default ForgotPasswordScreen;
