import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/index';
import { fetchMonthlySummary, fetchItemFrequency } from '../store/slices/reportsSlice';
import { fetchPurchases } from '../store/slices/purchasesSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getGreeting, getCurrentMonth, getCurrentYear, formatDate, formatTime } from '../utils/date';
import { formatPrice } from '../utils/currency';
import { categoryColors } from '../utils/helpers';
import { ListItemSkeleton, CardSkeleton } from '../components/common/SkeletonLoader';
import OfflineBanner from '../components/common/OfflineBanner';
import { Category } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { monthlySummary, itemFrequency, isLoading } = useAppSelector((state: RootState) => state.reports);
  const { purchases } = useAppSelector((state: RootState) => state.purchases);
  const { currencyCode, theme } = useAppSelector((state: RootState) => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [refreshing, setRefreshing] = useState(false);

  const month = getCurrentMonth();
  const year = getCurrentYear();

  const loadData = useCallback(() => {
    dispatch(fetchMonthlySummary({ month, year }));
    dispatch(fetchItemFrequency({ month, year }));
    dispatch(fetchPurchases({ month, year }));
  }, [dispatch, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const totalSpent = monthlySummary?.total_spent || 0;
  const totalPurchases = monthlySummary?.total_purchases || 0;

  // Most bought item
  const mostBought = monthlySummary?.item_breakdown?.reduce(
    (max: any, item: any) => (item.times_bought > (max?.times_bought || 0) ? item : max),
    monthlySummary?.item_breakdown?.[0],
  );

  // Today's spending
  const today = new Date().toISOString().split('T')[0];
  const todayBreakdown = monthlySummary?.daily_breakdown?.find(
    (d: any) => d.date === today,
  );
  const todaySpent = todayBreakdown?.total_spent || 0;

  // Line chart data
  const chartData = monthlySummary?.daily_breakdown?.slice(-14) || [];
  const lineLabels = chartData.map((d: any) => {
    const day = new Date(d.date).getDate();
    return day.toString();
  });
  const lineValues = chartData.map((d: any) => d.total_spent || 0);

  // Pie chart data
  const categoryMap: Record<string, number> = {};
  itemFrequency?.items?.forEach((item: any) => {
    const cat = item.category || 'other';
    categoryMap[cat] = (categoryMap[cat] || 0) + item.total_spent;
  });

  const pieData = Object.entries(categoryMap).map(([key, value]) => ({
    name: t(key),
    amount: value,
    color: categoryColors[key as Category] || '#8B8BA7',
    legendFontColor: colors.textSecondary,
    legendFontSize: 11,
  }));

  // Recent purchases (last 5)
  const recentPurchases = purchases.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingContent}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user?.first_name || 'User'} 👋
            </Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Monthly Spending Card */}
        {isLoading && !monthlySummary ? (
          <CardSkeleton />
        ) : (
          <View style={[styles.spendingCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.spendingLabel, { color: colors.textSecondary }]}>
              {t('monthly_spending')}
            </Text>
            <Text style={[styles.spendingAmount, { color: colors.textPrimary }]}>
              {formatPrice(totalSpent, currencyCode)}
            </Text>
            <Text style={[styles.monthLabel, { color: colors.textTertiary }]}>
              {t('this_month')}
            </Text>

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((totalSpent / (totalSpent + 1000)) * 100, 100)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statIcon}>🛒</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalPurchases}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('total_purchases')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text
              style={[styles.statValue, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {mostBought?.item_name || '—'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('most_bought')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatPrice(todaySpent, currencyCode)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('today_spending')}
            </Text>
          </View>
        </View>

        {/* Spending Trend Chart */}
        {lineValues.length > 1 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              📈 {t('spending_trend')}
            </Text>
            <LineChart
              data={{
                labels: lineLabels.filter((_: any, i: number) => i % 2 === 0),
                datasets: [{ data: lineValues.length > 0 ? lineValues : [0] }],
              }}
              width={SCREEN_WIDTH - 64}
              height={180}
              yAxisLabel={currencyCode === 'INR' ? '₹' : ''}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                labelColor: () => colors.textSecondary,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#6C63FF',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Category Pie Chart */}
        {pieData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              🍩 {t('category_breakdown')}
            </Text>
            <PieChart
              data={pieData}
              width={SCREEN_WIDTH - 64}
              height={200}
              chartConfig={{
                color: () => colors.textPrimary,
                labelColor: () => colors.textSecondary,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Recent Purchases */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            🕐 {t('recent_purchases')}
          </Text>
        </View>

        {isLoading && recentPurchases.length === 0 ? (
          [1, 2, 3].map(i => <ListItemSkeleton key={i} />)
        ) : recentPurchases.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('no_purchases_desc')}
            </Text>
          </View>
        ) : (
          recentPurchases.map((purchase: any) => (
            <View
              key={purchase.id}
              style={[styles.purchaseItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.purchaseLeft}>
                <Text style={[styles.purchaseName, { color: colors.textPrimary }]}>
                  {purchase.item_name}
                </Text>
                <Text style={[styles.purchaseDetail, { color: colors.textSecondary }]}>
                  {purchase.quantity} {purchase.item_unit_type} × {formatPrice(purchase.price_per_unit, currencyCode)}
                </Text>
              </View>
              <View style={styles.purchaseRight}>
                <Text style={[styles.purchasePrice, { color: colors.primary }]}>
                  {formatPrice(purchase.total_price, currencyCode)}
                </Text>
                <Text style={[styles.purchaseTime, { color: colors.textTertiary }]}>
                  {formatTime(purchase.purchased_at)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.massive,
  },
  greetingContent: { flex: 1 },
  greeting: { ...typography.body },
  userName: { ...typography.title, marginTop: spacing.xxs },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...typography.subtitle, color: '#6C63FF' },
  spendingCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  spendingLabel: { ...typography.caption },
  spendingAmount: { ...typography.amountLarge, marginTop: spacing.xs },
  monthLabel: { ...typography.caption, marginTop: spacing.xs },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: { fontSize: 20, marginBottom: spacing.xs },
  statValue: { ...typography.bodyBold, textAlign: 'center' },
  statLabel: { ...typography.small, textAlign: 'center', marginTop: spacing.xxs },
  chartCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  chart: { borderRadius: 16, marginTop: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.subtitle },
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
  purchaseRight: { alignItems: 'flex-end' },
  purchasePrice: { ...typography.bodyBold },
  purchaseTime: { ...typography.small, marginTop: spacing.xxs },
  emptyCard: {
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emptyText: { ...typography.body },
});

export default DashboardScreen;
