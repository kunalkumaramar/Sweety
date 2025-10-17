// src/Redux/slices/mobileBannerSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk to fetch mobile banners
export const fetchMobileBanners = createAsyncThunk(
  'mobileBanners/fetchMobileBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMobileBanners();
      // ✅ Extract the data array from response.data.data
      return response.data; // Since API returns {data: [], statusCode, success}
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch banners');
    }
  }
);

const mobileBannerSlice = createSlice({
  name: 'mobileBanners',
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
        // ✅ Extract data array if response structure is {data: [], statusCode, success}
        state.banners = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload.data || [];
      })
      .addCase(fetchMobileBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBanners } = mobileBannerSlice.actions;
export default mobileBannerSlice.reducer;
