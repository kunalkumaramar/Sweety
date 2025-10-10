// src/components/WishlistContext.jsx - Updated for new API structure
import React, { createContext, useContext } from "react";
import { useDispatch } from "react-redux";
import { useWishlist as useWishlistHook } from "../hooks/useWishlist";
import { addToCartAsync } from "../Redux/slices/cartSlice";
import { removeFromWishlist } from "../Redux/slices/WishlistSlice";
import Notification from "./Notification";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  const {
    // State
    wishlistItems,
    loading,
    error,
    count,
    clearing, // Added clearing state
    
    // Actions from hook
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
    toggleWishlist: toggleWishlistAction,
    
    // Other actions
    moveToCart,
    moveAllToCart,
    clearWishlist,
    refreshWishlist,
    
    // Helpers
    isItemInWishlist,
    isWishlistEmpty,
    getWishlistTotal,
    isAuthenticated
  } = useWishlistHook();

  // Notification state
  const [notification, setNotification] = React.useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Wrapper functions with notifications
  const addToWishlist = async (product) => {
    console.log('Adding to wishlist, received product:', product);
    
    if (!isAuthenticated) {
      showNotification('Please login to use wishlist', 'error');
      return { success: false };
    }

    // Ensure we're capturing colors and their sizeStock
    if (product.colors?.length > 0) {
      console.log('Product colors and their sizes:', product.colors.map(color => ({
        colorName: color.colorName,
        colorHex: color.colorHex,
        sizes: color.sizeStock?.map(s => `${s.size} (stock: ${s.stock})`) || []
      })));
    } else {
      console.warn('No colors/sizeStock found in product:', product);
    }

    console.log('About to call addToWishlistAction with product:', product);
    const result = await addToWishlistAction(product);
    console.log('Wishlist addition result:', result);
    
    if (result.success) {
      showNotification(`${product.brand || product.name} added to wishlist!`);
    } else {
      showNotification(
        result.error === 'Authentication required' 
          ? 'Please login to use wishlist' 
          : `Failed to add ${product.brand || product.name} to wishlist`,
        'error'
      );
    }
    
    return result;
  };

  const removeFromWishlist = async (productId) => {
    const item = wishlistItems.find(item => (item.id || item._id) === productId);
    const result = await removeFromWishlistAction(productId);
    
    if (result.success && item) {
      showNotification(`${item.brand || item.name} removed from wishlist!`, 'info');
    } else if (!result.success) {
      showNotification('Failed to remove item from wishlist', 'error');
    }
    
    return result;
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      showNotification('Please login to use wishlist', 'error');
      return { success: false };
    }

    const productId = product.id || product._id;
    const wasInWishlist = isItemInWishlist(productId);
    
    const result = await toggleWishlistAction(product);
    
    if (result.success) {
      const action = result.action || (wasInWishlist ? 'removed' : 'added');
      const message = action === 'added' 
        ? `${product.brand || product.name} added to wishlist!`
        : `${product.brand || product.name} removed from wishlist!`;
      const type = action === 'added' ? 'success' : 'info';
      
      showNotification(message, type);
    } else {
      showNotification(
        `Failed to ${wasInWishlist ? 'remove from' : 'add to'} wishlist`,
        'error'
      );
    }
    
    return result;
  };

  // Move item to cart with enhanced parameters - Updated for new API
  const moveItemToCart = async (productId, quantity = 1, size = '', colorName = '', colorHex = '', selectedImage = '') => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Find the item in the wishlist
      const foundItem = wishlistItems?.find(item => {
        const itemProduct = item.product || item;
        return (itemProduct._id === productId || itemProduct.id === productId);
      });

      if (!foundItem) {
        console.error('Item not found in wishlist. Available items:', wishlistItems);
        throw new Error('Item not found in wishlist');
      }

      // Get the full product data
      const productData = foundItem.product || foundItem;
      console.log('Found product data:', productData);

      // Get available colors and their sizes
      const availableColors = productData.colors || [];
      console.log('Available colors with sizeStock:', availableColors);

      // Get all available sizes and colors
      const availableSizes = Array.from(new Set(
        availableColors.flatMap(color => color.sizeStock?.map(s => s.size) || [])
      ));
      console.log('Available sizes from sizeStock:', availableSizes);

      if (availableSizes.length === 0) {
        console.warn('No sizes available in any color for product:', productData);
        throw new Error('No sizes available for this product');
      }

      // Convert common size formats to numeric if needed
      const normalizeSize = (s) => {
        const sizeMap = { 'S': '32', 'M': '34', 'L': '36', 'XL': '38', 'XXL': '40' };
        return sizeMap[s] || s;
      };

      const normalizedRequestedSize = normalizeSize(size);

      // Find the color that has the requested size in its sizeStock
      let selectedColor = availableColors.find(color => 
        color.sizeStock?.some(s => s.size === normalizedRequestedSize)
      ) || availableColors[0];

      if (!selectedColor) {
        throw new Error('No color information available for this product');
      }

      // Ensure we have all required color information
      if (!selectedColor.colorName || !selectedColor.colorHex) {
        console.error('Missing color information:', selectedColor);
        throw new Error('Product color information is incomplete');
      }

      // Get the final size - either requested size if available, or first available size
      const normalizedFinalSize = availableSizes.includes(normalizedRequestedSize)
        ? normalizedRequestedSize
        : availableSizes[0];

      // Get the selected image from the color or product
      const colorImages = selectedColor.images || [];
      const finalImage = selectedImage || colorImages[0] || productData.image;

      if (!finalImage) {
        throw new Error('Product image is required');
      }

      // Prepare the final color data
      const finalColor = {
        colorName: colorName || selectedColor.colorName,
        colorHex: colorHex || selectedColor.colorHex
      };

      // Use provided size if valid, otherwise use first available size from selected color
      const finalSize = size && availableSizes.includes(size)
        ? size
        : (selectedColor.sizeStock?.[0]?.size || availableSizes[0] || '32');

      // Also get the stock information for the selected size
      const sizeStockInfo = selectedColor.sizeStock?.find(s => s.size === finalSize);

      // Update the final color with default values if needed
      finalColor.colorName = finalColor.colorName || 'Default';
      finalColor.colorHex = finalColor.colorHex || '#000000';

      // Check stock availability
      if (sizeStockInfo && quantity > sizeStockInfo.stock) {
        throw new Error(`Only ${sizeStockInfo.stock} items available in size ${finalSize}`);
      }

      // Format the product data as expected by the cart - ensure we use product ID consistently
      const cartProductData = {
        _id: productData.id || productData._id, // Prefer product.id as it's the actual product ID
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        originalPrice: productData.originalPrice,
        image: finalImage,
        description: productData.description,
        category: productData.category,
        colors: productData.colors,
        sizeStock: sizeStockInfo ? [sizeStockInfo] : []
      };

      const cartData = {
        product: cartProductData,  // Send the full product object
        quantity,
        size: finalSize,
        color: finalColor,
        selectedImage: finalImage
      };

      console.log('Adding to cart with data:', cartData);

      // Add to cart first using the async action
      try {
        // Prepare data for the async action - ensure we use the correct product ID
        const asyncCartData = {
          productId: productData.id || productData._id, // Always use the product ID first
          quantity,
          size: finalSize,
          colorName: finalColor.colorName,
          colorHex: finalColor.colorHex,
          selectedImage: finalImage,
          fromWishlist: true  // This tells the action to use moveWishlistItemToCart
        };

        console.log('Dispatching moveWishlistItemToCart with:', asyncCartData);
        
        // Use the async action
        const cartResponse = await dispatch(addToCartAsync(asyncCartData)).unwrap();

        if (cartResponse && cartResponse.success !== false) {
          // If cart addition was successful, remove from wishlist
          await dispatch(removeFromWishlist(productId)).unwrap();
          showNotification(`${productData.name || 'Item'} moved to cart!`, 'success');
          return { success: true };
        } else {
          throw new Error(cartResponse?.message || 'Failed to add item to cart');
        }
      } catch (error) {
        console.error('Cart error:', error);
        throw new Error(error?.message || 'Failed to move item to cart');
      }
    } catch (error) {
      console.error('Error moving item to cart:', error);
      showNotification(error.message || 'Failed to move item to cart', 'error');
      return { success: false, error: error.message };
    }
  };

  // Move all items to cart with notification
  const moveAllItemsToCart = async () => {
    if (isWishlistEmpty()) {
      showNotification('Your wishlist is empty', 'info');
      return { success: false };
    }

    const result = await moveAllToCart();
    
    if (result.success) {
      showNotification(`All items moved to cart!`);
    } else {
      const message = result.moved > 0 
        ? `${result.moved} items moved to cart, ${result.failed} failed`
        : 'Failed to move items to cart';
      showNotification(message, result.moved > 0 ? 'info' : 'error');
    }
    
    return result;
  };

  // Clear wishlist with notification - Updated for new API
  const clearWishlistItems = async () => {
    if (isWishlistEmpty()) {
      showNotification('Your wishlist is already empty', 'info');
      return { success: true };
    }

    const result = await clearWishlist();
    
    if (result.success) {
      showNotification('Wishlist cleared!', 'info');
    } else {
      showNotification('Failed to clear wishlist', 'error');
    }
    
    return result;
  };

  // Enhanced context value with backward compatibility
  const contextValue = {
    // Original API for backward compatibility
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    
    // Extended API
    moveToCart: moveItemToCart,
    moveAllToCart: moveAllItemsToCart,
    clearWishlist: clearWishlistItems,
    refreshWishlist,
    
    // State
    loading,
    error,
    count,
    clearing, // Added clearing state
    
    // Helpers
    isItemInWishlist,
    isWishlistEmpty,
    totalValue: getWishlistTotal(),
    isAuthenticated
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};