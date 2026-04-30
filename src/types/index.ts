// ============================================================
// TypeScript interfaces for all API request/response shapes
// ============================================================

// Auth
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Items
export type UnitType =
  | 'litre'
  | 'ml'
  | 'kg'
  | 'gram'
  | 'packet'
  | 'piece'
  | 'dozen'
  | 'bundle'
  | 'box'
  | 'bottle'
  | 'can'
  | 'other';

export type Category =
  | 'dairy'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'snacks'
  | 'beverages'
  | 'household'
  | 'other';

export interface GroceryItem {
  id: number;
  name: string;
  unit_type: UnitType;
  default_price_per_unit: string; // Decimal string from API
  category: Category;
  purchase_count: number;
  total_spent: string;
}

export interface CreateItemPayload {
  name: string;
  unit_type: UnitType;
  default_price_per_unit: number;
  category: Category;
}

export interface UpdateItemPayload {
  name?: string;
  unit_type?: UnitType;
  default_price_per_unit?: number;
  category?: Category;
}

// Purchases
export interface Purchase {
  id: number;
  item: number;
  item_name: string;
  item_unit_type: UnitType;
  quantity: string;
  price_per_unit: string;
  total_price: string;
  purchased_at: string; // ISO datetime
  notes: string;
}

export interface CreatePurchasePayload {
  item: number;
  quantity: number;
  price_per_unit: number;
  purchased_at?: string;
  notes?: string;
}

export interface UpdatePurchasePayload {
  item?: number;
  quantity?: number;
  price_per_unit?: number;
  purchased_at?: string;
  notes?: string;
}

export interface PurchaseFilters {
  item?: number;
  item_name?: string;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
  page?: number;
}

// Reports
export interface ItemBreakdown {
  item_name: string;
  unit_type: UnitType;
  times_bought: number;
  total_quantity: number;
  total_spent: number;
}

export interface DailyBreakdownEntry {
  date: string;
  total_spent: number;
  purchase_count: number;
}

export interface MonthlySummary {
  total_spent: number;
  total_purchases: number;
  item_breakdown: ItemBreakdown[];
  daily_breakdown: DailyBreakdownEntry[];
}

export interface ItemFrequencyEntry {
  item_name: string;
  category: Category;
  times_bought: number;
  total_quantity: number;
  total_spent: number;
  avg_price_per_unit: number;
}

export interface ItemFrequencyReport {
  items: ItemFrequencyEntry[];
}

export interface DailyPurchaseDetail {
  item_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  time: string;
  notes: string;
}

export interface DailyBreakdownSingle {
  date: string;
  total_spent: number;
  purchases: DailyPurchaseDetail[];
}

export interface DailyBreakdownDay {
  date: string;
  total_spent: number;
  purchases: DailyPurchaseDetail[];
}

export interface DailyBreakdownMonth {
  month_total: number;
  days: DailyBreakdownDay[];
}

// Paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Currency
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

// Settings
export type ThemeMode = 'dark' | 'light';
export type LanguageCode =
  | 'en'
  | 'hi'
  | 'kn'
  | 'te'
  | 'ta'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or'
  | 'ur';
