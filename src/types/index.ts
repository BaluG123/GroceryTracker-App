// ============================================================
// TypeScript interfaces for all API request/response shapes
// ============================================================

// Auth
export type AuthMode = 'authenticated' | 'guest';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
  reset_question?: string;
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
  reset_question?: string;
  reset_answer?: string;
}

export interface ForgotPasswordPayload {
  username: string;
  reset_answer: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ConfigureResetPayload {
  reset_question: string;
  reset_answer: string;
}

// Items
export type UnitType = string;
export type Category = string;

export interface ExpenseItem {
  id: number;
  name: string;
  unit_type: UnitType;
  unit_label?: string;
  default_price_per_unit: string; // Decimal string from API
  category: Category;
  description?: string;
  is_active?: boolean;
  purchase_count: number;
  total_spent: string;
}

export type GroceryItem = ExpenseItem;

export interface CreateItemPayload {
  name: string;
  unit_type: UnitType;
  default_price_per_unit: number;
  category: Category;
  description?: string;
  is_active?: boolean;
}

export interface UpdateItemPayload {
  name?: string;
  unit_type?: UnitType;
  default_price_per_unit?: number;
  category?: Category;
  description?: string;
  is_active?: boolean;
}

// Purchases
export interface Purchase {
  id: number;
  item: number | null;
  item_name: string;
  item_unit_type: UnitType;
  item_category?: Category;
  quantity: string;
  price_per_unit: string;
  total_price: string;
  purchased_at: string; // ISO datetime
  notes: string;
  merchant_name?: string;
  payment_method?: string;
  currency_code?: string;
  location?: string;
}

export interface CreatePurchasePayload {
  item?: number | null;
  item_name?: string;
  item_unit_type?: UnitType;
  item_category?: Category;
  quantity: number;
  price_per_unit?: number;
  purchased_at?: string;
  notes?: string;
  merchant_name?: string;
  payment_method?: string;
  currency_code?: string;
  location?: string;
}

export interface UpdatePurchasePayload {
  item?: number | null;
  item_name?: string;
  item_unit_type?: UnitType;
  item_category?: Category;
  quantity?: number;
  price_per_unit?: number;
  purchased_at?: string;
  notes?: string;
  merchant_name?: string;
  payment_method?: string;
  currency_code?: string;
  location?: string;
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
  month?: number;
  year?: number;
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
  id?: number;
  item_name: string;
  unit_type?: UnitType;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  time: string;
  notes: string;
  merchant_name?: string;
  payment_method?: string;
  currency_code?: string;
  location?: string;
}

export interface DailyBreakdownSingle {
  date: string;
  total_spent: number;
  purchase_count?: number;
  purchases: DailyPurchaseDetail[];
}

export interface DailyBreakdownDay {
  date: string;
  total_spent: number;
  purchase_count?: number;
  purchases: DailyPurchaseDetail[];
}

export interface DailyBreakdownMonth {
  month?: number;
  year?: number;
  month_total: number;
  days: DailyBreakdownDay[];
}

export interface GuestExpenseData {
  items: ExpenseItem[];
  purchases: Purchase[];
  nextItemId: number;
  nextPurchaseId: number;
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
