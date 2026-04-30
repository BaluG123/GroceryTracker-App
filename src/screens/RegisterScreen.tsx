import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/slices/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getPasswordStrength } from '../utils/helpers';
import AnimatedInput from '../components/common/AnimatedInput';
import GradientButton from '../components/common/GradientButton';

type Nav = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const strength = getPasswordStrength(password);
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    username.trim() &&
    email.trim() &&
    password.length >= 6;

  const handleRegister = () => {
    if (!canSubmit) {return;}
    dispatch(clearError());
    dispatch(
      register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      }),
    );
  };

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#0F0F1A', '#1A1A3E'] : ['#F5F5FA', '#E8E8F8']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>📝</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('sign_up')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('tagline')}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <AnimatedInput
                  label={t('first_name')}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.nameField}>
                <AnimatedInput
                  label={t('last_name')}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <AnimatedInput
              label={t('username')}
              leftIcon="👤"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AnimatedInput
              label={t('email')}
              leftIcon="📧"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AnimatedInput
              label={t('password')}
              leftIcon="🔒"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor:
                            i <= strength.level
                              ? strength.color
                              : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <GradientButton
              title={t('register')}
              onPress={handleRegister}
              loading={isLoading}
              disabled={!canSubmit}
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.switchLink}
            >
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                {t('already_have_account')}{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {t('sign_in')}
                </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  errorContainer: {
    backgroundColor: '#FF6B6B20',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#FF6B6B',
    ...typography.caption,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameField: { flex: 1 },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: spacing.md,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    ...typography.captionBold,
    width: 50,
    textAlign: 'right',
  },
  switchLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchText: {
    ...typography.body,
  },
});

export default RegisterScreen;
