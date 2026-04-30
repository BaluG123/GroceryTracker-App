import { CurrencyConfig } from '../types';

export const currencies: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
];

export const getCurrencyByCode = (code: string): CurrencyConfig => {
  return currencies.find(c => c.code === code) || currencies[0];
};

export const formatPrice = (
  amount: number | string,
  currencyCode: string = 'INR',
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return `${getCurrencyByCode(currencyCode).symbol}0.00`;
  }
  const currency = getCurrencyByCode(currencyCode);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${formatted}`;
};

export const formatPriceShort = (
  amount: number | string,
  currencyCode: string = 'INR',
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return `${getCurrencyByCode(currencyCode).symbol}0`;
  }
  const currency = getCurrencyByCode(currencyCode);
  if (num >= 100000) {
    return `${currency.symbol}${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${currency.symbol}${(num / 1000).toFixed(1)}K`;
  }
  return `${currency.symbol}${num.toFixed(0)}`;
};
