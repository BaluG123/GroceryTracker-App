import React, { useRef } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import i18n, { LANGUAGES } from '../i18n';
import BrandLogo from '../components/common/BrandLogo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage } from '../store/slices/settingsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { LanguageCode } from '../types';

const LanguageSelectionScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.settings.theme);
  const selectedLanguage = useAppSelector(state => state.settings.language);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const chooseLanguage = (code: LanguageCode) => {
    dispatch(setLanguage(code));
    i18n.changeLanguage(code);
  };

  return (
    <LinearGradient
      colors={
        theme === 'dark'
          ? ['#080B16', '#111827', '#1A1A2E']
          : ['#F8FAFC', '#EEF2FF', '#ECFDF5']
      }
      style={styles.container}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulse }] }]}>
        <BrandLogo subtitle="Choose your language" color={colors.textPrimary} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Select your preferred language
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Piko will open in this language from next time, starting with the splash screen.
      </Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.languageGrid}
        columnWrapperStyle={styles.languageRow}
        renderItem={({ item }) => {
          const active = selectedLanguage === item.code;
          return (
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => chooseLanguage(item.code as LanguageCode)}
              style={[
                styles.languageCard,
                {
                  backgroundColor: active ? colors.primary + '24' : colors.card + 'E6',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.nativeLabel, { color: colors.textPrimary }]}>
                {item.nativeLabel}
              </Text>
              <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  languageGrid: {
    paddingBottom: spacing.massive,
  },
  languageRow: {
    gap: spacing.md,
  },
  languageCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  nativeLabel: {
    ...typography.bodyBold,
  },
  languageLabel: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  glowTop: {
    position: 'absolute',
    top: 60,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,212,170,0.12)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 90,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(108,99,255,0.14)',
  },
});

export default LanguageSelectionScreen;
