import { Category, UnitType } from '../types';

// Unit type display helpers
export const unitTypeLabels: Record<UnitType, string> = {
  litre: 'Litre',
  ml: 'mL',
  kg: 'Kg',
  gram: 'Gram',
  packet: 'Packet',
  piece: 'Piece',
  dozen: 'Dozen',
  bundle: 'Bundle',
  box: 'Box',
  bottle: 'Bottle',
  can: 'Can',
  other: 'Other',
};

export const unitTypeIcons: Record<UnitType, string> = {
  litre: '🫗',
  ml: '💧',
  kg: '⚖️',
  gram: '🔬',
  packet: '📦',
  piece: '🔹',
  dozen: '🥚',
  bundle: '🪢',
  box: '📦',
  bottle: '🍶',
  can: '🥫',
  other: '📋',
};

// Category display helpers
export const categoryLabels: Record<Category, string> = {
  dairy: 'Dairy',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  snacks: 'Snacks',
  beverages: 'Beverages',
  household: 'Household',
  other: 'Other',
};

export const categoryIcons: Record<Category, string> = {
  dairy: '🥛',
  vegetables: '🥬',
  fruits: '🍎',
  grains: '🌾',
  snacks: '🍪',
  beverages: '☕',
  household: '🏠',
  other: '📋',
};

export const categoryColors: Record<Category, string> = {
  dairy: '#FFD93D',
  vegetables: '#00D4AA',
  fruits: '#FF6B6B',
  grains: '#C9A96E',
  snacks: '#FF8C42',
  beverages: '#3B82F6',
  household: '#8B5CF6',
  other: '#8B8BA7',
};

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
