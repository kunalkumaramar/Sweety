// src/Redux/slices/bannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk to fetch banners
export const fetchMobileBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMobileBanners();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch banners');
    }
  }
);

const mobileBannerSlice = createSlice({
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
      .addCase(fetchMobileBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMobileBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchMobileBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBanners } = mobileBannerSlice.actions;
export default mobileBannerSlice.reducer;
