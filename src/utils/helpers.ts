import { Category, UnitType } from '../types';

export const expenseCategories: Category[] = [
  'groceries',
  'transport',
  'dining',
  'bills',
  'shopping',
  'health',
  'lifestyle',
  'other',
];

export const expenseUnits: UnitType[] = [
  'unit',
  'kg',
  'gram',
  'litre',
  'ml',
  'trip',
  'ticket',
  'meal',
  'day',
  'month',
  'hour',
  'other',
];

const unitMetadata: Record<string, { label: string; icon: string }> = {
  unit: { label: 'Unit', icon: '🔹' },
  litre: { label: 'Litre', icon: '🫗' },
  ml: { label: 'mL', icon: '💧' },
  kg: { label: 'Kg', icon: '⚖️' },
  gram: { label: 'Gram', icon: '🔬' },
  packet: { label: 'Packet', icon: '📦' },
  piece: { label: 'Piece', icon: '🔹' },
  dozen: { label: 'Dozen', icon: '🥚' },
  bundle: { label: 'Bundle', icon: '🪢' },
  box: { label: 'Box', icon: '📦' },
  bottle: { label: 'Bottle', icon: '🍶' },
  can: { label: 'Can', icon: '🥫' },
  trip: { label: 'Trip', icon: '🚌' },
  ticket: { label: 'Ticket', icon: '🎟️' },
  meal: { label: 'Meal', icon: '🍽️' },
  day: { label: 'Day', icon: '📅' },
  month: { label: 'Month', icon: '🗓️' },
  hour: { label: 'Hour', icon: '⏱️' },
  other: { label: 'Other', icon: '📋' },
};

const categoryMetadata: Record<string, { label: string; icon: string; color: string }> = {
  groceries: { label: 'Groceries', icon: '🧺', color: '#2EC4B6' },
  transport: { label: 'Transport', icon: '🚌', color: '#3B82F6' },
  dining: { label: 'Dining', icon: '🍜', color: '#FF8C42' },
  bills: { label: 'Bills', icon: '💡', color: '#8B5CF6' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#FF4D6D' },
  health: { label: 'Health', icon: '🩺', color: '#06D6A0' },
  lifestyle: { label: 'Lifestyle', icon: '✨', color: '#F7B801' },
  other: { label: 'Other', icon: '📋', color: '#8B8BA7' },
  dairy: { label: 'Dairy', icon: '🥛', color: '#FFD93D' },
  vegetables: { label: 'Vegetables', icon: '🥬', color: '#00D4AA' },
  fruits: { label: 'Fruits', icon: '🍎', color: '#FF6B6B' },
  grains: { label: 'Grains', icon: '🌾', color: '#C9A96E' },
  snacks: { label: 'Snacks', icon: '🍪', color: '#FF8C42' },
  beverages: { label: 'Beverages', icon: '☕', color: '#3B82F6' },
  household: { label: 'Household', icon: '🏠', color: '#8B5CF6' },
};

export const unitTypeLabels: Record<string, string> = Object.fromEntries(
  Object.entries(unitMetadata).map(([key, value]) => [key, value.label]),
);

export const unitTypeIcons: Record<string, string> = Object.fromEntries(
  Object.entries(unitMetadata).map(([key, value]) => [key, value.icon]),
);

export const categoryLabels: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMetadata).map(([key, value]) => [key, value.label]),
);

export const categoryIcons: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMetadata).map(([key, value]) => [key, value.icon]),
);

export const categoryColors: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMetadata).map(([key, value]) => [key, value.color]),
);

export const getUnitLabel = (unit: string): string =>
  unitTypeLabels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);

export const getUnitIcon = (unit: string): string => unitTypeIcons[unit] || '📋';

export const getCategoryLabel = (category: string): string =>
  categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);

export const getCategoryIcon = (category: string): string => categoryIcons[category] || '📋';

export const getCategoryColor = (category: string): string => categoryColors[category] || '#8B8BA7';

// Password strength
export const getPasswordStrength = (
  password: string,
): { level: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 6) {score += 1;}
  if (password.length >= 8) {score += 1;}
  if (/[A-Z]/.test(password)) {score += 1;}
  if (/[0-9]/.test(password)) {score += 1;}
  if (/[^A-Za-z0-9]/.test(password)) {score += 1;}

  if (score <= 1) {return { level: score, label: 'Weak', color: '#FF6B6B' };}
  if (score <= 2) {return { level: score, label: 'Fair', color: '#FFD93D' };}
  if (score <= 3) {return { level: score, label: 'Good', color: '#3B82F6' };}
  return { level: score, label: 'Strong', color: '#00D4AA' };
};

// Debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
