import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/api';
import { User, LoginPayload, RegisterPayload } from '../../types';
import {
  saveToken,
  removeToken,
  saveUserData,
  removeUserData,
  getUserData,
  getToken,
} from '../../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthChecked: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthChecked: false,
  error: null,
};

// Check for stored auth on app launch
export const checkStoredAuth = createAsyncThunk(
  'auth/checkStored',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const userData = await getUserData();
      if (token && userData) {
        // Verify token is still valid by fetching profile
        try {
          const profile = await authApi.getProfile();
          return { token, user: profile };
        } catch {
          // Token expired, clean up
          await removeToken();
          await removeUserData();
          return { token: null, user: null };
        }
      }
      return { token: null, user: null };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check auth');
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      await saveToken(response.token);
      await saveUserData(response.user);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      await saveToken(response.token);
      await saveUserData(response.user);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch {
      // Continue logout even if API call fails
    }
    await removeToken();
    await removeUserData();
  },
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getProfile();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check stored auth
      .addCase(checkStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(checkStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
