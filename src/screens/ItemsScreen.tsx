import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchItems, createItem, deleteItem, updateItem } from '../store/slices/itemsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatPrice } from '../utils/currency';
import {
  categoryLabels,
  categoryIcons,
  categoryColors,
  unitTypeLabels,
  unitTypeIcons,
} from '../utils/helpers';
import { Category, UnitType, GroceryItem } from '../types';
import CustomModal from '../components/common/CustomModal';
import GradientButton from '../components/common/GradientButton';
import CategoryChip from '../components/common/CategoryChip';
import EmptyState from '../components/common/EmptyState';
import FAB from '../components/common/FAB';
import { ListItemSkeleton } from '../components/common/SkeletonLoader';
import OfflineBanner from '../components/common/OfflineBanner';

const CATEGORIES: Category[] = [
  'dairy', 'vegetables', 'fruits', 'grains',
  'snacks', 'beverages', 'household', 'other',
];

const UNIT_TYPES: UnitType[] = [
  'kg', 'gram', 'litre', 'ml', 'packet', 'piece',
  'dozen', 'bundle', 'box', 'bottle', 'can', 'other',
];

const ItemsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, isLoading, isCreating } = useAppSelector(state => state.items);
  const { currencyCode } = useAppSelector(state => state.settings);
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add/Edit form state
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState<UnitType>('kg');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('vegetables');

  useEffect(() => {
    dispatch(fetchItems(1));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchItems(1));
    setRefreshing(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditItem(null);
    setFormName('');
    setFormUnit('kg');
    setFormPrice('');
    setFormCategory('vegetables');
    setShowAddModal(true);
  };

  const openEditModal = (item: GroceryItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormUnit(item.unit_type);
    setFormPrice(parseFloat(item.default_price_per_unit).toString());
    setFormCategory(item.category);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice) {return;}
    try {
      if (editItem) {
        await dispatch(updateItem({
          id: editItem.id,
          payload: {
            name: formName.trim(),
            unit_type: formUnit,
            default_price_per_unit: parseFloat(formPrice),
            category: formCategory,
          },
        })).unwrap();
        Toast.show({ type: 'success', text1: t('success'), text2: t('edit_item') });
      } else {
        await dispatch(createItem({
          name: formName.trim(),
          unit_type: formUnit,
          default_price_per_unit: parseFloat(formPrice),
          category: formCategory,
        })).unwrap();
        Toast.show({ type: 'success', text1: t('success'), text2: t('add_item') });
      }
      setShowAddModal(false);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('error'), text2: err || t('something_went_wrong') });
    }
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await dispatch(deleteItem(itemToDelete));
      setDeleteModalVisible(false);
      Toast.show({ type: 'success', text1: t('success'), text2: 'Item deleted' });
    }
  };

  const renderRightActions = (id: number) => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: colors.danger }]}
      onPress={() => confirmDelete(id)}
    >
      <Text style={styles.swipeText}>🗑️ {t('delete')}</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (item: GroceryItem) => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: '#3B82F6' }]}
      onPress={() => openEditModal(item)}
    >
      <Text style={styles.swipeText}>✏️ {t('edit')}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      renderLeftActions={() => renderLeftActions(item)}
      overshootRight={false}
      overshootLeft={false}
    >
      <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
        <View style={[styles.itemIcon, { backgroundColor: categoryColors[item.category] + '20' }]}>
          <Text style={styles.itemEmoji}>{categoryIcons[item.category]}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: colors.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
            {unitTypeIcons[item.unit_type]} {unitTypeLabels[item.unit_type]} · {formatPrice(item.default_price_per_unit, currencyCode)}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemSpent, { color: colors.primary }]}>
            {formatPrice(item.total_spent, currencyCode)}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {item.purchase_count}×
            </Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />

      {/* Header */}
      <View style={[styles.header, { paddingTop: spacing.massive }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          📦 {t('my_items')}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t('search_items')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
      >
        <CategoryChip
          label={t('all')}
          isSelected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
        />
        {CATEGORIES.map(cat => (
          <CategoryChip
            key={cat}
            label={t(cat)}
            icon={categoryIcons[cat]}
            isSelected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
            color={categoryColors[cat]}
          />
        ))}
      </ScrollView>

      {/* Items List */}
      {isLoading && items.length === 0 ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map(i => (
            <ListItemSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title={t('no_items')}
              description={t('no_items_desc')}
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
        />
      )}

      <FAB onPress={openAddModal} />

      {/* Delete Modal */}
      <CustomModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        title={t('delete_confirm_title')}
        message={t('delete_confirm_msg')}
        type="delete"
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editItem ? t('edit_item') : t('add_item')}
            </Text>

            {/* Item name */}
            <View style={[styles.formInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.formInputText, { color: colors.textPrimary }]}
                placeholder={t('item_name')}
                placeholderTextColor={colors.textTertiary}
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            {/* Unit Type */}
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
              {t('unit_type')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
              {UNIT_TYPES.map(unit => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setFormUnit(unit)}
                  style={[
                    styles.unitChip,
                    {
                      backgroundColor: formUnit === unit ? colors.primary + '20' : colors.inputBackground,
                      borderColor: formUnit === unit ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14 }}>{unitTypeIcons[unit]}</Text>
                  <Text
                    style={[
                      styles.unitLabel,
                      { color: formUnit === unit ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {unitTypeLabels[unit]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Default Price */}
            <View style={[styles.formInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₹</Text>
              <TextInput
                style={[styles.formInputText, { color: colors.textPrimary }]}
                placeholder={t('default_price')}
                placeholderTextColor={colors.textTertiary}
                value={formPrice}
                onChangeText={setFormPrice}
                keyboardType="numeric"
              />
            </View>

            {/* Category */}
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
              {t('select_category')}
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <CategoryChip
                  key={cat}
                  label={t(cat)}
                  icon={categoryIcons[cat]}
                  isSelected={formCategory === cat}
                  onPress={() => setFormCategory(cat)}
                  color={categoryColors[cat]}
                />
              ))}
            </View>

            <GradientButton
              title={editItem ? t('save') : t('add_item')}
              onPress={handleSubmit}
              loading={isCreating}
              disabled={!formName.trim() || !formPrice}
              style={{ marginTop: spacing.lg }}
            />

            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.title },
  searchContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body },
  chipScroll: { maxHeight: 50, marginBottom: spacing.sm },
  chipContainer: { paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  skeletonList: { paddingHorizontal: spacing.lg },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 20 },
  itemContent: { flex: 1, marginLeft: spacing.md },
  itemName: { ...typography.bodyBold },
  itemMeta: { ...typography.caption, marginTop: spacing.xxs },
  itemRight: { alignItems: 'flex-end' },
  itemSpent: { ...typography.bodyBold },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xxs,
  },
  countText: { ...typography.small },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  swipeText: { color: '#FFFFFF', ...typography.captionBold },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.massive,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: { ...typography.title, marginBottom: spacing.xxl },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    height: 52,
    marginBottom: spacing.lg,
  },
  formInputText: { flex: 1, ...typography.body },
  currencySymbol: { ...typography.bodyBold, marginRight: spacing.sm },
  formLabel: { ...typography.captionBold, marginBottom: spacing.sm },
  unitScroll: { maxHeight: 44, marginBottom: spacing.lg },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: 4,
  },
  unitLabel: { ...typography.caption },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  closeButton: { alignItems: 'center', marginTop: spacing.lg },
  closeText: { ...typography.body },
});

export default ItemsScreen;
