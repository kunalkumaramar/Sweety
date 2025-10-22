// src/Redux/slices/cartSlice.js - Complete implementation with guest cart support and token expiration handling
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { logout } from './authSlice'; // Import logout action to clear auth state

// ===== ASYNC THUNKS =====

// Fetch cart details (automatically handles guest/authenticated users, with token refresh fallback to guest)
export const fetchCartDetails = createAsyncThunk(
  'cart/fetchCartDetails',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      let response;
      const isAuth = !!localStorage.getItem('token');
      
      if (isAuth) {
        try {
          response = await apiService.getCartDetails();
        } catch (apiError) {
          if (apiError.message?.includes('401') || 
              apiError.message?.includes('unauthorized') || 
              apiError.message?.includes('token') ||
              apiError.message?.includes('expired')) {
            // Clear auth and switch to guest
            dispatch(logout());
            const sessionId = apiService.getSessionId();
            response = await apiService.getGuestCartDetails(sessionId);
          } else {
            throw apiError;
          }
        }
      } else {
        const sessionId = apiService.getSessionId();
        response = await apiService.getGuestCartDetails(sessionId);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, size, color, selectedImage, fromWishlist = false }, { rejectWithValue, dispatch }) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      if (!size) {
        throw new Error('Size is required');
      }
      
      if (!color || !color.colorName || !color.colorHex) {
        throw new Error('Color information is required');
      }
      
      if (!selectedImage) {
        throw new Error('Product image is required');
      }
      
      let response;
      
      // Try smart add first
      try {
        response = await apiService.smartAddToCart(
          productId,        
          quantity,         
          size,            
          color,           
          selectedImage    
        );
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          // Clear auth and retry as guest
          dispatch(logout());
          const sessionId = apiService.getSessionId();
          response = await apiService.addToGuestCart(sessionId, productId, quantity, size, color, selectedImage);
        } else {
          throw apiError;
        }
      }

      console.log('=== Cart API Response ===');
      console.log('Response:', response);
      
      return response.data;
    } catch (error) {
      console.error('=== Cart API Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

// Update cart item (automatically handles guest/authenticated users)
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ itemId, quantity, size, color = {}, selectedImage = '' }, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      // Try smart update first
      try {
        response = await apiService.smartUpdateCartItem(itemId, quantity, size, color, selectedImage);
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          // Clear auth - note: cannot reliably update specific item after switch, so just clear and reject
          // UI should refetch cart
          dispatch(logout());
          throw new Error('Session expired. Please review your cart.');
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove from cart (automatically handles guest/authenticated users)
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async ({ productId, size, colorName }, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      // Try smart remove first
      try {
        response = await apiService.smartRemoveFromCart(productId, size, colorName);
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          // Clear auth - note: cannot reliably remove specific item after switch, so just clear and reject
          // UI should refetch cart
          dispatch(logout());
          throw new Error('Session expired. Please review your cart.');
        } else {
          throw apiError;
        }
      }
      
      return { productId, size, colorName, response: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Clear cart (automatically handles guest/authenticated users)
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      // Try smart clear first
      try {
        response = await apiService.smartClearCart();
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          // Clear auth and clear local/guest
          dispatch(logout());
          localStorage.removeItem('guestSessionId'); // Clear any guest session too
          return { data: { items: [] } }; // Simulate success
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Validate cart (only for authenticated users) - on 401, clear auth
export const validateCartAsync = createAsyncThunk(
  'cart/validateCartAsync',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      try {
        response = await apiService.validateCart();
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          dispatch(logout());
          throw new Error('Session expired. Cart validation unavailable.');
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Merge cart (after user login)
export const mergeCartAsync = createAsyncThunk(
  'cart/mergeCartAsync',
  async (sessionId, { rejectWithValue }) => {
    console.log('🔄 Attempting to merge cart with sessionId:', sessionId);
    try {
      const response = await apiService.mergeCart(sessionId);
      console.log('✅ Cart merged successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Cart merge failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Apply discount (only for authenticated users) - on 401, clear auth
export const applyDiscountAsync = createAsyncThunk(
  'cart/applyDiscountAsync',
  async ({ code, type = 'coupon' }, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      try {
        response = await apiService.applyDiscount(code, type);
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          dispatch(logout());
          throw new Error('Session expired. Discount unavailable.');
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove discount (only for authenticated users) - on 401, clear auth
export const removeDiscountAsync = createAsyncThunk(
  'cart/removeDiscountAsync',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      try {
        response = await apiService.removeDiscount();
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          dispatch(logout());
          // Clear discount state locally
          return { data: { discountAmount: 0 } };
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get discount by code
export const getDiscountByCodeAsync = createAsyncThunk(
  'cart/getDiscountByCodeAsync',
  async (code, { rejectWithValue }) => {
    try {
      const response = await apiService.getDiscountByCode(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Validate discount usage
export const validateDiscountAsync = createAsyncThunk(
  'cart/validateDiscountAsync',
  async ({ code, productIds }, { rejectWithValue, dispatch }) => {
    try {
      let response;
      
      try {
        response = await apiService.validateDiscount(code, productIds);
      } catch (apiError) {
        if (apiError.message?.includes('401') || 
            apiError.message?.includes('unauthorized') || 
            apiError.message?.includes('token') ||
            apiError.message?.includes('expired')) {
          dispatch(logout());
          throw new Error('Session expired. Discount validation unavailable.');
        } else {
          throw apiError;
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ===== INITIAL STATE =====
const initialState = {
  // Local cart for immediate UI updates
  items: [],
  totalItems: 0,
  totalPrice: 0,
  
  // API cart data
  cartDetails: null,
  cart: null,
  apiItems: [],
  totals: {
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0
  },
  
  // User type
  isAuthenticated: false,
  
  // Loading states
  loading: false,
  addingToCart: false,
  updatingCart: false,
  removingFromCart: false,
  clearingCart: false,
  validatingCart: false,
  mergingCart: false,
  applyingDiscount: false,
  removingDiscount: false,
  fetchingDiscount: false,
  
  // Error states
  error: null,
  addError: null,
  updateError: null,
  removeError: null,
  clearError: null,
  validateError: null,
  mergeError: null,
  discountError: null,

  // Discount state
  hasDiscount: false,
  appliedDiscount: null,
  
  // Validation state
  cartValidation: {
    valid: true,
    issues: []
  }
};

// ===== CART SLICE =====
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set authentication status
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    // Local cart actions for immediate UI feedback
    addToCart: (state, action) => {
      const { product, size, quantity = 1, color = {}, selectedImage = '' } = action.payload;
      
      // Create unique identifier for cart item
      const itemKey = `${product._id}_${size.toLowerCase()}_${color.colorName || ''}`;
      
      const existingItemIndex = state.items.findIndex(
        item => `${item.product._id}_${item.size}_${item.color?.colorName || ''}` === itemKey
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
        state.items[existingItemIndex].itemTotal = state.items[existingItemIndex].product.price * state.items[existingItemIndex].quantity;
      } else {
        state.items.push({
          _id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          product: {
            ...product,
            _id: product._id || product.id,
          },
          size: size.toLowerCase(),
          quantity,
          color,
          selectedImage,
          addedAt: new Date().toISOString(),
          itemTotal: product.price * quantity
        });
      }

      // Recalculate local totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.itemTotal || item.product.price * item.quantity), 0);
    },
    
    removeFromCart: (state, action) => {
      const { productId, size, colorName } = action.payload;
      const itemKey = `${productId}_${size.toLowerCase()}_${colorName || ''}`;
      
      state.items = state.items.filter(
        item => `${item.product._id}_${item.size}_${item.color?.colorName || ''}` !== itemKey
      );

      // Recalculate local totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.itemTotal || item.product.price * item.quantity), 0);
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item._id === itemId);
      
      if (itemIndex >= 0 && quantity > 0) {
        state.items[itemIndex].quantity = quantity;
        state.items[itemIndex].itemTotal = state.items[itemIndex].product.price * quantity;
      } else if (itemIndex >= 0 && quantity <= 0) {
        state.items.splice(itemIndex, 1);
      }

      // Recalculate local totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.itemTotal || item.product.price * item.quantity), 0);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },

    clearErrors: (state) => {
      state.error = null;
      state.addError = null;
      state.updateError = null;
      state.removeError = null;
      state.clearError = null;
      state.validateError = null;
      state.mergeError = null;
      state.discountError = null;
    },

    syncWithApiCart: (state, action) => {
      const { items, totals, cart } = action.payload;
      
      state.apiItems = items || [];
      state.items = (items || []).map(item => ({
        _id: item._id,
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        color: item.color || {},
        selectedImage: item.selectedImage || '',
        addedAt: item.addedAt,
        itemTotal: item.itemTotal || (item.product.price * item.quantity)
      }));
      
      if (totals) {
        state.totals = totals;
      }
      
      if (cart) {
        state.cart = cart;
        state.cartDetails = cart;
      }
      
      state.totalItems = totals?.itemCount || state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = totals?.total || state.items.reduce((total, item) => total + (item.itemTotal || item.product.price * item.quantity), 0);
      state.hasDiscount = (totals?.discountAmount || 0) > 0;
      
      // Set discount info from cart
      if (cart?.appliedCoupon?.code) {
        state.appliedDiscount = cart.appliedCoupon;
      } else if (cart?.appliedVoucher?.code) {
        state.appliedDiscount = cart.appliedVoucher;
      }
    },

    setDiscountState: (state, action) => {
      const { hasDiscount, appliedDiscount } = action.payload;
      state.hasDiscount = hasDiscount;
      state.appliedDiscount = appliedDiscount;
    },

    setValidationState: (state, action) => {
      state.cartValidation = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart details
      .addCase(fetchCartDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { items, totals, cart } = action.payload;
        
        state.apiItems = items || [];
        state.items = (items || []).map(item => ({
          _id: item._id,
          product: item.product,
          size: item.size,
          quantity: item.quantity,
          color: item.color || {},
          selectedImage: item.selectedImage || '',
          addedAt: item.addedAt,
          itemTotal: item.itemTotal || (item.product.price * item.quantity)
        }));
        
        if (totals) {
          state.totals = totals;
        }
        
        if (cart) {
          state.cart = cart;
          state.cartDetails = cart;
        }
        
        state.totalItems = totals?.itemCount || 0;
        state.totalPrice = totals?.total || 0;
        state.hasDiscount = (totals?.discountAmount || 0) > 0;
        
        // Set discount info from cart
        if (cart?.appliedCoupon?.code) {
          state.appliedDiscount = cart.appliedCoupon;
        } else if (cart?.appliedVoucher?.code) {
          state.appliedDiscount = cart.appliedVoucher;
        }
      })
      .addCase(fetchCartDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        // For guest users, don't treat empty cart as error
        if (!state.isAuthenticated && action.payload?.includes('not found')) {
          state.error = null;
        }
      })
      
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.addingToCart = true;
        state.addError = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.addingToCart = false;
        // Optionally refresh cart details or sync
        // dispatch(fetchCartDetails());
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.addingToCart = false;
        state.addError = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.updatingCart = true;
        state.updateError = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.updatingCart = false;
        // Sync updated item or refetch
        // dispatch(fetchCartDetails());
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.updatingCart = false;
        state.updateError = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.removingFromCart = true;
        state.removeError = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.removingFromCart = false;
        // Sync or refetch
        // dispatch(fetchCartDetails());
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.removingFromCart = false;
        state.removeError = action.payload;
      })

      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.clearingCart = true;
        state.clearError = null;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.clearingCart = false;
        // Clear all cart data
        state.items = [];
        state.apiItems = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.totals = { subtotal: 0, discountAmount: 0, total: 0, itemCount: 0 };
        state.hasDiscount = false;
        state.appliedDiscount = null;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.clearingCart = false;
        state.clearError = action.payload;
      })

      // Validate cart
      .addCase(validateCartAsync.pending, (state) => {
        state.validatingCart = true;
        state.validateError = null;
      })
      .addCase(validateCartAsync.fulfilled, (state, action) => {
        state.validatingCart = false;
        state.cartValidation = action.payload;
      })
      .addCase(validateCartAsync.rejected, (state, action) => {
        state.validatingCart = false;
        state.validateError = action.payload;
      })

      // Merge cart
      .addCase(mergeCartAsync.pending, (state) => {
        state.mergingCart = true;
        state.mergeError = null;
      })
      .addCase(mergeCartAsync.fulfilled, (state, action) => {
        state.mergingCart = false;
        // Update state with merged cart
        if (action.payload.items) {
          state.apiItems = action.payload.items;
          state.items = action.payload.items.map(item => ({
            _id: item._id,
            product: item.product,
            size: item.size,
            quantity: item.quantity,
            color: item.color || {},
            selectedImage: item.selectedImage,
            addedAt: item.addedAt,
            itemTotal: item.itemTotal || (item.product.price * item.quantity)
          }));
          
          // Recalculate totals
          state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
          state.totalPrice = state.items.reduce((total, item) => total + (item.itemTotal || item.product.price * item.quantity), 0);
        }
      })
      .addCase(mergeCartAsync.rejected, (state, action) => {
        state.mergingCart = false;
        state.mergeError = action.payload;
      })

      // Apply discount
      .addCase(applyDiscountAsync.pending, (state) => {
        state.applyingDiscount = true;
        state.discountError = null;
      })
      .addCase(applyDiscountAsync.fulfilled, (state, action) => {
        state.applyingDiscount = false;
        
        // Check if we got the expected response structure
        if (action.payload.appliedCoupon) {
          state.hasDiscount = true;
          state.appliedDiscount = action.payload.appliedCoupon;
          state.cart = { ...state.cart, appliedCoupon: action.payload.appliedCoupon };
          
          // Update totals with discount
          if (state.appliedDiscount?.discountAmount) {
            state.totals.discountAmount = state.appliedDiscount.discountAmount;
            state.totals.total = state.totals.subtotal - state.appliedDiscount.discountAmount;
            state.totalPrice = state.totals.total;
          }
        }
        
        if (action.payload.appliedVoucher) {
          state.hasDiscount = true;
          state.appliedDiscount = action.payload.appliedVoucher;
          state.cart = { ...state.cart, appliedVoucher: action.payload.appliedVoucher };
          
          // Update totals with discount
          if (state.appliedDiscount?.discountAmount) {
            state.totals.discountAmount = state.appliedDiscount.discountAmount;
            state.totals.total = state.totals.subtotal - state.appliedDiscount.discountAmount;
            state.totalPrice = state.totals.total;
          }
        }
      })
      .addCase(applyDiscountAsync.rejected, (state, action) => {
        state.applyingDiscount = false;
        state.discountError = action.payload;
      })

      // Remove discount
      .addCase(removeDiscountAsync.pending, (state) => {
        state.removingDiscount = true;
        state.discountError = null;
      })
      .addCase(removeDiscountAsync.fulfilled, (state, action) => {
        state.removingDiscount = false;
        state.hasDiscount = false;
        state.appliedDiscount = null;
        
        // Reset discount in cart
        if (state.cart) {
          state.cart.appliedCoupon = null;
          state.cart.appliedVoucher = null;
        }
        
        // Update totals without discount
        state.totals.discountAmount = 0;
        state.totals.total = state.totals.subtotal;
        state.totalPrice = state.totals.total;
      })
      .addCase(removeDiscountAsync.rejected, (state, action) => {
        state.removingDiscount = false;
        state.discountError = action.payload;
      })

      // Validate discount usage
      .addCase(validateDiscountAsync.pending, (state) => {
        state.applyingDiscount = true;
        state.discountError = null;
      })
      .addCase(validateDiscountAsync.fulfilled, (state, action) => {
        state.applyingDiscount = false;
        // Discount is valid and hasn't been used
      })
      .addCase(validateDiscountAsync.rejected, (state, action) => {
        state.applyingDiscount = false;
        state.discountError = action.payload;
      })

      // Get discount by code
      .addCase(getDiscountByCodeAsync.pending, (state) => {
        state.fetchingDiscount = true;
        state.discountError = null;
      })
      .addCase(getDiscountByCodeAsync.fulfilled, (state, action) => {
        state.fetchingDiscount = false;
        // Store discount info for validation
      })
      .addCase(getDiscountByCodeAsync.rejected, (state, action) => {
        state.fetchingDiscount = false;
        state.discountError = action.payload;
      });
  },
});

export const { 
  setAuthenticated,
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  clearErrors,
  syncWithApiCart,
  setDiscountState,
  setValidationState
} = cartSlice.actions;

export default cartSlice.reducer;