// src/Redux/slices/wishlistSlice.js - Updated for new API structure
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks for new API endpoints
export const createWishlist = createAsyncThunk(
  'wishlist/createWishlist',
  async ({ name = "My Wishlist", isPublic = false }, { rejectWithValue }) => {
    try {
      const response = await apiService.createWishlist(name, isPublic);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWishlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ productId, priceWhenAdded }, { rejectWithValue }) => {
    try {
      const response = await apiService.addToWishlist(productId, priceWhenAdded);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkWishlistItem = createAsyncThunk(
  'wishlist/checkWishlistItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiService.checkWishlistItem(productId);
      return { productId, exists: response.data.exists };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async ({ productId, priceWhenAdded }, { rejectWithValue }) => {
    try {
      const response = await apiService.toggleWishlistItem(productId, priceWhenAdded);
      return { productId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiService.removeFromWishlist(productId);
      return { productId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWishlistCount = createAsyncThunk(
  'wishlist/getWishlistCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWishlistCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveWishlistItemToCart = createAsyncThunk(
  'wishlist/moveWishlistItemToCart',
  async ({ productId, quantity = 1, size = 'M', colorName = '', colorHex = '#000000', selectedImage = '' }, { dispatch, rejectWithValue }) => {
    try {
      // First try to add to cart
      const cartResponse = await apiService.addToCart(
        productId,
        quantity,
        size,
        { colorName, colorHex },
        selectedImage
      );

      if (cartResponse.success) {
        // If successfully added to cart, remove from wishlist
        await dispatch(removeFromWishlist(productId));
        return { productId, success: true };
      }

      return rejectWithValue('Failed to add item to cart');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to move item to cart');
    }
  }
);

export const clearWishlistItems = createAsyncThunk(
  'wishlist/clearWishlistItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.clearWishlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  wishlist: null,
  items: [],
  loading: false,
  error: null,
  total: 0,
  count: 0,
  // Individual loading states
  creating: false,
  adding: false,
  removing: false,
  toggling: false,
  checking: false,
  moving: false,
  clearing: false,
  // Check cache for items
  itemChecks: {} // { productId: boolean }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = null;
      state.items = [];
      state.total = 0;
      state.count = 0;
      state.error = null;
      state.itemChecks = {};
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
    // Optimistic updates
    addToWishlistLocal: (state, action) => {
      const { product, priceWhenAdded } = action.payload;
      const productId = product._id || product.id;
      const existingItem = state.items.find(item => 
        item.product === productId || item.product._id === productId
      );
      
      if (!existingItem) {
        state.items.push({
          product: productId,
          priceWhenAdded: priceWhenAdded || product.price,
          addedAt: new Date().toISOString(),
          _id: 'temp_' + Date.now()
        });
        state.total = state.items.length;
        state.count = state.items.length;
        state.itemChecks[productId] = true;
      }
    },
    removeFromWishlistLocal: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => 
        item.product !== productId && item.product._id !== productId
      );
      state.total = state.items.length;
      state.count = state.items.length;
      state.itemChecks[productId] = false;
    },
    updateItemCheck: (state, action) => {
      const { productId, exists } = action.payload;
      state.itemChecks[productId] = exists;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Wishlist
      .addCase(createWishlist.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createWishlist.fulfilled, (state, action) => {
        state.creating = false;
        state.wishlist = action.payload;
        state.items = action.payload.items || [];
        state.total = state.items.length;
        state.count = state.items.length;
      })
      .addCase(createWishlist.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Get Wishlist
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.items = action.payload.items || [];
        state.total = state.items.length;
        state.count = state.items.length;
        
        // Update item checks based on current items
        state.itemChecks = {};
        state.items.forEach(item => {
          const productId = item.product._id || item.product;
          state.itemChecks[productId] = true;
        });
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Reset to empty state if wishlist doesn't exist
        if (action.payload && action.payload.includes('not found')) {
          state.wishlist = null;
          state.items = [];
          state.total = 0;
          state.count = 0;
          state.itemChecks = {};
        }
      })
      
      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.adding = false;
        state.wishlist = action.payload;
        state.items = action.payload.items || [];
        state.total = state.items.length;
        state.count = state.items.length;
        
        // Update item checks
        state.items.forEach(item => {
          const productId = item.product._id || item.product;
          state.itemChecks[productId] = true;
        });
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload;
      })
      
      // Check Wishlist Item
      .addCase(checkWishlistItem.pending, (state) => {
        state.checking = true;
      })
      .addCase(checkWishlistItem.fulfilled, (state, action) => {
        state.checking = false;
        const { productId, exists } = action.payload;
        state.itemChecks[productId] = exists;
      })
      .addCase(checkWishlistItem.rejected, (state, action) => {
        state.checking = false;
        state.error = action.payload;
      })
      
      // Toggle Wishlist Item
      .addCase(toggleWishlistItem.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.toggling = false;
        const { productId, action: apiAction } = action.payload;
        
        if (apiAction === 'added') {
          state.itemChecks[productId] = true;
        } else if (apiAction === 'removed') {
          state.itemChecks[productId] = false;
        }
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload;
      })
      
      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.removing = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.removing = false;
        const { productId, data } = action.payload;
        
        if (data) {
          state.wishlist = data;
          state.items = data.items || [];
          state.total = state.items.length;
          state.count = state.items.length;
        }
        
        state.itemChecks[productId] = false;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.removing = false;
        state.error = action.payload;
      })
      
      // Get Wishlist Count
      .addCase(getWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      
      // Move to Cart
      .addCase(moveWishlistItemToCart.pending, (state) => {
        state.moving = true;
        state.error = null;
      })
      .addCase(moveWishlistItemToCart.fulfilled, (state, action) => {
        state.moving = false;
        const { productId, wishlist } = action.payload;
        
        if (wishlist) {
          state.wishlist = wishlist;
          state.items = wishlist.items || [];
          state.total = state.items.length;
          state.count = state.items.length;
        }
        
        state.itemChecks[productId] = false;
      })
      .addCase(moveWishlistItemToCart.rejected, (state, action) => {
        state.moving = false;
        state.error = action.payload;
      })
      
      // Clear Wishlist
      .addCase(clearWishlistItems.pending, (state) => {
        state.clearing = true;
        state.error = null;
      })
      .addCase(clearWishlistItems.fulfilled, (state) => {
        state.clearing = false;
        state.wishlist = null;
        state.items = [];
        state.total = 0;
        state.count = 0;
        state.itemChecks = {};
      })
      .addCase(clearWishlistItems.rejected, (state, action) => {
        state.clearing = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearWishlist, 
  clearWishlistError,
  addToWishlistLocal,
  removeFromWishlistLocal,
  updateItemCheck
} = wishlistSlice.actions;

export default wishlistSlice.reducer;