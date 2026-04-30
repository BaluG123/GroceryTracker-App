import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPurchases, deletePurchase } from '../store/slices/purchasesSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatPrice } from '../utils/currency';
import { getRelativeDay, formatTime, getMonthName, getCurrentMonth, getCurrentYear } from '../utils/date';
import { unitTypeLabels } from '../utils/helpers';
import CustomModal from '../components/common/CustomModal';
import EmptyState from '../components/common/EmptyState';
import { ListItemSkeleton } from '../components/common/SkeletonLoader';
import OfflineBanner from '../components/common/OfflineBanner';
import { Purchase } from '../types';

const PurchaseHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { purchases, isLoading, hasMore, currentPage } = useAppSelector(
    state => state.purchases,
  );
  const { currencyCode } = useAppSelector(state => state.settings);
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);

  // Generate month list for horizontal selector
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: getMonthName(i + 1, true),
  }));

  const loadData = useCallback(() => {
    dispatch(fetchPurchases({ month: selectedMonth, year: selectedYear, page: 1 }));
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(
        fetchPurchases({
          month: selectedMonth,
          year: selectedYear,
          page: currentPage + 1,
        }),
      );
    }
  };

  // Group purchases by date
  const groupedPurchases = purchases.reduce<Record<string, Purchase[]>>(
    (groups, purchase) => {
      const date = purchase.purchased_at.substring(0, 10);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(purchase);
      return groups;
    },
    {},
  );

  const sections = Object.entries(groupedPurchases)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      title: date,
      dayTotal: data.reduce((sum, p) => sum + parseFloat(p.total_price), 0),
      data,
    }));

  const confirmDelete = (id: number) => {
    setPurchaseToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (purchaseToDelete) {
      await dispatch(deletePurchase(purchaseToDelete));
      setDeleteModalVisible(false);
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: 'Purchase deleted',
      });
    }
  };

  const renderRightActions = (id: number) => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: colors.danger }]}
      onPress={() => confirmDelete(id)}
    >
      <Text style={styles.swipeText}>🗑️</Text>
      <Text style={[styles.swipeLabel, { color: '#FFF' }]}>{t('delete')}</Text>
    </TouchableOpacity>
  );

  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <View style={[styles.purchaseItem, { backgroundColor: colors.card }]}>
        <View style={styles.purchaseLeft}>
          <Text style={[styles.purchaseName, { color: colors.textPrimary }]}>
            {item.item_name}
          </Text>
          <Text style={[styles.purchaseDetail, { color: colors.textSecondary }]}>
            {item.quantity} {unitTypeLabels[item.item_unit_type]} × {formatPrice(item.price_per_unit, currencyCode)}
          </Text>
          {item.notes ? (
            <Text
              style={[styles.purchaseNotes, { color: colors.textTertiary }]}
              numberOfLines={1}
            >
              📝 {item.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.purchaseRight}>
          <Text style={[styles.purchasePrice, { color: colors.primary }]}>
            {formatPrice(item.total_price, currencyCode)}
          </Text>
          <Text style={[styles.purchaseTime, { color: colors.textTertiary }]}>
            {formatTime(item.purchased_at)}
          </Text>
        </View>
      </View>
    </Swipeable>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; dayTotal: number };
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionDate, { color: colors.textPrimary }]}>
        {getRelativeDay(section.title)}
      </Text>
      <Text style={[styles.sectionTotal, { color: colors.secondary }]}>
        {formatPrice(section.dayTotal, currencyCode)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />

      {/* Header */}
      <View style={[styles.header, { paddingTop: spacing.massive }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          📊 {t('purchase_history')}
        </Text>
      </View>

      {/* Year selector */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
          <Text style={[styles.yearArrow, { color: colors.textSecondary }]}>
            ◀
          </Text>
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: colors.textPrimary }]}>
          {selectedYear}
        </Text>
        <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
          <Text style={[styles.yearArrow, { color: colors.textSecondary }]}>
            ▶
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <FlatList
        data={months}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.month.toString()}
        contentContainerStyle={styles.monthContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedMonth(item.month)}
            style={[
              styles.monthChip,
              {
                backgroundColor:
                  selectedMonth === item.month
                    ? colors.primary
                    : colors.inputBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.monthText,
                {
                  color:
                    selectedMonth === item.month
                      ? '#FFFFFF'
                      : colors.textSecondary,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.monthList}
      />

      {/* Purchase List */}
      {isLoading && purchases.length === 0 ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map(i => (
            <ListItemSkeleton key={i} />
          ))}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPurchaseItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              title={t('no_purchases')}
              description={t('no_purchases_desc')}
              icon="🛒"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
        />
      )}

      {/* Delete Modal */}
      <CustomModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        title={t('delete_purchase_title')}
        message={t('delete_purchase_msg')}
        type="delete"
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.title },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xl,
  },
  yearArrow: { fontSize: 16, padding: spacing.sm },
  yearText: { ...typography.subtitle },
  monthList: { maxHeight: 50 },
  monthContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  monthChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  monthText: { ...typography.captionBold },
  skeletonList: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  sectionDate: { ...typography.bodyBold },
  sectionTotal: { ...typography.bodyBold },
  purchaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  purchaseLeft: { flex: 1 },
  purchaseName: { ...typography.bodyBold },
  purchaseDetail: { ...typography.caption, marginTop: spacing.xxs },
  purchaseNotes: { ...typography.small, marginTop: spacing.xxs },
  purchaseRight: { alignItems: 'flex-end', marginLeft: spacing.md },
  purchasePrice: { ...typography.bodyBold },
  purchaseTime: { ...typography.small, marginTop: spacing.xxs },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  swipeText: { fontSize: 20 },
  swipeLabel: { ...typography.small, marginTop: 2 },
});

export default PurchaseHistoryScreen;
