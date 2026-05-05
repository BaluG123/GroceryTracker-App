import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Category,
  CreateItemPayload,
  CreatePurchasePayload,
  DailyBreakdownMonth,
  DailyBreakdownSingle,
  ExpenseItem,
  GuestExpenseData,
  ItemFrequencyReport,
  MonthlySummary,
  Purchase,
  UpdateItemPayload,
  UpdatePurchasePayload,
} from '../types';
import { KEYS } from '../utils/storage';

const DEFAULT_DATA: GuestExpenseData = {
  items: [],
  purchases: [],
  nextItemId: 1,
  nextPurchaseId: 1,
};

const parseAmount = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    return value;
  }
  return Number.parseFloat(value || '0') || 0;
};

const formatAmount = (value: number): string => value.toFixed(2);

const serializePurchase = (purchase: Purchase, item?: ExpenseItem | null): Purchase => ({
  ...purchase,
  item_name: purchase.item_name || item?.name || 'Expense',
  item_unit_type: purchase.item_unit_type || item?.unit_type || 'unit',
  item_category: purchase.item_category || item?.category || 'other',
  currency_code: purchase.currency_code || 'INR',
});

const hydrateItemTotals = (data: GuestExpenseData): ExpenseItem[] =>
  data.items.map(item => {
    const related = data.purchases.filter(p => p.item === item.id);
    const totalSpent = related.reduce((sum, purchase) => sum + parseAmount(purchase.total_price), 0);
    return {
      ...item,
      purchase_count: related.length,
      total_spent: formatAmount(totalSpent),
    };
  });

export const loadGuestExpenseData = async (): Promise<GuestExpenseData> => {
  const raw = await AsyncStorage.getItem(KEYS.GUEST_EXPENSE_DATA);
  if (!raw) {
    return DEFAULT_DATA;
  }

  try {
    const parsed = JSON.parse(raw) as GuestExpenseData;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      items: parsed.items || [],
      purchases: parsed.purchases || [],
    };
  } catch {
    return DEFAULT_DATA;
  }
};

export const saveGuestExpenseData = async (data: GuestExpenseData): Promise<void> => {
  await AsyncStorage.setItem(KEYS.GUEST_EXPENSE_DATA, JSON.stringify(data));
};

export const listGuestItems = async (): Promise<ExpenseItem[]> => {
  const data = await loadGuestExpenseData();
  return hydrateItemTotals(data).filter(item => item.is_active !== false);
};

export const createGuestItem = async (payload: CreateItemPayload): Promise<ExpenseItem> => {
  const data = await loadGuestExpenseData();
  const item: ExpenseItem = {
    id: data.nextItemId,
    name: payload.name.trim(),
    unit_type: payload.unit_type.trim().toLowerCase(),
    unit_label: payload.unit_type.trim().toLowerCase(),
    default_price_per_unit: formatAmount(payload.default_price_per_unit),
    category: payload.category.trim() || 'other',
    description: payload.description?.trim() || '',
    is_active: payload.is_active ?? true,
    purchase_count: 0,
    total_spent: '0.00',
  };
  data.items = [item, ...data.items];
  data.nextItemId += 1;
  await saveGuestExpenseData(data);
  return item;
};

export const updateGuestItem = async (
  id: number,
  payload: UpdateItemPayload,
): Promise<ExpenseItem> => {
  const data = await loadGuestExpenseData();
  const index = data.items.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Expense item not found');
  }

  const current = data.items[index];
  const updated: ExpenseItem = {
    ...current,
    ...payload,
    unit_type: payload.unit_type ? payload.unit_type.trim().toLowerCase() : current.unit_type,
    unit_label: payload.unit_type ? payload.unit_type.trim().toLowerCase() : current.unit_type,
    default_price_per_unit:
      payload.default_price_per_unit !== undefined
        ? formatAmount(payload.default_price_per_unit)
        : current.default_price_per_unit,
    category: payload.category?.trim() || current.category,
    description: payload.description ?? current.description,
  };
  data.items[index] = updated;
  await saveGuestExpenseData(data);
  return hydrateItemTotals(data).find(item => item.id === id)!;
};

export const deleteGuestItem = async (id: number): Promise<void> => {
  const data = await loadGuestExpenseData();
  data.items = data.items.map(item =>
    item.id === id ? { ...item, is_active: false } : item,
  );
  await saveGuestExpenseData(data);
};

