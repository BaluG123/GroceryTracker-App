import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { purchasesApi } from '../../api/api';
import {
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  PurchaseFilters,
} from '../../types';

interface PurchasesState {
  purchases: Purchase[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  filters: PurchaseFilters;
}

const initialState: PurchasesState = {
  purchases: [],
  isLoading: false,
  isCreating: false,
  error: null,
  totalCount: 0,
  hasMore: false,
  currentPage: 1,
  filters: {},
};

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchAll',
  async (filters: PurchaseFilters = {}, { rejectWithValue }) => {
    try {
      const response = await purchasesApi.list(filters);
      return { ...response, page: filters.page || 1 };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchases');
    }
  },
);

export const createPurchase = createAsyncThunk(
  'purchases/create',
  async (payload: CreatePurchasePayload, { rejectWithValue }) => {
    try {
      return await purchasesApi.create(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create purchase');
    }
  },
);

export const updatePurchase = createAsyncThunk(
  'purchases/update',
  async (
    { id, payload }: { id: number; payload: UpdatePurchasePayload },
    { rejectWithValue },
  ) => {
    try {
      return await purchasesApi.update(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update purchase');
    }
  },
);

export const deletePurchase = createAsyncThunk(
  'purchases/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await purchasesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete purchase');
    }
  },
);

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearPurchasesError: state => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    resetPurchases: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPurchases.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.isLoading = false;
        const { results, count, next, page } = action.payload;
        if (page === 1) {
          state.purchases = results;
        } else {
          state.purchases = [...state.purchases, ...results];
        }
        state.totalCount = count;
        state.hasMore = next !== null;
        state.currentPage = page;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPurchase.pending, state => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.isCreating = false;
        state.purchases.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        const index = state.purchases.findIndex(
          p => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.purchases = state.purchases.filter(p => p.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { clearPurchasesError, setFilters, resetPurchases } =
  purchasesSlice.actions;
export default purchasesSlice.reducer;
