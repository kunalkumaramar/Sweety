// src/redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get all categories
export const getCategories = createAsyncThunk(
  'categories/getCategories',
  async (_, { rejectWithValue, getState }) => {
    const { categories } = getState().categories;
    if (categories.length > 0) {
      //console.log('categories fetched from store');
      return categories;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/category`);
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch categories');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Get paginated categories
export const getPaginatedCategories = createAsyncThunk(
  'categories/getPaginatedCategories',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch categories');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Search categories
export const searchCategories = createAsyncThunk(
  'categories/searchCategories',
  async (query, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to search categories');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Get category by ID
export const getCategoryById = createAsyncThunk(
  'categories/getCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`);
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch category');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  searchResults: [],
  paginatedData: {
    data: [],
    totalPages: 0,
    currentPage: 1,
    total: 0
  },
  loading: false,
  searchLoading: false,
  error: null,
  searchError: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get paginated categories
      .addCase(getPaginatedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaginatedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.paginatedData = {
          data: action.payload.data,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          total: action.payload.total || 0
        };
        state.error = null;
      })
      .addCase(getPaginatedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search categories
      .addCase(searchCategories.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      
      // Get category by ID
      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategories, clearSearchResults, clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;