export const listGuestPurchases = async (): Promise<Purchase[]> => {
  const data = await loadGuestExpenseData();
  const itemMap = new Map(data.items.map(item => [item.id, item]));
  return data.purchases
    .map(purchase => serializePurchase(purchase, purchase.item ? itemMap.get(purchase.item) : null))
    .sort((a, b) => b.purchased_at.localeCompare(a.purchased_at));
};

const buildPurchaseRecord = (
  data: GuestExpenseData,
  payload: CreatePurchasePayload | UpdatePurchasePayload,
  existing?: Purchase,
): Purchase => {
  const item = payload.item ? data.items.find(entry => entry.id === payload.item) : null;
  const quantity = payload.quantity !== undefined ? payload.quantity : parseAmount(existing?.quantity);
  const pricePerUnit =
    payload.price_per_unit !== undefined
      ? payload.price_per_unit
      : item
        ? parseAmount(item.default_price_per_unit)
        : parseAmount(existing?.price_per_unit);
  const itemName = payload.item_name?.trim() || item?.name || existing?.item_name || 'Expense';
  const itemUnitType =
    payload.item_unit_type?.trim().toLowerCase() ||
    item?.unit_type ||
    existing?.item_unit_type ||
    'unit';
  const itemCategory =
    payload.item_category?.trim() ||
    item?.category ||
    existing?.item_category ||
    'other';

  return {
    id: existing?.id || data.nextPurchaseId,
    item: item?.id ?? payload.item ?? existing?.item ?? null,
    item_name: itemName,
    item_unit_type: itemUnitType,
    item_category: itemCategory,
    quantity: formatAmount(quantity),
    price_per_unit: formatAmount(pricePerUnit),
    total_price: formatAmount(quantity * pricePerUnit),
    purchased_at: payload.purchased_at || existing?.purchased_at || new Date().toISOString(),
    notes: payload.notes?.trim() ?? existing?.notes ?? '',
    merchant_name: payload.merchant_name?.trim() ?? existing?.merchant_name ?? '',
    payment_method: payload.payment_method?.trim() ?? existing?.payment_method ?? '',
    currency_code: payload.currency_code?.toUpperCase() ?? existing?.currency_code ?? 'INR',
    location: payload.location?.trim() ?? existing?.location ?? '',
  };
};

export const createGuestPurchase = async (payload: CreatePurchasePayload): Promise<Purchase> => {
  const data = await loadGuestExpenseData();
  const purchase = buildPurchaseRecord(data, payload);
  data.purchases = [purchase, ...data.purchases];
  data.nextPurchaseId += 1;
  await saveGuestExpenseData(data);
  return purchase;
};

export const updateGuestPurchase = async (
  id: number,
  payload: UpdatePurchasePayload,
): Promise<Purchase> => {
  const data = await loadGuestExpenseData();
  const index = data.purchases.findIndex(purchase => purchase.id === id);
  if (index === -1) {
    throw new Error('Expense not found');
  }
  const updated = buildPurchaseRecord(data, payload, data.purchases[index]);
  data.purchases[index] = updated;
  await saveGuestExpenseData(data);
  return updated;
};

export const deleteGuestPurchase = async (id: number): Promise<void> => {
  const data = await loadGuestExpenseData();
  data.purchases = data.purchases.filter(purchase => purchase.id !== id);
  await saveGuestExpenseData(data);
};

