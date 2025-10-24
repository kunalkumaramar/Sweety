// src/hooks/useCart.js 
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  setAuthenticated,
  addToCart,
  removeFromCart,
  updateQuantity,
  addToCartAsync,
  updateCartItemAsync,
  removeFromCartAsync,
  fetchCartDetails,
  clearCartAsync,
  validateCartAsync,
  mergeCartAsync,
  applyDiscountAsync,
  removeDiscountAsync,
  clearErrors,
  syncWithApiCart
} from '../Redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  
  // Get all cart state from Redux
  const {
    items = [],
    totalItems = 0,
    totalPrice = 0,
    cartDetails,
    cart,
    totals,
    apiItems = [],
    isAuthenticated = false,
    
    // Loading states
    loading = false,
    addingToCart = false,
    updatingCart = false,
    removingFromCart = false,
    clearingCart = false,
    validatingCart = false,
    mergingCart = false,
    applyingDiscount = false,
    removingDiscount = false,
    
    // Error states
    error,
    addError,
    updateError,
    removeError,
    clearError,
    validateError,
    mergeError,
    discountError,
    
    // Discount state
    hasDiscount = false,
    appliedDiscount,
    
    // Validation state
    cartValidation
  } = useSelector(state => state.cart || {});

  // Check if user is authenticated and update store
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const authStatus = !!token;
      if (authStatus !== isAuthenticated) {
        dispatch(setAuthenticated(authStatus));
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (user login/logout)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [dispatch, isAuthenticated]);

  // Load cart details on mount and when auth status changes
  useEffect(() => {
    dispatch(fetchCartDetails());
  }, [dispatch, isAuthenticated]);

  // Auto-merge cart when user logs in
  useEffect(() => {
    const handleAuthChange = async () => {
      const sessionId = localStorage.getItem('guestSessionId');
      if (isAuthenticated && sessionId) {
        await dispatch(mergeCartAsync(sessionId));
        localStorage.removeItem('guestSessionId');
        dispatch(fetchCartDetails());
      }
    };
    
    handleAuthChange();
  }, [isAuthenticated, dispatch]);

  // Add item to cart with enhanced parameters and better error handling
  const addItemToCart = useCallback(async (product, quantity = 1, selectedColor = '', selectedSize = 'M', selectedImage = '') => {
    try {
      // Validate input
      if (!product) {
        throw new Error('Product is required');
      }

      const productId = product.id || product._id;
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Ensure product has required fields with fallbacks
      const productData = {
        _id: productId,
        name: product.name || product.brand || 'Unknown Product',
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
        colors: Array.isArray(product.colors) ? product.colors : [],
        description: product.description || '',
        rating: product.rating || 0
      };

      // Prepare color object based on product data
      const colorObj = selectedColor && productData.colors.length > 0 ? 
        productData.colors.find(c => c.colorName === selectedColor || c.name === selectedColor) || 
        { colorName: selectedColor, colorHex: '#000000' } : 
        { colorName: selectedColor || '', colorHex: '#000000' };

      // Use selected image or first available image
      const imageUrl = selectedImage || 
        (productData.images.length > 0 ? productData.images[0] : '') || '';

      // Immediate UI feedback
      dispatch(addToCart({ 
        product: productData, 
        size: selectedSize.toLowerCase(), 
        quantity: Math.max(1, quantity),
        color: colorObj,
        selectedImage: imageUrl
      }));

      // API call
      await dispatch(addToCartAsync({ 
        productId: productData._id, 
        quantity: Math.max(1, quantity), 
        size: selectedSize.toLowerCase(),
        color: colorObj,
        selectedImage: imageUrl
      })).unwrap();

      return { success: true };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Remove from local state if API call failed
      const productId = product?.id || product?._id;
      if (productId) {
        dispatch(removeFromCart({ 
          productId, 
          size: selectedSize.toLowerCase(),
          colorName: selectedColor 
        }));
      }
      return { success: false, error: error.message || 'Failed to add item to cart' };
    }
  }, [dispatch]);

