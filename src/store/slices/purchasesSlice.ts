import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { purchasesApi } from '../../api/api';
import {
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  PurchaseFilters,
} from '../../types';
import {
  createGuestPurchase,
  deleteGuestPurchase,
  listGuestPurchases,
  updateGuestPurchase,
} from '../../services/guestExpenseStorage';

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
  async (filters: PurchaseFilters = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      let response;
      if (state.auth.mode === 'guest') {
        let purchases = await listGuestPurchases();
        if (filters.item) {purchases = purchases.filter(p => p.item === filters.item);}
        if (filters.item_name) {purchases = purchases.filter(p => p.item_name.toLowerCase().includes(filters.item_name!.toLowerCase()));}
        if (filters.month) {purchases = purchases.filter(p => new Date(p.purchased_at).getMonth() + 1 === filters.month);}
        if (filters.year) {purchases = purchases.filter(p => new Date(p.purchased_at).getFullYear() === filters.year);}
        response = { count: purchases.length, next: null, previous: null, results: purchases };
      } else {
        response = await purchasesApi.list(filters);
      }
      return { ...response, page: filters.page || 1 };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchases');
    }
  },
);

export const createPurchase = createAsyncThunk(
  'purchases/create',
  async (payload: CreatePurchasePayload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      return state.auth.mode === 'guest'
        ? await createGuestPurchase(payload)
        : await purchasesApi.create(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create purchase');
    }
  },
);

export const updatePurchase = createAsyncThunk(
  'purchases/update',
  async (
    { id, payload }: { id: number; payload: UpdatePurchasePayload },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      return state.auth.mode === 'guest'
        ? await updateGuestPurchase(id, payload)
        : await purchasesApi.update(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update purchase');
    }
  },
);

export const deletePurchase = createAsyncThunk(
  'purchases/delete',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      if (state.auth.mode === 'guest') {
        await deleteGuestPurchase(id);
      } else {
        await purchasesApi.delete(id);
      }
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
    clearPurchasesError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<PurchaseFilters>) => {
      state.filters = action.payload;
    },
    resetPurchases: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
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
      .addCase(createPurchase.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        state.isCreating = false;
        state.purchases.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(updatePurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        const index = state.purchases.findIndex(
          (p: Purchase) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(deletePurchase.fulfilled, (state, action: PayloadAction<number>) => {
        state.purchases = state.purchases.filter((p: Purchase) => p.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export const { clearPurchasesError, setFilters, resetPurchases } =
  purchasesSlice.actions;
export default purchasesSlice.reducer;
