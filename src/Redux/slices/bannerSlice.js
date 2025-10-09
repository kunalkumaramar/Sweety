// src/Redux/slices/bannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk to fetch banners
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getBanners();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch banners');
    }
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState: {
    banners: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBanners: (state) => {
      state.banners = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBanners } = bannerSlice.actions;
export default bannerSlice.reducer;