// Update item quantity by item ID with better error handling and live subtotal update
  const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
  if (!itemId) {
    console.error('Item ID is required');
    return { success: false, error: 'Item ID is required' };
  }

  const item = items.find(item => item._id === itemId);

  if (!item) {
    console.error('Item not found in cart');
    return { success: false, error: 'Item not found' };
  }

  const validQuantity = Math.max(1, newQuantity || 1);

  try {
    // ✅ Immediate UI feedback (local update)
    dispatch(updateQuantity({
      itemId,
      quantity: validQuantity
    }));

    // ⚡ Optional: Optimistically recalculate totals locally for instant feedback
    try {
      const localSubtotal = items.reduce((sum, i) => {
        const price = i.product?.price || i.price || 0;
        const qty = i._id === itemId ? validQuantity : (i.quantity || 1);
        return sum + price * qty;
      }, 0);

      // If your cartSlice supports setTotals action, you can dispatch this:
      dispatch({
        type: 'cart/setTotals',
        payload: { subtotal: localSubtotal, total: localSubtotal }
      });
    } catch (err) {
      console.warn('Local subtotal update skipped:', err.message);
    }

    // 🛠 Update on server
    await dispatch(updateCartItemAsync({
      itemId,
      quantity: validQuantity,
      size: item.size || 'M',
      color: item.color || {},
      selectedImage: item.selectedImage || ''
    })).unwrap();

    // 🔥 Refresh full cart details and totals after success
    dispatch(fetchCartDetails());

    return { success: true };
  } catch (error) {
    console.error('Failed to update cart:', error);
    // Fallback refresh in case of failure
    dispatch(fetchCartDetails());
    return { success: false, error: error.message || 'Failed to update item quantity' };
  }
}, [dispatch, items]);


  // Update cart quantity by change amount (for +/- buttons)
  const updateCartQuantity = useCallback(async (itemId, change) => {
    const item = items.find(item => item._id === itemId);
    
    if (!item) return { success: false, error: 'Item not found' };

    const newQuantity = Math.max(1, (item.quantity || 1) + change);
    return updateItemQuantity(itemId, newQuantity);
  }, [items, updateItemQuantity]);

  // Delete item by item ID with better error handling
  const deleteItem = useCallback(async (itemId) => {
    if (!itemId) {
      console.error('Item ID is required');
      return { success: false, error: 'Item ID is required' };
    }

    const item = items.find(item => item._id === itemId);
    
    if (!item) {
      console.error('Item not found in cart');
      return { success: false, error: 'Item not found' };
    }

    const productId = item.product?._id || item.productId;
    const size = item.size || '';
    const colorName = item.color?.colorName || '';

    if (!productId) {
      console.error('Product ID not found in item');
      return { success: false, error: 'Product ID not found' };
    }

    try {
      // Immediate UI feedback
      dispatch(removeFromCart({ 
        productId, 
        size,
        colorName 
      }));

      // API call
      await dispatch(removeFromCartAsync({ 
        productId, 
        size,
        colorName 
      })).unwrap();

      return { success: true };
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      // Refresh cart to restore correct state
      dispatch(fetchCartDetails());
      return { success: false, error: error.message || 'Failed to delete item' };
    }
  }, [dispatch, items]);

  // Clear entire cart
  const clearCartItems = useCallback(async () => {
    try {
      await dispatch(clearCartAsync()).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { success: false, error: error.message || 'Failed to clear cart' };
    }
  }, [dispatch]);

  // Validate cart (only for authenticated users)
  const validateCart = useCallback(async () => {
    if (!isAuthenticated) {
      return { valid: true, issues: [], message: 'Validation not available for guest users' };
    }

    try {
      const result = await dispatch(validateCartAsync()).unwrap();
      return result || { valid: true, issues: [] };
    } catch (error) {
      console.error('Failed to validate cart:', error);
      return { valid: false, issues: ['Validation failed'], error: error.message };
    }
  }, [dispatch, isAuthenticated]);

  // Handle cart merge after user login
  const mergeCart = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem('guestSessionId');
      if (sessionId && isAuthenticated) {
        await dispatch(mergeCartAsync(sessionId)).unwrap();
        // Clear guest session after merge
        localStorage.removeItem('guestSessionId');
        // Refresh cart details
        dispatch(fetchCartDetails());
        return { success: true };
      }
      return { success: false, message: 'No guest cart to merge' };
    } catch (error) {
      console.error('Failed to merge cart:', error);
      return { success: false, error: error.message || 'Failed to merge cart' };
    }
  }, [dispatch, isAuthenticated]);

  // Apply discount/coupon (only for authenticated users)
  const applyDiscount = useCallback(async (code, type = 'coupon') => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to apply discounts' };
    }

    if (!code || typeof code !== 'string') {
      return { success: false, error: 'Valid discount code is required' };
    }

    try {
      const result = await dispatch(applyDiscountAsync({ code: code.trim(), type })).unwrap();
      
      // Refresh cart details to get updated totals
      dispatch(fetchCartDetails());
      return { success: true, result };
    } catch (error) {
      console.error('Failed to apply discount:', error);
      return { success: false, error: error.message || 'Failed to apply discount' };
    }
  }, [dispatch, isAuthenticated]);

  // Remove discount (only for authenticated users)
  const removeDiscount = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to manage discounts' };
    }

    try {
      await dispatch(removeDiscountAsync()).unwrap();
      
      // Refresh cart details to get updated totals
      dispatch(fetchCartDetails());
      return { success: true };
    } catch (error) {
      console.error('Failed to remove discount:', error);
      return { success: false, error: error.message || 'Failed to remove discount' };
    }
  }, [dispatch, isAuthenticated]);

  // Refresh cart data
  const refreshCart = useCallback(() => {
    dispatch(fetchCartDetails());
  }, [dispatch]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Helper functions with better null safety
  const getCartTotal = useCallback(() => {
    return totals?.total >= 0 ? totals.total : totalPrice || 0;
  }, [totals?.total, totalPrice]);

  const getCartSubtotal = useCallback(() => {
    if (totals?.subtotal >= 0) {
      return totals.subtotal;
    }
    
    return items.reduce((total, item) => {
      const itemPrice = item.product?.price || item.price || 0;
      const itemQuantity = item.quantity || 0;
      const itemTotal = item.itemTotal || (itemPrice * itemQuantity);
      return total + itemTotal;
    }, 0);
  }, [totals?.subtotal, items]);

  const getDiscountAmount = useCallback(() => {
    return totals?.discountAmount || 0;
  }, [totals?.discountAmount]);

  const getCartItemCount = useCallback(() => {
    if (totals?.itemCount >= 0) {
      return totals.itemCount;
    }
    
    if (totalItems >= 0) {
      return totalItems;
    }
    
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [totals?.itemCount, totalItems, items]);

  const isItemInCart = useCallback((productId, size = '', colorName = '') => {
    if (!productId) return false;
    
    return items.some(item => {
      const itemProductId = item.product?._id || item.productId;
      const itemSize = item.size || '';
      const itemColor = item.color?.colorName || '';
      
      return itemProductId === productId && 
             itemSize === size.toLowerCase() && 
             itemColor === (colorName || '');
    });
  }, [items]);

  const getItemQuantity = useCallback((productId, size = '', colorName = '') => {
    if (!productId) return 0;
    
    const item = items.find(item => {
      const itemProductId = item.product?._id || item.productId;
      const itemSize = item.size || '';
      const itemColor = item.color?.colorName || '';
      
      return itemProductId === productId && 
             itemSize === size.toLowerCase() && 
             itemColor === (colorName || '');
    });
    
    return item?.quantity || 0;
  }, [items]);

  const getItemById = useCallback((itemId) => {
    if (!itemId) return null;
    return items.find(item => item._id === itemId) || null;
  }, [items]);

  // Check if cart is empty
  const isCartEmpty = useCallback(() => {
    return items.length === 0;
  }, [items]);

  // Get cart items by product ID
  const getItemsByProductId = useCallback((productId) => {
    if (!productId) return [];
    return items.filter(item => {
      const itemProductId = item.product?._id || item.productId;
      return itemProductId === productId;
    });
  }, [items]);

  return {
    // State
    items,
    cartDetails,
    cart,
    totals,
    apiItems,
    totalItems: getCartItemCount(),
    totalPrice: getCartTotal(),
    isAuthenticated,
    
    // Computed values
    subtotal: getCartSubtotal(),
    discountAmount: getDiscountAmount(),
    
    // Loading states
    loading,
    addingToCart,
    updatingCart,
    removingFromCart,
    clearingCart,
    validatingCart,
    mergingCart,
    applyingDiscount,
    removingDiscount,
    
    // Error states
    error,
    addError,
    updateError,
    removeError,
    clearError,
    validateError,
    mergeError,
    discountError,
    
    // Discount state (only available for authenticated users)
    hasDiscount: isAuthenticated ? hasDiscount : false,
    appliedDiscount: isAuthenticated ? appliedDiscount : null,
    
    // Validation state
    cartValidation,
    
    // Actions
    addItemToCart,
    deleteItem,
    updateItemQuantity,
    updateCartQuantity, // For +/- buttons
    refreshCart,
    clearAllErrors,
    clearCartItems,
    validateCart,
    mergeCart,
    applyDiscount,
    removeDiscount,
    
    // Helpers
    isItemInCart,
    getItemQuantity,
    getItemById,
    isCartEmpty,
    getItemsByProductId,
    
    // Sync action
    syncWithApiCart: (data) => dispatch(syncWithApiCart(data))
  };
};