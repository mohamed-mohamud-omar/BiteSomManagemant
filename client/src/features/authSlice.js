import { createSlice } from '@reduxjs/toolkit';

// Parse initial state from localStorage safely
const safeParse = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: safeParse('user'),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.loading = false;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.error = null;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  authStart, 
  authSuccess, 
  authFailure, 
  updateUserSuccess, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;
