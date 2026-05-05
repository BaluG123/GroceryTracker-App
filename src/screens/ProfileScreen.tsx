import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import AnimatedInput from '../components/common/AnimatedInput';
import CustomModal from '../components/common/CustomModal';
import GradientButton from '../components/common/GradientButton';
import OfflineBanner from '../components/common/OfflineBanner';
import { LANGUAGES } from '../i18n';
import i18n from '../i18n';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  forceLogout,
  changePassword,
  configureReset,
  logout,
} from '../store/slices/authSlice';
import {
  setCurrency,
  setLanguage,
  setTheme,
  toggleNotifications,
} from '../store/slices/settingsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { LanguageCode, ThemeMode } from '../types';
import { currencies } from '../utils/currency';

type SecurityModal = 'changePassword' | 'resetSetup' | null;

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, mode } = useAppSelector(state => state.auth);
  const { totalCount: totalItems } = useAppSelector(state => state.items);
  const { totalCount: totalPurchases } = useAppSelector(state => state.purchases);
  const settings = useAppSelector(state => state.settings);
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [securityModal, setSecurityModal] = useState<SecurityModal>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetQuestion, setResetQuestion] = useState(user?.reset_question || '');
  const [resetAnswer, setResetAnswer] = useState('');

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(nextTheme));
  };

  const currentCurrency = currencies.find(item => item.code === settings.currencyCode) || currencies[0];
  const currentLanguage = LANGUAGES.find(item => item.code === settings.language) || LANGUAGES[0];

  const handleLogout = () => {
    try {
      setLogoutVisible(false);
      dispatch(forceLogout());
      dispatch(logout());
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Exit failed', text2: String(error) });
    }
  };

  const submitPasswordChange = async () => {
    try {
      await dispatch(
        changePassword({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      ).unwrap();
      Toast.show({ type: 'success', text1: 'Password changed', text2: 'Your account password was updated.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityModal(null);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Change failed', text2: String(error) });
    }
  };

  const submitResetSetup = async () => {
    try {
      await dispatch(
        configureReset({
          reset_question: resetQuestion.trim(),
          reset_answer: resetAnswer.trim(),
        }),
      ).unwrap();
      Toast.show({ type: 'success', text1: 'Reset saved', text2: 'Your local reset prompt is ready.' });
      setResetAnswer('');
      setSecurityModal(null);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: String(error) });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.textPrimary, paddingTop: spacing.massive }]}>Profile</Text>

        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.first_name?.[0] || 'P').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {mode === 'guest' ? 'Guest Mode' : `${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]}>
            {mode === 'guest' ? 'Local-only experience' : user?.email || '@' + (user?.username || 'piko')}
          </Text>
        </View>

        {mode === 'guest' ? (
          <View style={[styles.noticeCard, { backgroundColor: '#F97316' + '18', borderColor: '#F97316' }]}>
            <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>Keep this data long-term?</Text>
            <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
              You are using all features in guest mode and your data stays on this device. If you want to keep data safer and prepare for sync, sign in or create an account.
            </Text>
            <TouchableOpacity
              style={[styles.noticeButton, { backgroundColor: '#F97316' }]}
              onPress={handleLogout}
            >
              <Text style={styles.noticeButtonText}>Go to sign in</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalItems}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expense items</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{totalPurchases}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expenses logged</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Experience</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Theme</Text>
              <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>
                {settings.theme === 'dark' ? 'Night mode' : 'Light mode'}
              </Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#ddd', true: colors.primary + '60' }}
              thumbColor={settings.theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={() => setLanguageVisible(true)}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Language</Text>
              <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>{currentLanguage.nativeLabel}</Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={() => setCurrencyVisible(true)}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Currency</Text>
              <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>
                {currentCurrency.symbol} {currentCurrency.code}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notifications</Text>
              <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>Keep gentle reminders enabled</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={() => { dispatch(toggleNotifications()); }}
              trackColor={{ false: '#ddd', true: colors.primary + '60' }}
              thumbColor={settings.notificationsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {mode === 'authenticated' ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security</Text>
            <TouchableOpacity style={styles.settingRow} onPress={() => setSecurityModal('changePassword')}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Change password</Text>
                <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>Update your current password inside the app</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => setSecurityModal('resetSetup')}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Reset question</Text>
                <Text style={[styles.settingMeta, { color: colors.textSecondary }]}>
                  {user?.reset_question || 'Create or update your local password reset prompt'}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            {mode === 'guest' ? 'Leave guest mode' : 'Log out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomModal
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
        title={mode === 'guest' ? 'Leave guest mode?' : 'Log out?'}
        message={mode === 'guest' ? 'Your local data remains on this device.' : 'You can sign back in any time.'}
        type="warning"
        confirmText={mode === 'guest' ? 'Leave' : 'Log out'}
        cancelText="Cancel"
      />

      {languageVisible ? (
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setLanguageVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Choose language</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    dispatch(setLanguage(item.code as LanguageCode));
                    i18n.changeLanguage(item.code);
                    setLanguageVisible(false);
                  }}
                >
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{item.nativeLabel}</Text>
                  <Text style={[styles.optionMeta, { color: colors.textSecondary }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}

      {currencyVisible ? (
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setCurrencyVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Choose currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    dispatch(setCurrency(item.code));
                    setCurrencyVisible(false);
                  }}
                >
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{item.symbol} {item.code}</Text>
                  <Text style={[styles.optionMeta, { color: colors.textSecondary }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}

      {securityModal === 'changePassword' ? (
        <View style={styles.modalOverlay}>
          <View style={[styles.formModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Change password</Text>
            <AnimatedInput label="Current password" value={oldPassword} onChangeText={setOldPassword} isPassword />
            <AnimatedInput label="New password" value={newPassword} onChangeText={setNewPassword} isPassword />
            <AnimatedInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
            <GradientButton title="Save password" onPress={submitPasswordChange} />
            <TouchableOpacity onPress={() => setSecurityModal(null)} style={styles.modalCancel}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {securityModal === 'resetSetup' ? (
        <View style={styles.modalOverlay}>
          <View style={[styles.formModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reset question</Text>
            <AnimatedInput label="Question" value={resetQuestion} onChangeText={setResetQuestion} />
            <AnimatedInput label="Answer" value={resetAnswer} onChangeText={setResetAnswer} />
            <GradientButton title="Save reset prompt" onPress={submitResetSetup} />
            <TouchableOpacity onPress={() => setSecurityModal(null)} style={styles.modalCancel}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 110 },
  title: { ...typography.title, marginBottom: spacing.lg },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
  },
  name: { ...typography.title },
  handle: { ...typography.body, marginTop: spacing.xs },
  noticeCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  noticeTitle: { ...typography.subtitle },
  noticeBody: { ...typography.body, marginTop: spacing.sm },
  noticeButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  noticeButtonText: {
    ...typography.captionBold,
    color: '#FFF7ED',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: { ...typography.amount },
  statLabel: { ...typography.captionBold, marginTop: spacing.xs },
  sectionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.md },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingLabel: { ...typography.bodyBold },
  settingMeta: { ...typography.caption, marginTop: spacing.xxs, maxWidth: 240 },
  chevron: { fontSize: 24 },
  logoutButton: {
    borderWidth: 1,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  logoutText: { ...typography.bodyBold },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    elevation: 1000,
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '70%',
  },
  formModal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.massive,
  },
  modalTitle: { ...typography.title, marginBottom: spacing.lg },
  optionRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  optionLabel: { ...typography.bodyBold },
  optionMeta: { ...typography.caption, marginTop: spacing.xxs },
  modalCancel: { alignItems: 'center', marginTop: spacing.lg },
  modalCancelText: { ...typography.body },
});

export default ProfileScreen;
