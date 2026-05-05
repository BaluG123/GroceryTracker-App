import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportsApi } from '../../api/api';
import {
  MonthlySummary,
  ItemFrequencyReport,
  DailyBreakdownMonth,
} from '../../types';
import {
  buildGuestDailyBreakdown,
  buildGuestItemFrequency,
  buildGuestMonthlySummary,
} from '../../services/guestExpenseStorage';

interface ReportsState {
  monthlySummary: MonthlySummary | null;
  itemFrequency: ItemFrequencyReport | null;
  dailyBreakdown: DailyBreakdownMonth | null;
  isLoading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
}

const now = new Date();

const initialState: ReportsState = {
  monthlySummary: null,
  itemFrequency: null,
  dailyBreakdown: null,
  isLoading: false,
  error: null,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
};

export const fetchMonthlySummary = createAsyncThunk(
  'reports/monthlySummary',
  async (
    { month, year }: { month: number; year: number },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      return state.auth.mode === 'guest'
        ? await buildGuestMonthlySummary(month, year)
        : await reportsApi.monthlySummary(month, year);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch monthly summary');
    }
  },
);

export const fetchItemFrequency = createAsyncThunk(
  'reports/itemFrequency',
  async (
    { month, year }: { month: number; year: number },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      return state.auth.mode === 'guest'
        ? await buildGuestItemFrequency(month, year)
        : await reportsApi.itemFrequency(month, year);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch item frequency',
      );
    }
  },
);

export const fetchDailyBreakdown = createAsyncThunk(
  'reports/dailyBreakdown',
  async (
    { month, year }: { month: number; year: number },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      return state.auth.mode === 'guest'
        ? await buildGuestDailyBreakdown(month, year)
        : await reportsApi.dailyBreakdownByMonth(month, year);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch daily breakdown',
      );
    }
  },
);

export const fetchAllReports = createAsyncThunk(
  'reports/fetchAll',
  async (
    { month, year }: { month: number; year: number },
    { dispatch },
  ) => {
    await Promise.all([
      dispatch(fetchMonthlySummary({ month, year })),
      dispatch(fetchItemFrequency({ month, year })),
      dispatch(fetchDailyBreakdown({ month, year })),
    ]);
  },
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportPeriod: (state, action: PayloadAction<{ month: number; year: number }>) => {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
    clearReports: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Monthly summary
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action: PayloadAction<MonthlySummary>) => {
        state.isLoading = false;
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Item frequency
      .addCase(fetchItemFrequency.fulfilled, (state, action: PayloadAction<ItemFrequencyReport>) => {
        state.itemFrequency = action.payload;
      })
      // Daily breakdown
      .addCase(fetchDailyBreakdown.fulfilled, (state, action: PayloadAction<DailyBreakdownMonth>) => {
        state.dailyBreakdown = action.payload;
      });
  },
});

export const { setReportPeriod, clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
