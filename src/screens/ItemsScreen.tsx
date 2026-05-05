import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import CategoryChip from '../components/common/CategoryChip';
import CustomModal from '../components/common/CustomModal';
import EmptyState from '../components/common/EmptyState';
import FAB from '../components/common/FAB';
import GradientButton from '../components/common/GradientButton';
import OfflineBanner from '../components/common/OfflineBanner';
import { ListItemSkeleton } from '../components/common/SkeletonLoader';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createItem, deleteItem, fetchItems, updateItem } from '../store/slices/itemsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { GroceryItem, Category, UnitType } from '../types';
import { formatPrice } from '../utils/currency';
import {
  expenseCategories,
  expenseUnits,
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
  getUnitIcon,
  getUnitLabel,
} from '../utils/helpers';

const ItemsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, isCreating } = useAppSelector(state => state.items);
  const { currencyCode, theme } = useAppSelector(state => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState<UnitType>('unit');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('groceries');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    dispatch(fetchItems(1));
  }, [dispatch]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormName('');
    setFormUnit('unit');
    setFormPrice('');
    setFormCategory('groceries');
    setFormDescription('');
  };

  const openCreate = () => {
    resetForm();
    setShowEditor(true);
  };

  const openEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormUnit(item.unit_type);
    setFormPrice(String(Number.parseFloat(item.default_price_per_unit) || 0));
    setFormCategory(item.category);
    setFormDescription(item.description || '');
    setShowEditor(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchItems(1));
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice.trim()) {
      return;
    }

    try {
      if (editingItem) {
        await dispatch(
          updateItem({
            id: editingItem.id,
            payload: {
              name: formName.trim(),
              unit_type: formUnit,
              default_price_per_unit: Number.parseFloat(formPrice),
              category: formCategory,
              description: formDescription.trim(),
            },
          }),
        ).unwrap();
        Toast.show({ type: 'success', text1: 'Saved', text2: 'Expense item updated' });
      } else {
        await dispatch(
          createItem({
            name: formName.trim(),
            unit_type: formUnit,
            default_price_per_unit: Number.parseFloat(formPrice),
            category: formCategory,
            description: formDescription.trim(),
          }),
        ).unwrap();
        Toast.show({ type: 'success', text1: 'Created', text2: 'Expense item added' });
      }
      setShowEditor(false);
      resetForm();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: String(error) });
    }
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteVisible(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    await dispatch(deleteItem(itemToDelete));
    setDeleteVisible(false);
    Toast.show({ type: 'success', text1: 'Archived', text2: 'Expense item archived' });
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: colors.danger }]}
          onPress={() => confirmDelete(item.id)}
        >
          <Text style={styles.swipeText}>Archive</Text>
        </TouchableOpacity>
      )}
      renderLeftActions={() => (
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: colors.secondary }]}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.swipeText}>Edit</Text>
        </TouchableOpacity>
      )}
      overshootLeft={false}
      overshootRight={false}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Text style={styles.icon}>{getCategoryIcon(item.category)}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {getUnitIcon(item.unit_type)} {getUnitLabel(item.unit_type)} · {formatPrice(item.default_price_per_unit, currencyCode)}
          </Text>
          {!!item.description && (
            <Text style={[styles.description, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          <Text style={[styles.total, { color: colors.primary }]}>
            {formatPrice(item.total_spent, currencyCode)}
          </Text>
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {item.purchase_count} entries
          </Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OfflineBanner />

      <View style={[styles.header, { paddingTop: spacing.massive }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Expense items</Text>
          <TouchableOpacity
            onPress={openCreate}
            style={[styles.headerAddButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.headerAddText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Reusable templates for the things you spend on often.
        </Text>
      </View>

      <View style={[styles.filterPanel, { backgroundColor: colors.background }]}>
        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search expense items"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <CategoryChip label="All" isSelected={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
          {expenseCategories.map(category => (
            <CategoryChip
              key={category}
              label={getCategoryLabel(category)}
              icon={getCategoryIcon(category)}
              color={getCategoryColor(category)}
              isSelected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map(index => (
            <ListItemSkeleton key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              title="No expense items yet"
              description="Create reusable items like Rent, Coffee, Cab, Internet, or Vegetables."
              icon="🧾"
            />
          }
        />
      )}

      <FAB onPress={openCreate} />

      <CustomModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        title="Archive item?"
        message="This hides the item from your active list but keeps your expense history safe."
        type="warning"
        confirmText="Archive"
        cancelText="Cancel"
      />

      {showEditor ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editingItem ? 'Edit expense item' : 'New expense item'}
            </Text>

            <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Name"
                placeholderTextColor={colors.textTertiary}
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow}>
              {expenseUnits.map(unit => (
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
                  <Text style={styles.unitEmoji}>{getUnitIcon(unit)}</Text>
                  <Text style={[styles.unitLabel, { color: formUnit === unit ? colors.primary : colors.textSecondary }]}>
                    {getUnitLabel(unit)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₹</Text>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Default price"
                placeholderTextColor={colors.textTertiary}
                value={formPrice}
                onChangeText={setFormPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Description or usage"
                placeholderTextColor={colors.textTertiary}
                value={formDescription}
                onChangeText={setFormDescription}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {expenseCategories.map(category => (
                <CategoryChip
                  key={category}
                  label={getCategoryLabel(category)}
                  icon={getCategoryIcon(category)}
                  color={getCategoryColor(category)}
                  isSelected={formCategory === category}
                  onPress={() => setFormCategory(category)}
                />
              ))}
            </View>

            <GradientButton
              title={editingItem ? 'Save changes' : 'Create item'}
              onPress={handleSubmit}
              loading={isCreating}
              disabled={!formName.trim() || !formPrice.trim()}
              style={{ marginTop: spacing.lg }}
            />

            <TouchableOpacity onPress={() => setShowEditor(false)} style={styles.cancel}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTitle: { ...typography.title },
  headerAddButton: {
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerAddText: {
    ...typography.captionBold,
    color: '#FFF',
  },
  headerSubtitle: { ...typography.body, marginTop: spacing.xs },
  filterPanel: {
    zIndex: 10,
    elevation: 2,
    paddingBottom: spacing.xs,
  },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body },
  chips: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  skeletonList: { paddingHorizontal: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
  content: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: spacing.xxs },
  description: { ...typography.small, marginTop: spacing.xxs },
  right: { alignItems: 'flex-end', marginLeft: spacing.md },
  total: { ...typography.bodyBold },
  count: { ...typography.small, marginTop: spacing.xxs },
  swipeAction: {
    width: 88,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  swipeText: {
    ...typography.captionBold,
    color: '#FFF',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    elevation: 1000,
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.massive,
    maxHeight: '86%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: { ...typography.title, marginBottom: spacing.lg },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    height: 52,
    marginBottom: spacing.lg,
  },
  inputText: { flex: 1, ...typography.body },
  currencySymbol: { ...typography.bodyBold, marginRight: spacing.sm },
  label: { ...typography.captionBold, marginBottom: spacing.sm },
  unitRow: { maxHeight: 46, marginBottom: spacing.lg },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  unitEmoji: { marginRight: 6 },
  unitLabel: { ...typography.caption },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  cancel: { alignItems: 'center', marginTop: spacing.lg },
  cancelText: { ...typography.body },
});

export default ItemsScreen;
