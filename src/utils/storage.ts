import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@grocery_auth_token',
  USER_DATA: '@grocery_user_data',
  THEME: '@grocery_theme',
  CURRENCY: '@grocery_currency',
  LANGUAGE: '@grocery_language',
  REMEMBER_ME: '@grocery_remember_me',
};

// Token
export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
};

// User data
export const saveUserData = async (user: object): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
};

export const getUserData = async (): Promise<object | null> => {
  const data = await AsyncStorage.getItem(KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const removeUserData = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.USER_DATA);
};

// Theme
export const saveTheme = async (theme: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.THEME, theme);
};

export const getTheme = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.THEME);
};

// Currency
export const saveCurrency = async (currencyCode: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CURRENCY, currencyCode);
};

export const getCurrency = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.CURRENCY);
};

// Language
export const saveLanguage = async (langCode: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.LANGUAGE, langCode);
};

export const getLanguage = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.LANGUAGE);
};

// Remember me
export const saveRememberMe = async (value: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.REMEMBER_ME, JSON.stringify(value));
};

export const getRememberMe = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(KEYS.REMEMBER_ME);
  return val ? JSON.parse(val) : false;
};

// Clear all
export const clearAllStorage = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  await AsyncStorage.removeItem(KEYS.USER_DATA);
  await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
};

export { KEYS };