export const buildGuestMonthlySummary = async (
  month: number,
  year: number,
): Promise<MonthlySummary> => {
  const purchases = (await listGuestPurchases()).filter(purchase => {
    const date = new Date(purchase.purchased_at);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const totalSpent = purchases.reduce((sum, purchase) => sum + parseAmount(purchase.total_price), 0);
  const itemGroups = new Map<string, { count: number; quantity: number; total: number; unit: string }>();
  const dayGroups = new Map<string, { total: number; count: number }>();

  purchases.forEach(purchase => {
    const itemKey = `${purchase.item_name}::${purchase.item_unit_type}`;
    const itemEntry = itemGroups.get(itemKey) || {
      count: 0,
      quantity: 0,
      total: 0,
      unit: purchase.item_unit_type,
    };
    itemEntry.count += 1;
    itemEntry.quantity += parseAmount(purchase.quantity);
    itemEntry.total += parseAmount(purchase.total_price);
    itemGroups.set(itemKey, itemEntry);

    const dayKey = purchase.purchased_at.slice(0, 10);
    const dayEntry = dayGroups.get(dayKey) || { total: 0, count: 0 };
    dayEntry.total += parseAmount(purchase.total_price);
    dayEntry.count += 1;
    dayGroups.set(dayKey, dayEntry);
  });

  return {
    month,
    year,
    total_spent: totalSpent,
    total_purchases: purchases.length,
    item_breakdown: Array.from(itemGroups.entries()).map(([key, value]) => ({
      item_name: key.split('::')[0],
      unit_type: value.unit,
      times_bought: value.count,
      total_quantity: value.quantity,
      total_spent: value.total,
    })).sort((a, b) => b.total_spent - a.total_spent),
    daily_breakdown: Array.from(dayGroups.entries())
      .map(([date, value]) => ({
        date,
        total_spent: value.total,
        purchase_count: value.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
};

export const buildGuestItemFrequency = async (
  month: number,
  year: number,
): Promise<ItemFrequencyReport> => {
  const summary = await buildGuestMonthlySummary(month, year);
  const purchases = (await listGuestPurchases()).filter(purchase => {
    const date = new Date(purchase.purchased_at);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const categoryByItem = new Map<string, Category>();
  purchases.forEach(purchase => {
    categoryByItem.set(purchase.item_name, purchase.item_category || 'other');
  });

  return {
    items: summary.item_breakdown.map(item => ({
      item_name: item.item_name,
      category: categoryByItem.get(item.item_name) || 'other',
      times_bought: item.times_bought,
      total_quantity: item.total_quantity,
      total_spent: item.total_spent,
      avg_price_per_unit: item.total_quantity ? item.total_spent / item.total_quantity : 0,
    })),
  };
};

export const buildGuestDailyBreakdown = async (
  month: number,
  year: number,
): Promise<DailyBreakdownMonth> => {
  const purchases = (await listGuestPurchases()).filter(purchase => {
    const date = new Date(purchase.purchased_at);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  const grouped = new Map<string, DailyBreakdownMonth['days'][number]>();
  purchases.forEach(purchase => {
    const key = purchase.purchased_at.slice(0, 10);
    const current = grouped.get(key) || {
      date: key,
      total_spent: 0,
      purchase_count: 0,
      purchases: [],
    };
    current.total_spent += parseAmount(purchase.total_price);
    current.purchase_count = (current.purchase_count || 0) + 1;
    current.purchases.push({
      id: purchase.id,
      item_name: purchase.item_name,
      unit_type: purchase.item_unit_type,
      quantity: parseAmount(purchase.quantity),
      price_per_unit: parseAmount(purchase.price_per_unit),
      total_price: parseAmount(purchase.total_price),
      time: new Date(purchase.purchased_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: purchase.notes,
      merchant_name: purchase.merchant_name,
      payment_method: purchase.payment_method,
      currency_code: purchase.currency_code,
      location: purchase.location,
    });
    grouped.set(key, current);
  });

  const days = Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  return {
    month,
    year,
    month_total: days.reduce((sum, day) => sum + day.total_spent, 0),
    days,
  };
};

export const buildGuestDailyBreakdownByDate = async (
  date: string,
): Promise<DailyBreakdownSingle> => {
  const purchases = (await listGuestPurchases()).filter(purchase => purchase.purchased_at.startsWith(date));
  const purchaseDetails = purchases.map(purchase => ({
    id: purchase.id,
    item_name: purchase.item_name,
    unit_type: purchase.item_unit_type,
    quantity: parseAmount(purchase.quantity),
    price_per_unit: parseAmount(purchase.price_per_unit),
    total_price: parseAmount(purchase.total_price),
    time: new Date(purchase.purchased_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    notes: purchase.notes,
    merchant_name: purchase.merchant_name,
    payment_method: purchase.payment_method,
    currency_code: purchase.currency_code,
    location: purchase.location,
  }));

  return {
    date,
    total_spent: purchaseDetails.reduce((sum, purchase) => sum + purchase.total_price, 0),
    purchase_count: purchaseDetails.length,
    purchases: purchaseDetails,
  };
};
