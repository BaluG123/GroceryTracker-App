import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/api';
import {
  AuthMode,
  ChangePasswordPayload,
  ConfigureResetPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '../../types';
import {
  getAuthMode,
  saveToken,
  saveAuthMode,
  removeToken,
  removeAuthMode,
  saveUserData,
  removeUserData,
  getUserData,
  getToken,
} from '../../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  mode: AuthMode | null;
  isLoading: boolean;
  isAuthChecked: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  mode: null,
  isLoading: false,
  isAuthChecked: false,
  error: null,
};

// Check for stored auth on app launch
export const checkStoredAuth = createAsyncThunk(
  'auth/checkStored',
  async (_, { rejectWithValue }) => {
    try {
      const mode = await getAuthMode();
      if (mode === 'guest') {
        const userData = await getUserData();
        return {
          token: null,
          mode: 'guest' as AuthMode,
          user: (userData as User) || {
            id: 0,
            username: 'guest',
            email: '',
            first_name: 'Guest',
            last_name: '',
          },
        };
      }

      const token = await getToken();
      const userData = await getUserData();
      if (token && userData) {
        // Verify token is still valid by fetching profile
        try {
          const profile = await authApi.getProfile();
          return { token, user: profile, mode: 'authenticated' as AuthMode };
        } catch {
          // Token expired, clean up
          await removeToken();
          await removeUserData();
          await removeAuthMode();
          return { token: null, user: null, mode: null };
        }
      }
      return { token: null, user: null, mode: null };
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
      await saveAuthMode('authenticated');
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
      await saveAuthMode('authenticated');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const mode = await getAuthMode();
    const token = await getToken();

    await removeToken();
    await removeUserData();
    await removeAuthMode();

    if (mode === 'authenticated' && token) {
      authApi.logout(token).catch(() => {
        // Local logout should not depend on network availability.
      });
    }
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

export const continueAsGuest = createAsyncThunk(
  'auth/continueAsGuest',
  async () => {
    const guestUser: User = {
      id: 0,
      username: 'guest',
      email: '',
      first_name: 'Guest',
      last_name: 'Mode',
    };
    await removeToken();
    await saveUserData(guestUser);
    await saveAuthMode('guest');
    return guestUser;
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      return await authApi.forgotPassword(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      return await authApi.changePassword(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  },
);

export const configureReset = createAsyncThunk(
  'auth/configureReset',
  async (payload: ConfigureResetPayload, { rejectWithValue }) => {
    try {
      return await authApi.configureReset(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save reset settings');
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
    forceLogout: state => {
      state.user = null;
      state.token = null;
      state.mode = null;
      state.isAuthChecked = true;
      state.isLoading = false;
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
        state.mode = action.payload.mode;
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
        state.mode = 'authenticated';
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
        state.mode = 'authenticated';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.mode = null;
      })
      .addCase(continueAsGuest.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.token = null;
        state.mode = 'guest';
        state.isAuthChecked = true;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(configureReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(configureReset.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(configureReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
