import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itemsApi } from '../../api/api';
import { GroceryItem, CreateItemPayload, UpdateItemPayload } from '../../types';

interface ItemsState {
  items: GroceryItem[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

const initialState: ItemsState = {
  items: [],
  isLoading: false,
  isCreating: false,
  error: null,
  totalCount: 0,
  hasMore: false,
  currentPage: 1,
};

export const fetchItems = createAsyncThunk(
  'items/fetchAll',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await itemsApi.list(page);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch items');
    }
  },
);

export const createItem = createAsyncThunk(
  'items/create',
  async (payload: CreateItemPayload, { rejectWithValue }) => {
    try {
      return await itemsApi.create(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create item');
    }
  },
);

export const updateItem = createAsyncThunk(
  'items/update',
  async (
    { id, payload }: { id: number; payload: UpdateItemPayload },
    { rejectWithValue },
  ) => {
    try {
      return await itemsApi.update(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update item');
    }
  },
);

export const deleteItem = createAsyncThunk(
  'items/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await itemsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete item');
    }
  },
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearItemsError: state => {
      state.error = null;
    },
    resetItems: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        const { results, count, next, page } = action.payload;
        if (page === 1) {
          state.items = results;
        } else {
          state.items = [...state.items, ...results];
        }
        state.totalCount = count;
        state.hasMore = next !== null;
        state.currentPage = page;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create item
      .addCase(createItem.pending, state => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { clearItemsError, resetItems } = itemsSlice.actions;
export default itemsSlice.reducer;
