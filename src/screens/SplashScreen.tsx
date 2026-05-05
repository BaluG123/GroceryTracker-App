import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import BrandLogo from '../components/common/BrandLogo';
import { AuthStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { continueAsGuest } from '../store/slices/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Nav = StackNavigationProp<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [contentOpacity, contentTranslate, logoOpacity, logoScale]);

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

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      >
        <BrandLogo subtitle={t('daily_money_flow')} color={colors.textPrimary} />
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <Text style={[styles.tagline, { color: colors.textPrimary }]}>
          {t('splash_tagline')}
        </Text>
        <Text style={[styles.subline, { color: colors.textSecondary }]}>
          {t('splash_subline')}
        </Text>

        <View style={styles.pointList}>
          <Text style={[styles.point, { color: colors.textPrimary }]}>• {t('splash_guest_point')}</Text>
          <Text style={[styles.point, { color: colors.textPrimary }]}>• {t('splash_account_point')}</Text>
          <Text style={[styles.point, { color: colors.textPrimary }]}>• {t('splash_reopen_point')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#F97316' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryText}>{t('sign_in')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.card + 'B8', borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>{t('create_account')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { dispatch(continueAsGuest()); }} style={styles.guestLink}>
          <Text style={[styles.guestText, { color: colors.textSecondary }]}>{t('continue_as_guest')}</Text>
        </TouchableOpacity>
      </Animated.View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  tagline: {
    ...typography.heading,
    textAlign: 'center',
  },
  subline: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  pointList: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  point: {
    ...typography.body,
  },
  primaryButton: {
    width: '100%',
    marginTop: spacing.xxl,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryText: {
    ...typography.bodyBold,
    color: '#FFF7ED',
  },
  secondaryButton: {
    width: '100%',
    marginTop: spacing.md,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryText: {
    ...typography.bodyBold,
  },
  guestLink: {
    marginTop: spacing.lg,
  },
  guestText: {
    ...typography.body,
  },
  glowA: {
    position: 'absolute',
    top: 90,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(249,115,22,0.10)',
  },
  glowB: {
    position: 'absolute',
    bottom: 90,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(58,134,255,0.10)',
  },
});

export default SplashScreen;
