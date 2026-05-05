import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  buildGuestMonthlySummary,
  createGuestItem,
  createGuestPurchase,
  listGuestItems,
  listGuestPurchases,
} from '../src/services/guestExpenseStorage';

describe('guest expense storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('stores guest expense items and purchases locally', async () => {
    const item = await createGuestItem({
      name: 'Coffee',
      unit_type: 'cup',
      default_price_per_unit: 40,
      category: 'dining',
      description: 'Morning coffee',
    });

    await createGuestPurchase({
      item: item.id,
      quantity: 2,
      price_per_unit: 40,
      merchant_name: 'Cafe',
      currency_code: 'INR',
    });

    const items = await listGuestItems();
    const purchases = await listGuestPurchases();
    const summary = await buildGuestMonthlySummary(
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );

    expect(items).toHaveLength(1);
    expect(items[0].purchase_count).toBe(1);
    expect(items[0].total_spent).toBe('80.00');
    expect(purchases).toHaveLength(1);
    expect(purchases[0].item_name).toBe('Coffee');
    expect(summary.total_purchases).toBe(1);
    expect(summary.total_spent).toBe(80);
  });

  it('supports custom one-off expenses without a saved item', async () => {
    await createGuestPurchase({
      item: null,
      item_name: 'Metro Ticket',
      item_unit_type: 'ticket',
      item_category: 'transport',
      quantity: 1,
      price_per_unit: 25,
      payment_method: 'upi',
      currency_code: 'INR',
    });

    const purchases = await listGuestPurchases();

    expect(purchases).toHaveLength(1);
    expect(purchases[0].item).toBeNull();
    expect(purchases[0].item_name).toBe('Metro Ticket');
    expect(purchases[0].item_category).toBe('transport');
    expect(purchases[0].total_price).toBe('25.00');
  });
});
