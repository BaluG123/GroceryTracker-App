import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, LanguageCode } from '../../types';
import {
  saveTheme,
  getTheme,
  saveCurrency,
  getCurrency,
  saveLanguage,
  getLanguage,
} from '../../utils/storage';

interface SettingsState {
  theme: ThemeMode;
  currencyCode: string;
  language: LanguageCode;
  hasSelectedLanguage: boolean;
  isLoaded: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'dark',
  currencyCode: 'INR',
  language: 'en',
  hasSelectedLanguage: false,
  isLoaded: false,
  notificationsEnabled: true,
};

export const loadSettings = createAsyncThunk(
  'settings/load',
  async () => {
    const [theme, currency, language] = await Promise.all([
      getTheme(),
      getCurrency(),
      getLanguage(),
    ]);
    return {
      theme: (theme as ThemeMode) || 'dark',
      currencyCode: currency || 'INR',
      language: (language as LanguageCode) || 'en',
      hasSelectedLanguage: Boolean(language),
    };
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      saveTheme(action.payload);
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currencyCode = action.payload;
      saveCurrency(action.payload);
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      state.hasSelectedLanguage = true;
      saveLanguage(action.payload);
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.theme = action.payload.theme;
      state.currencyCode = action.payload.currencyCode;
      state.language = action.payload.language;
      state.hasSelectedLanguage = action.payload.hasSelectedLanguage;
      state.isLoaded = true;
    });
  },
});

export const { setTheme, setCurrency, setLanguage, toggleNotifications } =
  settingsSlice.actions;
export default settingsSlice.reducer;
