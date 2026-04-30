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
import { login, clearError } from '../store/slices/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import AnimatedInput from '../components/common/AnimatedInput';
import GradientButton from '../components/common/GradientButton';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {return;}
    dispatch(clearError());
    dispatch(login({ username: username.trim(), password }));
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🛒</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('app_name')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('tagline')}
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t('sign_in')}
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <AnimatedInput
              label={t('username')}
              leftIcon="👤"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AnimatedInput
              label={t('password')}
              leftIcon="🔒"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <GradientButton
              title={t('login')}
              onPress={handleLogin}
              loading={isLoading}
              disabled={!username.trim() || !password.trim()}
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.switchLink}
            >
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                {t('dont_have_account')}{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {t('sign_up')}
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
    marginBottom: spacing.xxxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
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
  cardTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.xxl,
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
  switchLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchText: {
    ...typography.body,
  },
});

export default LoginScreen;
