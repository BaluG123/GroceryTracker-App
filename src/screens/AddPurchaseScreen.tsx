import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { fetchItems } from '../store/slices/itemsSlice';
import { createPurchase } from '../store/slices/purchasesSlice';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { formatPrice } from '../utils/currency';
import { unitTypeLabels } from '../utils/helpers';
import GradientButton from '../components/common/GradientButton';
import { GroceryItem } from '../types';

const AddPurchaseScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.items);
  const { isCreating } = useAppSelector((state: RootState) => state.purchases);
  const { currencyCode, theme } = useAppSelector((state: RootState) => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchItems(1));
    }
  }, [dispatch, items.length]);

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  const selectItem = (item: GroceryItem) => {
    setSelectedItem(item);
    setPricePerUnit(parseFloat(item.default_price_per_unit).toString());
    setShowItemPicker(false);
    setItemSearch('');
  };

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(pricePerUnit) || 0;
  const totalPrice = qty * price;

  const incrementQty = () => setQuantity((qty + 1).toString());
  const decrementQty = () => {
    if (qty > 0.5) {setQuantity((qty - 1 > 0 ? qty - 1 : 0.5).toString());}
  };

  const handleSubmit = async () => {
    if (!selectedItem || qty <= 0 || price <= 0) {return;}
    try {
      await dispatch(
        createPurchase({
          item: selectedItem.id,
          quantity: qty,
          price_per_unit: price,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();
      setShowSuccess(true);
      Toast.show({
        type: 'success',
        text1: '🎉 ' + t('success'),
        text2: t('purchase_added'),
      });
      // Reset form
      setTimeout(() => {
        setSelectedItem(null);
        setQuantity('1');
        setPricePerUnit('');
        setNotes('');
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: err || t('something_went_wrong'),
      });
    }
  };

  if (showSuccess) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
          {t('purchase_added')}
        </Text>
        <Text style={[styles.successAmount, { color: colors.secondary }]}>
          {formatPrice(totalPrice, currencyCode)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            ➕ {t('add_purchase')}
          </Text>

          {/* Item Picker */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('select_item')}
          </Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={() => setShowItemPicker(true)}
          >
            <Text
              style={[
                styles.pickerText,
                { color: selectedItem ? colors.textPrimary : colors.textTertiary },
              ]}
            >
              {selectedItem
                ? `${selectedItem.name} (${unitTypeLabels[selectedItem.unit_type]})`
                : t('search_items_picker')}
            </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>

          {/* Quantity with Stepper */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('quantity')}
          </Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={decrementQty}
              style={[styles.stepperBtn, { backgroundColor: colors.danger + '20' }]}
            >
              <Text style={[styles.stepperText, { color: colors.danger }]}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.qtyInput, { color: colors.textPrimary, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity
              onPress={incrementQty}
              style={[styles.stepperBtn, { backgroundColor: colors.secondary + '20' }]}
            >
              <Text style={[styles.stepperText, { color: colors.secondary }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Price Per Unit */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('price_per_unit')}
          </Text>
          <View style={[styles.priceInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₹</Text>
            <TextInput
              style={[styles.priceTextInput, { color: colors.textPrimary }]}
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Total Price */}
          <View style={[styles.totalCard, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              {t('total_price')}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              {formatPrice(totalPrice, currencyCode)}
            </Text>
          </View>

          {/* Notes */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('notes')}
          </Text>
          <TextInput
            style={[styles.notesInput, { color: colors.textPrimary, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('notes_placeholder')}
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <GradientButton
            title={t('submit')}
            icon="✅"
            onPress={handleSubmit}
            loading={isCreating}
            disabled={!selectedItem || qty <= 0 || price <= 0}
            style={{ marginTop: spacing.xxl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Item Picker Modal */}
      <Modal
        visible={showItemPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowItemPicker(false)}
      >
        <View style={[styles.pickerOverlay]}>
          <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
              {t('select_item')}
            </Text>
            <View style={[styles.pickerSearch, { backgroundColor: colors.inputBackground }]}>
              <Text style={{ marginRight: 8 }}>🔍</Text>
              <TextInput
                style={[styles.pickerSearchInput, { color: colors.textPrimary }]}
                placeholder={t('search_items')}
                placeholderTextColor={colors.textTertiary}
                value={itemSearch}
                onChangeText={setItemSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredItems}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectItem(item)}
                >
                  <Text style={[styles.pickerItemName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.pickerItemMeta, { color: colors.textSecondary }]}>
                    {unitTypeLabels[item.unit_type]} · {formatPrice(item.default_price_per_unit, currencyCode)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyPicker, { color: colors.textTertiary }]}>
                  {t('no_items')}
                </Text>
              }
            />
            <TouchableOpacity
              onPress={() => setShowItemPicker(false)}
              style={styles.pickerClose}
            >
              <Text style={[styles.pickerCloseText, { color: colors.textSecondary }]}>
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
  flex: { flex: 1 },
  scroll: {
    padding: spacing.xxl,
    paddingTop: spacing.massive + spacing.lg,
    paddingBottom: 120,
  },
  title: { ...typography.title, marginBottom: spacing.xxl },
  label: { ...typography.captionBold, marginBottom: spacing.sm },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  pickerText: { ...typography.body, flex: 1 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: { fontSize: 24, fontWeight: '700' },
  qtyInput: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...typography.subtitle,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    marginBottom: spacing.xl,
  },
  currencySymbol: { ...typography.bodyBold, marginRight: spacing.sm },
  priceTextInput: { flex: 1, ...typography.body },
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  totalLabel: { ...typography.caption },
  totalAmount: { ...typography.amount, marginTop: spacing.xs },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 80,
    ...typography.body,
    marginBottom: spacing.md,
  },
  // Success
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: { fontSize: 72, marginBottom: spacing.xl },
  successTitle: { ...typography.title, marginBottom: spacing.md },
  successAmount: { ...typography.amountLarge },
  // Picker modal
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContent: {
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
  pickerTitle: { ...typography.title, marginBottom: spacing.lg },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  pickerSearchInput: { flex: 1, ...typography.body },
  pickerItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  pickerItemName: { ...typography.bodyBold },
  pickerItemMeta: { ...typography.caption, marginTop: spacing.xxs },
  emptyPicker: { ...typography.body, textAlign: 'center', padding: spacing.xxl },
  pickerClose: { alignItems: 'center', paddingVertical: spacing.lg },
  pickerCloseText: { ...typography.body },
});

export default AddPurchaseScreen;
