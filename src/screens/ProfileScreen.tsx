import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchItems } from '../store/slices/itemsSlice';
import {
  setTheme,
  setCurrency,
  setLanguage,
  toggleNotifications,
} from '../store/slices/settingsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatPrice, currencies } from '../utils/currency';
import { LANGUAGES } from '../i18n';
import i18n from '../i18n';
import CustomModal from '../components/common/CustomModal';
import OfflineBanner from '../components/common/OfflineBanner';
import { ThemeMode, LanguageCode } from '../types';

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { totalCount: totalItems } = useAppSelector(state => state.items);
  const { totalCount: totalPurchases } = useAppSelector(state => state.purchases);
  const settings = useAppSelector(state => state.settings);
  const theme = settings.theme;
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchItems(1));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutModalVisible(false);
  };

  const handleThemeToggle = () => {
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    dispatch(setLanguage(code));
    i18n.changeLanguage(code);
    setLanguageModalVisible(false);
  };

  const handleCurrencySelect = (code: string) => {
    dispatch(setCurrency(code));
    setCurrencyModalVisible(false);
  };

  const currentCurrency = currencies.find(c => c.code === settings.currencyCode) || currencies[0];
  const currentLanguage = LANGUAGES.find(l => l.code === settings.language) || LANGUAGES[0];

  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.textPrimary, paddingTop: spacing.massive }]}>
          👤 {t('profile')}
        </Text>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary + '30' }]}>
            <Text style={styles.avatarLargeText}>
              {(user?.first_name?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            📧 {user?.email}
          </Text>
          <Text style={[styles.userMeta, { color: colors.textTertiary }]}>
            {t('member_since')}: {memberSince}
          </Text>
        </View>

        {/* App Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            📊 {t('app_stats')}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {totalItems}
              </Text>
              <Text style={[styles.statName, { color: colors.textSecondary }]}>
                {t('items_tracked')}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>
                {totalPurchases}
              </Text>
              <Text style={[styles.statName, { color: colors.textSecondary }]}>
                {t('purchases_tracked')}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            ⚙️ {t('settings')}
          </Text>

          {/* Theme Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </Text>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                {theme === 'dark' ? t('dark_mode') : t('light_mode')}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#ddd', true: colors.primary + '60' }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>

          {/* Language */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                {t('language')}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {currentLanguage.nativeLabel} ▶
            </Text>
          </TouchableOpacity>

          {/* Currency */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💰</Text>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                {t('currency')}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {currentCurrency.symbol} {currentCurrency.code} ▶
            </Text>
          </TouchableOpacity>

          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                {t('notifications')}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={() => { dispatch(toggleNotifications()); }}
              trackColor={{ false: '#ddd', true: colors.primary + '60' }}
              thumbColor={settings.notificationsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.danger }]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            🚪 {t('logout')}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          {t('app_version')}: 1.0.0
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout Confirmation */}
      <CustomModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
        title={t('logout_confirm_title')}
        message={t('logout_confirm_msg')}
        type="warning"
        confirmText={t('logout')}
        cancelText={t('cancel')}
      />

      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              🌐 {t('language')}
            </Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    settings.language === item.code && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => handleLanguageSelect(item.code as LanguageCode)}
                >
                  <Text style={[styles.pickerItemLabel, { color: colors.textPrimary }]}>
                    {item.nativeLabel}
                  </Text>
                  <Text style={[styles.pickerItemSub, { color: colors.textSecondary }]}>
                    {item.label}
                  </Text>
                  {settings.language === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>
                {t('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              💰 {t('currency')}
            </Text>
            <FlatList
              data={currencies}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    settings.currencyCode === item.code && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => handleCurrencySelect(item.code)}
                >
                  <Text style={[styles.pickerItemLabel, { color: colors.textPrimary }]}>
                    {item.symbol} {item.code}
                  </Text>
                  <Text style={[styles.pickerItemSub, { color: colors.textSecondary }]}>
                    {item.name}
                  </Text>
                  {settings.currencyCode === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>
                {t('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  title: { ...typography.title, marginBottom: spacing.xl },
  // User card
  userCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLargeText: { fontSize: 32, color: '#6C63FF', fontWeight: '700' },
  userName: { ...typography.title },
  userEmail: { ...typography.body, marginTop: spacing.xs },
  userMeta: { ...typography.caption, marginTop: spacing.xs },
  // Stats
  statsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', gap: spacing.lg },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { ...typography.amount },
  statName: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
  // Settings
  settingsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { fontSize: 18, marginRight: spacing.md },
  settingLabel: { ...typography.body },
  settingValue: { ...typography.captionBold },
  // Logout
  logoutBtn: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoutText: { ...typography.bodyBold },
  version: { ...typography.caption, textAlign: 'center' },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.title, marginBottom: spacing.lg },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  pickerItemLabel: { ...typography.bodyBold, flex: 1 },
  pickerItemSub: { ...typography.caption },
  checkmark: { color: '#6C63FF', fontSize: 18, marginLeft: spacing.md },
  modalClose: { alignItems: 'center', paddingVertical: spacing.lg },
  modalCloseText: { ...typography.body },
});

export default ProfileScreen;
