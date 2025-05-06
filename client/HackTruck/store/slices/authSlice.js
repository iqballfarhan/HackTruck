import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    // Set timeout to clear error after 5 seconds instead of 2 seconds
    setTimeout(() => {
      dispatch(clearError());
    }, 5000);
    return rejectWithValue(errorMessage);
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/api/auth/google', { token: credential });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Google login failed';
    // Set timeout to clear error after 5 seconds instead of 2 seconds
    setTimeout(() => {
      dispatch(clearError());
    }, 5000);
    return rejectWithValue(errorMessage);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    // Set timeout to clear error after 5 seconds instead of 2 seconds
    setTimeout(() => {
      dispatch(clearError());
    }, 5000);
    return rejectWithValue(errorMessage);
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    
    // Set token di state untuk digunakan aplikasi
    // Jika perlu verifikasi token, buat request ke backend
    try {
      // Ini akan memverifikasi token dengan mengirim request
      // dengan Authorization header yang sudah diset oleh interceptor
      const response = await api.get('/api/posts/driver');
      
      // Jika request berhasil, token valid, langsung ambil data user dari token
      // Decode payload dari JWT token (format: xxxxx.PAYLOAD.xxxxx)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode payload (base64)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Return user data dan token
      return { 
        user: response.data.user || payload,
        token
      };
    } catch (verifyError) {
      // Jika verifikasi gagal, hapus token
      if (verifyError.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return rejectWithValue('Token invalid');
    }
  } catch (error) {
    // Jika ada error, hapus token
    localStorage.removeItem('token');
    return rejectWithValue('Authentication failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not the "No token found" case
        if (action.payload !== 'No token found') {
          state.error = action.payload;
        }
        if (action.payload === 'No token found' || action.meta?.rejectedWithValue) {
          state.user = null;
          state.token = null;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;