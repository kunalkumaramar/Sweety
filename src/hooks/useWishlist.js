// src/hooks/useWishlist.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useState, useRef } from 'react';
import { apiService } from '../services/api';
import {
  createWishlist,
  getWishlist,
  addToWishlist,
  checkWishlistItem,
  toggleWishlistItem,
  removeFromWishlist,
  getWishlistCount,
  moveWishlistItemToCart,
  clearWishlistItems,
  clearWishlistError,
  addToWishlistLocal,
  removeFromWishlistLocal,
  updateItemCheck,
  cleanInvalidItems // NEW: Import the cleanup action
} from '../Redux/slices/WishlistSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [enriching, setEnriching] = useState(false);
  const cleanedRef = useRef(false); // NEW: Ref to prevent repeated clean calls

  const {
    wishlist,
    items,
    loading,
    error,
    total,
    count,
    creating,
    adding,
    removing,
    toggling,
    checking,
    moving,
    clearing,
    itemChecks
  } = useSelector(state => state.wishlist || {});

  const isAuthenticated = () => !!localStorage.getItem('token');

  // Load wishlist on mount for authenticated users
  useEffect(() => {
    if (isAuthenticated()) {
      dispatch(getWishlist());
    }
  }, [dispatch]);

  // NEW: Clean invalid items after loading wishlist (run once on mount or after getWishlist)
  useEffect(() => {
    if (items && items.length > 0 && !cleanedRef.current) {
      dispatch(cleanInvalidItems());
      cleanedRef.current = true;
    }
  }, [dispatch, items]);

  // Enrich wishlist items with product details (cached in enrichedItems)
  useEffect(() => {
    const enrichItems = async () => {
      if (!Array.isArray(items) || items.length === 0) {
        setEnrichedItems([]);
        return;
      }

      // FIXED: Filter out invalid items before processing (prevents /product/undefined calls)
      const validItems = items.filter(item => {
        const productId = typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product;
        if (!productId || productId === 'undefined' || productId === null || productId === '') {
          console.warn('Skipping invalid wishlist item (missing/invalid product ID):', item);
          return false;
        }
        return true;
      });

      if (validItems.length === 0) {
        console.log('No valid items to enrich');
        setEnrichedItems([]);
        return;
      }

      console.log(`Enriching ${validItems.length} valid items...`); // Debug log

      setEnriching(true);
      try {
        const enrichedPromises = validItems.map(async (item) => {
          const productId = typeof item.product === 'object' ? (item.product._id || item.product.id) : item.product;

          // If product object already present (e.g., from local optimistic add)
          if (typeof item.product === 'object' && (item.product._id || item.product.id)) {
            const productObj = item.product;
            return {
              _id: item._id,
              id: productId,
              addedAt: item.addedAt,
              priceWhenAdded: item.priceWhenAdded,
              // full product details (preserve shape, including selections if merged)
              ...productObj,
              // FIXED: Explicitly preserve selections from item (in case not merged into productObj)
              selectedSize: item.selectedSize,
              selectedColorName: item.selectedColorName,
              selectedColorHex: item.selectedColorHex,
              selectedImage: item.selectedImage,
              image: productObj.colors?.[0]?.images?.[0] || productObj.images?.[0] || productObj.image || '',
              images: productObj.colors?.[0]?.images || productObj.images || [],
              colors: productObj.colors || []
            };
          }

          // Otherwise fetch product details from API
          try {
            const response = await apiService.getProductById(productId);
            const product = response.data;
            // FIXED: Merge any existing selections from item (e.g., selectedSize from Redux merge)
            return {
              _id: item._id,
              id: productId,
              addedAt: item.addedAt,
              priceWhenAdded: item.priceWhenAdded,
              selectedSize: item.selectedSize, // Preserve from state
              selectedColorName: item.selectedColorName,
              selectedColorHex: item.selectedColorHex,
              selectedImage: item.selectedImage,
              name: product.name,
              brand: product.name, // Or product.brand if separate
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              rating: product.rating || 5,
              image: product.colors?.[0]?.images?.[0] || product.images?.[0] || product.image || '',
              images: product.colors?.[0]?.images || product.images || [],
              colors: product.colors || [],
              category: product.category,
              subcategory: product.subcategory
            };
          } catch (fetchError) {
            console.error(`Failed to fetch product ${productId}:`, fetchError);
            // FIXED: Enhanced fallback with preserved selections
            return {
              _id: item._id,
              id: productId,
              addedAt: item.addedAt,
              priceWhenAdded: item.priceWhenAdded,
              selectedSize: item.selectedSize,
              selectedColorName: item.selectedColorName,
              selectedColorHex: item.selectedColorHex,
              selectedImage: item.selectedImage,
              name: 'Product Unavailable',
              brand: 'N/A',
              price: item.priceWhenAdded || 0,
              image: item.selectedImage || '',
              images: [],
              colors: []
            };
          }
        });

        const enriched = await Promise.all(enrichedPromises);
        setEnrichedItems(enriched);
      } catch (err) {
        console.error('Failed to enrich wishlist items:', err);
        // FIXED: Fallback to validItems without enrichment if whole process fails
        setEnrichedItems(validItems.map(item => ({
          ...item,
          name: 'Product Unavailable',
          price: item.priceWhenAdded || 0,
          image: ''
        })));
      } finally {
        setEnriching(false);
      }
    };

    enrichItems();
  }, [items]);

  // CREATE / ADD / REMOVE / TOGGLE
  const createUserWishlist = useCallback(async (name = "My Wishlist", isPublic = false) => {
    try {
      await dispatch(createWishlist({ name, isPublic })).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to create wishlist:', error);
      return { success: false, error };
    }
  }, [dispatch]);

  const addItemToWishlist = useCallback(async (payloadOrProduct) => {
    if (!isAuthenticated()) return { success: false, error: 'Authentication required' };

    // FIXED: Handle both full product object and structured payload {productId, ...}
    let productId, priceWhenAdded, selectedSize, selectedColorName, selectedColorHex, selectedImage, product;

    if ('productId' in payloadOrProduct) {
      // Structured payload from context/thunk
      ({ productId, priceWhenAdded, selectedSize, selectedColorName, selectedColorHex, selectedImage } = payloadOrProduct);
      // FIXED: Robust name handling (use passed name, or product string if it's a name, fallback to 'Product')
      const productName = payloadOrProduct.name || (typeof payloadOrProduct.product === 'string' ? payloadOrProduct.product : 'Product');
      // Create a minimal product object for local add (using known fields or defaults)
      product = {
        _id: productId,
        id: productId,
        name: productName,
        price: priceWhenAdded
      };
    } else {
      // Full product object (legacy/compatible)
      product = payloadOrProduct;
      if (typeof product !== 'object' || !product || (!product._id && !product.id)) {
        console.error('Invalid product in addItemToWishlist:', product);
        return { success: false, error: 'Invalid product data' };
      }
      productId = product._id || product.id;
      priceWhenAdded = product.price || product.priceWhenAdded || product.originalPrice || 0;
      selectedSize = product.selectedSize;
      selectedColorName = product.selectedColorName;
      selectedColorHex = product.selectedColorHex;
      selectedImage = product.selectedImage;
    }

    // Final validation
    if (!productId) {
      console.error('Missing productId in addItemToWishlist:', payloadOrProduct);
      return { success: false, error: 'Product ID required' };
    }

    try {
      // FIXED: Pass selections to local add for immediate UI
      dispatch(addToWishlistLocal({ 
        product, 
        priceWhenAdded,
        selectedSize,
        selectedColorName,
        selectedColorHex,
        selectedImage
      }));
      await dispatch(addToWishlist({ 
        productId, 
        priceWhenAdded,
        selectedSize,
        selectedColorName,
        selectedColorHex,
        selectedImage
      })).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      dispatch(removeFromWishlistLocal(productId));
      return { success: false, error };
    }
  }, [dispatch]);

  const removeItemFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated()) return { success: false, error: 'Authentication required' };

    // FIXED: Validate productId
    if (!productId || productId === 'undefined') {
      console.error('Invalid productId in removeItemFromWishlist:', productId);
      return { success: false, error: 'Invalid product ID' };
    }

    try {
      dispatch(removeFromWishlistLocal(productId));
      await dispatch(removeFromWishlist(productId)).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      dispatch(getWishlist());
      return { success: false, error };
    }
  }, [dispatch]);

  const toggleWishlistItemAction = useCallback(async (payloadOrProduct) => {
    if (!isAuthenticated()) return { success: false, error: 'Authentication required' };

    // FIXED: Handle both full product and structured payload (mirror addItemToWishlist)
    let productId, priceWhenAdded, selectedSize, selectedColorName, selectedColorHex, selectedImage, product;

    if ('productId' in payloadOrProduct) {
      // Structured
      ({ productId, priceWhenAdded, selectedSize, selectedColorName, selectedColorHex, selectedImage } = payloadOrProduct);
      // FIXED: Robust name handling (use passed name, or product string if it's a name, fallback to 'Product')
      const productName = payloadOrProduct.name || (typeof payloadOrProduct.product === 'string' ? payloadOrProduct.product : 'Product');
      product = {
        _id: productId,
        id: productId,
        name: productName,
        price: priceWhenAdded
      };
    } else {
      // Full product
      product = payloadOrProduct;
      if (typeof product !== 'object' || !product || (!product._id && !product.id)) {
        console.error('Invalid product in toggleWishlistItemAction:', product);
        return { success: false, error: 'Invalid product data' };
      }
      productId = product._id || product.id;
      priceWhenAdded = product.price || product.priceWhenAdded || product.originalPrice || 0;
      selectedSize = product.selectedSize;
      selectedColorName = product.selectedColorName;
      selectedColorHex = product.selectedColorHex;
      selectedImage = product.selectedImage;
    }

    if (!productId) {
      console.error('Missing productId in toggleWishlistItemAction:', payloadOrProduct);
      return { success: false, error: 'Product ID required' };
    }

    const isCurrentlyInWishlist = itemChecks[productId] || false;

    try {
      if (isCurrentlyInWishlist) {
        dispatch(removeFromWishlistLocal(productId));
      } else {
        dispatch(addToWishlistLocal({ 
          product, 
          priceWhenAdded,
          selectedSize,
          selectedColorName,
          selectedColorHex,
          selectedImage
        }));
      }
      const result = await dispatch(toggleWishlistItem({ 
        productId, 
        priceWhenAdded,
        selectedSize,
        selectedColorName,
        selectedColorHex,
        selectedImage
      })).unwrap();
      dispatch(getWishlist());
      return { success: true, action: result.action };
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      dispatch(updateItemCheck({ productId, exists: isCurrentlyInWishlist }));
      return { success: false, error };
    }
  }, [dispatch, itemChecks]);

  const checkIfInWishlist = useCallback(async (productId) => {
    if (!isAuthenticated()) return { success: false, exists: false };

    // FIXED: Validate productId
    if (!productId || productId === 'undefined') {
      console.error('Invalid productId in checkIfInWishlist:', productId);
      return { success: false, exists: false, error: 'Invalid product ID' };
    }

    if (itemChecks.hasOwnProperty(productId)) {
      return { success: true, exists: itemChecks[productId] };
    }

    try {
      const result = await dispatch(checkWishlistItem(productId)).unwrap();
      return { success: true, exists: result.exists };
    } catch (error) {
      console.error('Failed to check wishlist item:', error);
      return { success: false, exists: false, error };
    }
  }, [dispatch, itemChecks]);

  // ---------- Move item to cart (single) ----------
  const moveItemToCart = useCallback(async (productOrId, quantity = 1, size = 'M', colorName = '', colorHex = '', selectedImage = '') => {
    if (!isAuthenticated()) return { success: false, error: 'Authentication required' };

    // FIXED: Validate input
    const productId = typeof productOrId === 'string' ? productOrId : (productOrId?._id || productOrId?.id);
    if (!productId || productId === 'undefined') {
      console.error('Invalid productId in moveItemToCart:', productOrId);
      return { success: false, error: 'Invalid product ID' };
    }

    let productObj = enrichedItems.find(it => (it.id === productId || it._id === productId));

    try {
      // If we don't have product details, fetch product info from API
      if (!productObj) {
        const resp = await apiService.getProductById(productId);
        productObj = resp.data;
      }

      // FIXED: Prioritize selections from enrichedItem (e.g., selectedSize from wishlist state)
      const enrichedItem = enrichedItems.find(it => (it.id === productId || it._id === productId));
      const finalSize = (enrichedItem?.selectedSize || size).toLowerCase();
      const finalColorName = enrichedItem?.selectedColorName || colorName || '';
      const finalColorHex = enrichedItem?.selectedColorHex || colorHex || '';

      // Pick default color from productObj.colors[0] if caller didn't provide colorName
      const defaultColor = (productObj && Array.isArray(productObj.colors) && productObj.colors.length > 0)
        ? (productObj.colors[0])
        : { colorName: 'Default', colorHex: '#000000' };

      const useColorName = finalColorName && finalColorName.trim() ? finalColorName : (defaultColor.colorName || defaultColor.name || 'Default');
      const useColorHex = finalColorHex && finalColorHex.trim() ? finalColorHex : (defaultColor.colorHex || defaultColor.hex || '#000000');

      // Pick a sensible selectedImage if none passed (prioritize enriched)
      const useImage = enrichedItem?.selectedImage || selectedImage && selectedImage.trim()
        ? selectedImage
        : (productObj?.colors?.[0]?.images?.[0] || productObj?.images?.[0] || productObj?.image || '');

      console.log('moveItemToCart using:', { productId, finalSize, useColorName, useImage }); // Debug

      // Dispatch the thunk that calls POST /wishlist/move-to-cart/:productId
      await dispatch(moveWishlistItemToCart({
        productId,
        quantity,
        size: finalSize,
        colorName: useColorName,
        colorHex: useColorHex,
        selectedImage: useImage
      })).unwrap();

      // Successful
      return { success: true };
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      // Return a user-friendly message where possible
      const message = error?.message || (error?.payload ? error.payload : 'Failed to move item to cart');
      return { success: false, error: message };
    }
  }, [dispatch, enrichedItems]);

  // ---------- Move ALL wishlist items to cart (bulk) ----------
  const moveAllToCart = useCallback(async () => {
    if (!isAuthenticated()) {
      return { success: false, error: 'Authentication required' };
    }
    if (!enrichedItems || enrichedItems.length === 0) {
      return { success: false, error: 'No items to move' };
    }

    try {
      const results = await Promise.allSettled(
        enrichedItems.map(async (item) => {
          const productId = item.id || item._id;
          if (!productId || productId === 'undefined') {
            console.warn('Skipping invalid item in bulk move:', item);
            return Promise.resolve({ success: false }); // Settled as fulfilled but note failure
          }

          // FIXED: Use item's selections if available
          const finalSize = (item.selectedSize || 'm').toLowerCase();
          const colorName = item.selectedColorName || '';
          const colorHex = item.selectedColorHex || '';

          const defaultColor = (item && Array.isArray(item.colors) && item.colors.length > 0)
            ? item.colors[0]
            : { colorName: 'Default', colorHex: '#000000' };

          const useColorName = colorName && colorName.trim() ? colorName : (defaultColor.colorName || defaultColor.name || 'Default');
          const useColorHex = colorHex && colorHex.trim() ? colorHex : (defaultColor.colorHex || defaultColor.hex || '#000000');
          const selectedImage = item.selectedImage || item.image || item.images?.[0] || '';

          // call the thunk; unwrap inside map so Promise reflects success/rejection
          return dispatch(moveWishlistItemToCart({
            productId,
            quantity: 1,
            size: finalSize,
            colorName: useColorName,
            colorHex: useColorHex,
            selectedImage: selectedImage
          })).unwrap();
        })
      );

      const successes = results.filter(r => r.status === 'fulfilled' && r.value?.success !== false).length;
      const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.success === false)).length;

      return {
        success: failures === 0,
        moved: successes,
        failed: failures,
        details: results
      };
    } catch (error) {
      console.error('Failed to move all items to cart:', error);
      return { success: false, error };
    }
  }, [dispatch, enrichedItems]);

  // Clear wishlist
  const clearWishlistItemsAction = useCallback(async () => {
    if (!isAuthenticated()) return { success: false, error: 'Authentication required' };
    if (!enrichedItems || enrichedItems.length === 0) return { success: true, message: 'Wishlist already empty' };

    try {
      await dispatch(clearWishlistItems()).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      return { success: false, error };
    }
  }, [dispatch, enrichedItems]);

  // Refresh wishlist
  const refreshWishlist = useCallback(() => {
    if (isAuthenticated()) dispatch(getWishlist());
  }, [dispatch]);

  // Get wishlist count
  const getCount = useCallback(async () => {
    if (!isAuthenticated()) return { success: false, count: 0 };
    try {
      await dispatch(getWishlistCount()).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Failed to get wishlist count:', error);
      return { success: false, error };
    }
  }, [dispatch]);

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch(clearWishlistError());
  }, [dispatch]);

  // Helpers
  const isItemInWishlist = useCallback((productId) => {
    return !!itemChecks[productId];
  }, [itemChecks]);

  const getWishlistItemsCount = useCallback(() => {
    return count || total || enrichedItems.length;
  }, [count, total, enrichedItems.length]);

  const isWishlistEmpty = useCallback(() => !enrichedItems || enrichedItems.length === 0, [enrichedItems]);

  const getWishlistTotal = useCallback(() => {
    return enrichedItems.reduce((sum, it) => sum + (it.priceWhenAdded || it.price || 0), 0);
  }, [enrichedItems]);

  return {
    // State
    wishlist,
    items: enrichedItems,
    wishlistItems: enrichedItems,
    loading: loading || enriching,
    error,
    total,
    count: getWishlistItemsCount(),

    // Loading flags
    creating,
    adding,
    removing,
    toggling,
    checking,
    moving,
    clearing,

    // Cache
    itemChecks,

    // Actions
    addToWishlist: addItemToWishlist,
    removeFromWishlist: removeItemFromWishlist,
    toggleWishlist: toggleWishlistItemAction,
    moveToCart: moveItemToCart,
    moveAllToCart,
    clearWishlist: clearWishlistItemsAction,
    createWishlist: createUserWishlist,
    checkWishlistItem: checkIfInWishlist,
    refreshWishlist,
    getWishlistCount: getCount,
    clearErrors,

    // Helpers
    isItemInWishlist,
    isWishlistEmpty,
    getWishlistTotal,
    isAuthenticated: isAuthenticated(),

    // Computed values
    totalValue: getWishlistTotal(),
    itemCount: getWishlistItemsCount()
  };
};