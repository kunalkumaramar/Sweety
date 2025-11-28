// src/redux/slices/subcategorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sub } from "framer-motion/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get all subcategories
export const getAllSubcategories = createAsyncThunk(
  "subcategories/getAllSubcategories",
  async (_, { rejectWithValue, getState }) => {
    // ✅ Check if data for this category already exists
    const { subcategories } = getState().subcategories;
    const existingSubcats = subcategories.filter(
      sub => sub.category === categoryId
    );

    if (existingSubcats.length > 0) {
      //console.log(`✅ Subcategories for ${categoryId} already loaded`);
      return existingSubcats;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/sub-category`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch subcategories");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Get paginated subcategories
export const getPaginatedSubcategories = createAsyncThunk(
  "subcategories/getPaginatedSubcategories",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sub-category/paginated?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch subcategories");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Search subcategories
export const searchSubcategories = createAsyncThunk(
  "subcategories/searchSubcategories",
  async (query, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sub-category?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to search subcategories"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Get subcategory by ID
export const getSubcategoryById = createAsyncThunk(
  "subcategories/getSubcategoryById",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sub-category/${subcategoryId}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch subcategory");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Get subcategories by category ID
export const getSubcategoriesByCategory = createAsyncThunk(
  "subcategories/getSubcategoriesByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sub-category/category/${categoryId}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch subcategories");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const initialState = {
  subcategories: [],
  currentSubcategory: null,
  searchResults: [],
  paginatedData: {
    data: [],
    totalPages: 0,
    currentPage: 1,
    total: 0,
  },
  loading: false,
  searchLoading: false,
  error: null,
  searchError: null,
};

const subcategoriesSlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {
    clearSubcategories: (state) => {
      state.subcategories = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearCurrentSubcategory: (state) => {
      state.currentSubcategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all subcategories
      .addCase(getAllSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
        state.error = null;
      })
      .addCase(getAllSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get paginated subcategories
      .addCase(getPaginatedSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaginatedSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.paginatedData = {
          data: action.payload.data,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          total: action.payload.total || 0,
        };
        state.error = null;
      })
      .addCase(getPaginatedSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search subcategories
      .addCase(searchSubcategories.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchSubcategories.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchSubcategories.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })

      // Get subcategory by ID
      .addCase(getSubcategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubcategory = action.payload;
        state.error = null;
      })
      .addCase(getSubcategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get subcategories by category
      .addCase(getSubcategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
        state.error = null;
      })
      .addCase(getSubcategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSubcategories,
  clearSearchResults,
  clearCurrentSubcategory,
} = subcategoriesSlice.actions;
export default subcategoriesSlice.reducer;
