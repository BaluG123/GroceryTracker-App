import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import GradientButton from '../components/common/GradientButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchItems } from '../store/slices/itemsSlice';
import { createPurchase, fetchPurchases } from '../store/slices/purchasesSlice';
import { fetchItemFrequency, fetchMonthlySummary } from '../store/slices/reportsSlice';
import { darkColors, lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { GroceryItem } from '../types';
import { formatPrice } from '../utils/currency';
import { getCurrentMonth, getCurrentYear } from '../utils/date';
import {
  expenseCategories,
  expenseUnits,
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
  getUnitIcon,
  getUnitLabel,
} from '../utils/helpers';

const paymentMethods = ['cash', 'upi', 'card', 'bank', 'wallet'];

const AddPurchaseScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.items);
  const { isCreating } = useAppSelector(state => state.purchases);
  const { currencyCode, theme } = useAppSelector(state => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('groceries');
  const [unitType, setUnitType] = useState('unit');
  const [quantity, setQuantity] = useState('1');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchItems(1));
    }
  }, [dispatch, items.length]);

  const filteredItems = useMemo(
    () => items.filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase())),
    [itemSearch, items],
  );

  const qty = Number.parseFloat(quantity) || 0;
  const price = Number.parseFloat(pricePerUnit) || 0;
  const totalPrice = qty * price;

  const selectItem = (item: GroceryItem) => {
    setSelectedItem(item);
    setItemName(item.name);
    setCategory(item.category);
    setUnitType(item.unit_type);
    setPricePerUnit(String(Number.parseFloat(item.default_price_per_unit) || 0));
    setShowPicker(false);
    setItemSearch('');
  };

  const openSavedItemPicker = () => {
    dispatch(fetchItems(1));
    setShowPicker(true);
  };

  const clearSelectedItem = () => {
    setSelectedItem(null);
  };

  const canSubmit = itemName.trim() && qty > 0 && price > 0;

  const resetForm = () => {
    setSelectedItem(null);
    setItemName('');
    setCategory('groceries');
    setUnitType('unit');
    setQuantity('1');
    setPricePerUnit('');
    setMerchantName('');
    setPaymentMethod('cash');
    setLocation('');
    setNotes('');
    setShowAdvanced(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await dispatch(
        createPurchase({
          item: selectedItem?.id ?? null,
          item_name: itemName.trim(),
          item_unit_type: unitType,
          item_category: category,
          quantity: qty,
          price_per_unit: price,
          notes: notes.trim() || undefined,
          merchant_name: merchantName.trim() || undefined,
          payment_method: paymentMethod,
          currency_code: currencyCode,
          location: location.trim() || undefined,
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Expense saved',
        text2: `${itemName.trim()} • ${formatPrice(totalPrice, currencyCode)}`,
      });
      resetForm();
      const month = getCurrentMonth();
      const year = getCurrentYear();
      dispatch(fetchPurchases({ month, year, page: 1 }));
      dispatch(fetchMonthlySummary({ month, year }));
      dispatch(fetchItemFrequency({ month, year }));
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: String(error) });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.textPrimary }]}>New expense</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Capture a one-off spend or use a saved item for faster entry.
          </Text>

          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={openSavedItemPicker}
          >
            <View>
              <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>Saved item</Text>
              <Text style={[styles.selectorValue, { color: colors.textPrimary }]}>
                {selectedItem ? selectedItem.name : 'Choose from your expense items'}
              </Text>
            </View>
            <Text style={[styles.selectorArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>

          {selectedItem ? (
            <TouchableOpacity onPress={clearSelectedItem} style={styles.clearLink}>
              <Text style={[styles.clearText, { color: colors.primary }]}>Use as a custom one-off instead</Text>
            </TouchableOpacity>
          ) : null}

          <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.inputText, { color: colors.textPrimary }]}
              placeholder="Expense name"
              placeholderTextColor={colors.textTertiary}
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {expenseCategories.map(entry => (
              <TouchableOpacity
                key={entry}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: category === entry ? getCategoryColor(entry) + '20' : colors.card,
                    borderColor: category === entry ? getCategoryColor(entry) : colors.border,
                  },
                ]}
                onPress={() => setCategory(entry)}
              >
                <Text style={styles.categoryEmoji}>{getCategoryIcon(entry)}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    { color: category === entry ? getCategoryColor(entry) : colors.textSecondary },
                  ]}
                >
                  {getCategoryLabel(entry)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {expenseUnits.map(entry => (
              <TouchableOpacity
                key={entry}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: unitType === entry ? colors.primary + '18' : colors.card,
                    borderColor: unitType === entry ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setUnitType(entry)}
              >
                <Text style={styles.categoryEmoji}>{getUnitIcon(entry)}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    { color: unitType === entry ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {getUnitLabel(entry)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={[styles.input, styles.rowField, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Quantity"
                placeholderTextColor={colors.textTertiary}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.input, styles.rowField, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                {currencyCode === 'INR' ? '₹' : currencyCode}
              </Text>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Price per unit"
                placeholderTextColor={colors.textTertiary}
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              {formatPrice(totalPrice, currencyCode)}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setShowAdvanced(value => !value)} style={styles.advancedToggle}>
            <Text style={[styles.advancedText, { color: colors.primary }]}>
              {showAdvanced ? 'Hide details' : 'Add merchant, payment, and notes'}
            </Text>
          </TouchableOpacity>

          {showAdvanced ? (
            <>
              <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.textPrimary }]}
                  placeholder="Merchant or payee"
                  placeholderTextColor={colors.textTertiary}
                  value={merchantName}
                  onChangeText={setMerchantName}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setPaymentMethod(method)}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: paymentMethod === method ? colors.secondary + '20' : colors.card,
                        borderColor: paymentMethod === method ? colors.secondary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: paymentMethod === method ? colors.secondary : colors.textSecondary },
                      ]}
                    >
                      {method.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.textPrimary }]}
                  placeholder="Location"
                  placeholderTextColor={colors.textTertiary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={[styles.notesInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.notesText, { color: colors.textPrimary }]}
                  placeholder="Notes"
                  placeholderTextColor={colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </>
          ) : null}

          <GradientButton
            title="Save expense"
            onPress={handleSubmit}
            loading={isCreating}
            disabled={!canSubmit}
            style={{ marginTop: spacing.xxl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {showPicker ? (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Pick a saved item</Text>

            <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.textPrimary }]}
                placeholder="Search saved items"
                placeholderTextColor={colors.textTertiary}
                value={itemSearch}
                onChangeText={setItemSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickRow, { borderBottomColor: colors.border }]}
                  onPress={() => selectItem(item)}
                >
                  <View>
                    <Text style={[styles.pickName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.pickMeta, { color: colors.textSecondary }]}>
                      {getUnitLabel(item.unit_type)} · {formatPrice(item.default_price_per_unit, currencyCode)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textSecondary }}>{getCategoryIcon(item.category)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No saved expense items found.
                </Text>
              }
            />

            <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closePicker}>
              <Text style={[styles.closePickerText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: spacing.xxl,
    paddingTop: spacing.massive + spacing.lg,
    paddingBottom: 120,
  },
  title: { ...typography.title },
  subtitle: { ...typography.body, marginTop: spacing.sm, marginBottom: spacing.xl },
  selector: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectorLabel: { ...typography.captionBold },
  selectorValue: { ...typography.bodyBold, marginTop: spacing.xxs },
  selectorArrow: { fontSize: 14 },
  clearLink: { marginBottom: spacing.lg },
  clearText: { ...typography.captionBold },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputText: { flex: 1, ...typography.body },
  sectionLabel: { ...typography.captionBold, marginBottom: spacing.sm },
  categoryRow: { paddingBottom: spacing.sm },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  categoryEmoji: { marginRight: 6 },
  categoryText: { ...typography.captionBold },
  row: { flexDirection: 'row', gap: spacing.md },
  rowField: { flex: 1 },
  currencySymbol: { ...typography.bodyBold, marginRight: spacing.sm },
  totalCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  totalLabel: { ...typography.captionBold },
  totalAmount: { ...typography.amount, marginTop: spacing.xs },
  advancedToggle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  advancedText: { ...typography.captionBold },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 104,
    marginBottom: spacing.lg,
  },
  notesText: { ...typography.body, minHeight: 80 },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    elevation: 1000,
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '72%',
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.title, marginBottom: spacing.lg },
  pickRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  pickName: { ...typography.bodyBold },
  pickMeta: { ...typography.caption, marginTop: spacing.xxs },
  emptyText: { ...typography.body, textAlign: 'center', paddingVertical: spacing.xl },
  closePicker: { alignItems: 'center', paddingTop: spacing.lg },
  closePickerText: { ...typography.body },
});

export default AddPurchaseScreen;
