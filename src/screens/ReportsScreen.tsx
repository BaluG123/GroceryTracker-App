import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Share,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/index';
import {
  fetchMonthlySummary,
  fetchItemFrequency,
  fetchDailyBreakdown,
  setReportPeriod,
} from '../store/slices/reportsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatPrice } from '../utils/currency';
import { getMonthName } from '../utils/date';
import { getCategoryColor, getCategoryLabel, normalizeCategory } from '../utils/helpers';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import OfflineBanner from '../components/common/OfflineBanner';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 4;

const parseAmount = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  return Number.parseFloat(value || '0') || 0;
};

const ReportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    monthlySummary,
    itemFrequency,
    isLoading,
    selectedMonth,
    selectedYear,
  } = useAppSelector((state: RootState) => state.reports);
  const { currencyCode, theme } = useAppSelector((state: RootState) => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [activeTab, setActiveTab] = useState<'monthly' | 'items'>('monthly');
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(() => {
    dispatch(fetchMonthlySummary({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchItemFrequency({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchDailyBreakdown({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    dispatch(setReportPeriod({ month: newMonth, year: newYear }));
  };

  const totalSpent = parseAmount(monthlySummary?.total_spent);
  const totalExpenses = monthlySummary?.total_purchases || 0;

  // Line chart: daily spending trend
  const dailyData = monthlySummary?.daily_breakdown || [];
  const lineLabels = dailyData
    .filter((_: any, i: number) => i % 3 === 0)
    .map((d: any) => new Date(d.date).getDate().toString());
  const lineValues = dailyData.map((d: any) => parseAmount(d.total_spent));

  // Bar chart: top items
  const topItems = [...(itemFrequency?.items || [])]
    .sort((a: any, b: any) => parseAmount(b.total_spent) - parseAmount(a.total_spent))
    .slice(0, 6);
  const barLabels = topItems.map((i: any) => i.item_name.substring(0, 6));
  const barValues = topItems.map((i: any) => parseAmount(i.total_spent));

  // Pie chart: category breakdown
  const categoryMap: Record<string, number> = {};
  itemFrequency?.items?.forEach((item: any) => {
    const cat = normalizeCategory(item.category);
    const total = Number.parseFloat(String(item.total_spent || 0)) || 0;
    categoryMap[cat] = (categoryMap[cat] || 0) + total;
  });
  const pieData = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      name: getCategoryLabel(key),
      amount: value,
      color: getCategoryColor(key),
      legendFontColor: colors.textSecondary,
      legendFontSize: 11,
    }));

  const activeDays = dailyData.filter((day: any) => parseAmount(day.total_spent) > 0);
  const averageDailySpend = activeDays.length ? totalSpent / activeDays.length : 0;
  const peakDay = [...dailyData].sort(
    (a: any, b: any) => parseAmount(b.total_spent) - parseAmount(a.total_spent),
  )[0];
  const topCategory = pieData[0];
  const topCategoryShare = topCategory && totalSpent
    ? Math.round((topCategory.amount / totalSpent) * 100)
    : 0;
  const reportPulse = totalExpenses > 0
    ? `${activeDays.length} active days`
    : 'No activity yet';

  // Export report as text
  const handleExport = async () => {
    const reportText = `📊 ${getMonthName(selectedMonth)} ${selectedYear} Report\n\n` +
      `💰 Total Spent: ${formatPrice(totalSpent, currencyCode)}\n` +
      `🧾 Total Expenses: ${totalExpenses}\n\n` +
      `📦 Top Expense Items:\n` +
      topItems.map((item: any, i: number) => `${i + 1}. ${item.item_name} — ${formatPrice(item.total_spent, currencyCode)} (${item.times_bought}×)`).join('\n');

    try {
      await Share.share({ message: reportText });
    } catch {}
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: () => colors.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#6C63FF' },
    propsForBackgroundLines: {
      stroke: colors.border,
      strokeDasharray: '4 8',
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.14,
    barPercentage: 0.72,
    useShadowColorFromDataset: false,
  };

  const hasData = totalSpent > 0 || totalExpenses > 0;

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
          />
        }
      >
        {/* Header */}
        <Text
          style={[styles.title, { color: colors.textPrimary, paddingTop: spacing.massive }]}
        >
          📊 {t('analytics')}
        </Text>

        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow}>
            <Text style={[styles.arrowText, { color: colors.textSecondary }]}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
            <Text style={[styles.arrowText, { color: colors.textSecondary }]}>▶</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !monthlySummary ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !hasData ? (
          <EmptyState
            title={t('no_reports')}
            description={t('no_reports_desc')}
            icon="📊"
          />
        ) : (
          <>
            {/* Total Spending Card */}
            <View style={[styles.spendingCard, { backgroundColor: colors.card }]}>
              <View style={[styles.cardHalo, { backgroundColor: colors.primary + '18' }]} />
              <Text style={[styles.spendingLabel, { color: colors.textSecondary }]}>
                {t('total_spent_label')}
              </Text>
              <Text style={[styles.spendingAmount, { color: colors.textPrimary }]}>
                {formatPrice(totalSpent, currencyCode)}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>🛒</Text>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {totalExpenses}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {t('total_purchases')}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>📦</Text>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {itemFrequency?.items?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {t('items')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.insightGrid}>
              <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                <Text style={styles.insightIcon}>⚡</Text>
                <Text style={[styles.insightValue, { color: colors.textPrimary }]}>
                  {formatPrice(averageDailySpend, currencyCode)}
                </Text>
                <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                  Avg active day
                </Text>
              </View>
              <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                <Text style={styles.insightIcon}>🎯</Text>
                <Text style={[styles.insightValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {topCategory?.name || 'None'}
                </Text>
                <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                  {topCategoryShare ? `${topCategoryShare}% of spend` : reportPulse}
                </Text>
              </View>
              <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                <Text style={styles.insightIcon}>📌</Text>
                <Text style={[styles.insightValue, { color: colors.textPrimary }]}>
                  {peakDay ? formatPrice(parseAmount(peakDay.total_spent), currencyCode) : formatPrice(0, currencyCode)}
                </Text>
                <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                  Peak day
                </Text>
              </View>
            </View>

            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: colors.inputBackground }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'monthly' && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveTab('monthly')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === 'monthly' ? '#FFF' : colors.textSecondary,
                    },
                  ]}
                >
                  📈 {t('monthly')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'items' && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveTab('items')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === 'items' ? '#FFF' : colors.textSecondary,
                    },
                  ]}
                >
                  📦 {t('items')}
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'monthly' ? (
              <>
                {/* Line Chart — Daily Trend */}
                {lineValues.length > 1 && (
                  <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                    <View style={styles.chartHeader}>
                      <View>
                        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                          📈 {t('spending_trend')}
                        </Text>
                        <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                          Daily movement across {getMonthName(selectedMonth)}
                        </Text>
                      </View>
                      <View style={[styles.chartBadge, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[styles.chartBadgeText, { color: colors.primary }]}>
                          {activeDays.length} days
                        </Text>
                      </View>
                    </View>
                    <LineChart
                      data={{
                        labels: lineLabels,
                        datasets: [{ data: lineValues }],
                      }}
                      width={CHART_WIDTH}
                      height={214}
                      yAxisLabel=""
                      chartConfig={chartConfig}
                      bezier
                      fromZero
                      segments={4}
                      style={styles.chart}
                    />
                  </View>
                )}

                {/* Pie Chart — Category Breakdown */}
                {pieData.length > 0 && (
                  <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                    <View style={styles.chartHeader}>
                      <View>
                        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                          🍩 {t('category_breakdown')}
                        </Text>
                        <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                          Where this month’s money is going
                        </Text>
                      </View>
                    </View>
                    <PieChart
                      data={pieData}
                      width={CHART_WIDTH}
                      height={208}
                      chartConfig={chartConfig}
                      accessor="amount"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                    <View style={styles.categoryLegend}>
                      {pieData.slice(0, 5).map(category => (
                        <View key={category.name} style={styles.categoryLegendRow}>
                          <View style={styles.categoryLegendLeft}>
                            <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                            <Text style={[styles.legendName, { color: colors.textPrimary }]}>
                              {category.name}
                            </Text>
                          </View>
                          <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
                            {formatPrice(category.amount, currencyCode)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Bar Chart — Item Comparison */}
                {barValues.length > 0 && (
                  <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                    <View style={styles.chartHeader}>
                      <View>
                        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                          📊 {t('item_comparison')}
                        </Text>
                        <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                          Top spend drivers ranked by amount
                        </Text>
                      </View>
                    </View>
                    <BarChart
                      data={{
                        labels: barLabels,
                        datasets: [{ data: barValues }],
                      }}
                      width={CHART_WIDTH}
                      height={230}
                      yAxisLabel=""
                      yAxisSuffix=""
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
                      }}
                      fromZero
                      segments={4}
                      style={styles.chart}
                    />
                  </View>
                )}

                {/* Top Items List */}
                <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                    🏆 {t('top_items')}
                  </Text>
                  {topItems.map((item: any, index: number) => (
                    <View key={item.item_name} style={styles.topItemRow}>
                      <View style={styles.topItemLeft}>
                        <Text style={[styles.topItemRank, { color: colors.primary }]}>
                          #{index + 1}
                        </Text>
                        <View>
                          <Text
                            style={[styles.topItemName, { color: colors.textPrimary }]}
                          >
                            {item.item_name}
                          </Text>
                          <Text
                            style={[styles.topItemMeta, { color: colors.textSecondary }]}
                          >
                            {item.times_bought} {t('times_bought')} · {t('avg_price')}: {formatPrice(item.avg_price_per_unit, currencyCode)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.topItemSpent, { color: colors.secondary }]}>
                        {formatPrice(item.total_spent, currencyCode)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Export Button */}
            <TouchableOpacity
              style={[styles.exportBtn, { borderColor: colors.border }]}
              onPress={handleExport}
            >
              <Text style={[styles.exportText, { color: colors.primary }]}>
                📤 Share expense report
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  title: { ...typography.title, marginBottom: spacing.lg },
  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  monthArrow: { padding: spacing.sm },
  arrowText: { fontSize: 18 },
  monthLabel: { ...typography.subtitle },
  // Spending card
  spendingCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardHalo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -90,
    right: -40,
  },
  spendingLabel: { ...typography.caption },
  spendingAmount: { ...typography.amountLarge, marginTop: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.xxxl,
  },
  statItem: { alignItems: 'center' },
  statEmoji: { fontSize: 20 },
  statValue: { ...typography.bodyBold, marginTop: spacing.xxs },
  statLabel: { ...typography.small, marginTop: spacing.xxs },
  insightGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  insightCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 104,
  },
  insightIcon: {
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  insightValue: {
    ...typography.captionBold,
  },
  insightLabel: {
    ...typography.small,
    marginTop: spacing.xxs,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  tabText: { ...typography.captionBold },
  // Charts
  chartCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  chartTitle: { ...typography.bodyBold },
  chartSubtitle: { ...typography.small, marginTop: spacing.xxs },
  chartBadge: {
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chartBadgeText: { ...typography.small },
  chart: { borderRadius: 16, marginLeft: -spacing.sm },
  categoryLegend: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: spacing.sm,
  },
  categoryLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  categoryLegendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendName: { ...typography.captionBold },
  legendAmount: { ...typography.caption },
  // Top items
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  topItemRank: { ...typography.bodyBold, marginRight: spacing.md, width: 30 },
  topItemName: { ...typography.bodyBold },
  topItemMeta: { ...typography.small, marginTop: spacing.xxs },
  topItemSpent: { ...typography.bodyBold },
  // Export
  exportBtn: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  exportText: { ...typography.bodyBold },
});

export default ReportsScreen;
