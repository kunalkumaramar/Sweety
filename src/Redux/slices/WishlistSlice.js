// src/Redux/slices/wishlistSlice.js - Updated with size/color/image storage
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
  async ({ productId, priceWhenAdded, selectedSize = null, selectedColorName = null, selectedColorHex = null, selectedImage = null }, { rejectWithValue }) => {
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
  async ({ productId, priceWhenAdded, selectedSize = null, selectedColorName = null, selectedColorHex = null, selectedImage = null }, { rejectWithValue }) => {
    try {
      const response = await apiService.toggleWishlistItem(productId, priceWhenAdded);
      return { 
        productId, 
        ...response.data,
        selectedSize,
        selectedColorName,
        selectedColorHex,
        selectedImage
      };
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
      // FIXED: Use cart's addToCartAsync thunk to trigger cart popup/notification
      const cartResponse = await dispatch(addToCartAsync({
        productId,
        quantity,
        size: size.toLowerCase(),
        color: { colorName, colorHex },
        selectedImage
      })).unwrap();

      if (cartResponse.success) {
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
  creating: false,
  adding: false,
  removing: false,
  toggling: false,
  checking: false,
  moving: false,
  clearing: false,
  itemChecks: {}
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
    addToWishlistLocal: (state, action) => {
      const { product, priceWhenAdded, selectedSize = null, selectedColorName = null, selectedColorHex = null, selectedImage = null } = action.payload;
      const productId = product._id || product.id;
      const existingItem = state.items.find(item => 
        (typeof item.product === 'string' ? item.product : item.product?._id || item.product?.id) === productId
      );
      
      if (!existingItem) {
        state.items.push({
          product: product, // Store full product object for enrichment
          priceWhenAdded: priceWhenAdded || product.price,
          addedAt: new Date().toISOString(),
          selectedSize,
          selectedColorName,
          selectedColorHex,
          selectedImage,
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
        (typeof item.product === 'string' ? item.product : item.product?._id || item.product?.id) !== productId
      );
      state.total = state.items.length;
      state.count = state.items.length;
      delete state.itemChecks[productId]; // Use delete for safety
    },
    updateItemCheck: (state, action) => {
      const { productId, exists } = action.payload;
      state.itemChecks[productId] = exists;
    },
    // NEW: Clean invalid items (e.g., missing product ID)
    cleanInvalidItems: (state) => {
      state.items = state.items.filter(item => {
        const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
        return productId && productId !== 'undefined' && productId !== null && productId !== '';
      });
      state.total = state.items.length;
      state.count = state.items.length;
      // Rebuild checks for valid items
      state.itemChecks = {};
      state.items.forEach(item => {
        const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
        state.itemChecks[productId] = true;
      });
      state.error = null;
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
        
        state.itemChecks = {};
        state.items.forEach(item => {
          const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          if (productId) state.itemChecks[productId] = true;
        });
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = null;
        
        // Extract from thunk arg
        const { productId, selectedSize, selectedColorName, selectedColorHex, selectedImage } = action.meta.arg;
        
        // Optional debug log (remove in production)
        //console.log('Merging selections into wishlist item:', { productId, selectedSize, selectedColorName });
        
        let items = action.payload.items || [];
        
        // Find added item (robust handling for product as string or object)
        const addedIndex = items.findIndex(item => {
          const itemId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          return itemId === productId;
        });
        
        if (addedIndex !== -1 && (selectedSize || selectedColorName || selectedColorHex || selectedImage)) {
          items[addedIndex] = {
            ...items[addedIndex],
            selectedSize: selectedSize || items[addedIndex].selectedSize,
            selectedColorName: selectedColorName || items[addedIndex].selectedColorName,
            selectedColorHex: selectedColorHex || items[addedIndex].selectedColorHex,
            selectedImage: selectedImage || items[addedIndex].selectedImage
          };
          // Optional debug log
          //console.log('Merged item selectedSize:', items[addedIndex].selectedSize);
        }
        
        state.wishlist = action.payload;
        state.items = items;
        state.total = state.items.length;
        state.count = state.items.length;
        
        // Rebuild checks
        state.itemChecks = {};
        state.items.forEach(item => {
          const itemId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          if (itemId) state.itemChecks[itemId] = true;
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
        state.error = null;
        
        const { productId, action: apiAction, selectedSize, selectedColorName, selectedColorHex, selectedImage } = action.payload;
        
        let items = action.payload.items || state.items;
        
        if (apiAction === 'added') {
          // Merge selections
          const addedIndex = items.findIndex(item => {
            const itemId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
            return itemId === productId;
          });
          
          if (addedIndex !== -1 && (selectedSize || selectedColorName || selectedColorHex || selectedImage)) {
            items[addedIndex] = {
              ...items[addedIndex],
              selectedSize: selectedSize || items[addedIndex].selectedSize,
              selectedColorName: selectedColorName || items[addedIndex].selectedColorName,
              selectedColorHex: selectedColorHex || items[addedIndex].selectedColorHex,
              selectedImage: selectedImage || items[addedIndex].selectedImage
            };
          }
          state.itemChecks[productId] = true;
        } else if (apiAction === 'removed') {
          items = items.filter(item => {
            const itemId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
            return itemId !== productId;
          });
          delete state.itemChecks[productId];
          state.total = items.length;
          state.count = items.length;
        }
        
        state.wishlist = action.payload.wishlist || state.wishlist;
        state.items = items;
        
        // Rebuild checks if needed
        if (apiAction === 'added') {
          state.itemChecks[productId] = true;
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
        const { productId } = action.payload;
        
        // Remove the item from local state immediately
        state.items = state.items.filter(item => {
          const itemProductId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          return itemProductId !== productId;
        });
        state.total = state.items.length;
        state.count = state.items.length;
        delete state.itemChecks[productId];
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.removing = false;
        state.error = action.payload;
      })
      
      // Get Wishlist Count
      .addCase(getWishlistCount.pending, (state) => {
        // Optional: add pending state if needed
      })
      .addCase(getWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(getWishlistCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Move to Cart
      .addCase(moveWishlistItemToCart.pending, (state) => {
        state.moving = true;
        state.error = null;
      })
      .addCase(moveWishlistItemToCart.fulfilled, (state, action) => {
        state.moving = false;
        const { productId } = action.payload;
        
        // Remove from wishlist immediately
        state.items = state.items.filter(item => {
          const itemProductId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          return itemProductId !== productId;
        });
        state.total = state.items.length;
        state.count = state.items.length;
        delete state.itemChecks[productId];
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
  updateItemCheck,
  cleanInvalidItems // NEW: Export the cleanup action
} = wishlistSlice.actions;

export default wishlistSlice.reducer;