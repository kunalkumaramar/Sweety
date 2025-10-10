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

    const result = await addToWishlistAction(product);
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
const moveItemToCart = async (productId, quantity = 1, size = '', color = {}, selectedImage = '') => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    // Find the item in the wishlist using the product ID (item.id), not wishlist item ID (item._id)
    const foundItem = wishlistItems?.find((item) => {
      const itemProductId = item.id || (item.product && (item.product._id || item.product.id)) || item._id;
      return itemProductId === productId;
    });

    if (!foundItem) {
      console.error('ITEM NOT FOUND!');
      console.error('Searched for product ID:', productId);
      console.error('Available product IDs:', wishlistItems.map(item => item.id || (item.product && item.product._id)));
      throw new Error('Item not found in wishlist');
    }

    
    const productData = foundItem.product || foundItem;
    const correctProductId = foundItem.id || productData.id || productData._id;

    // If color object is complete, use it directly
    let finalColor = color;
    let finalSize = size;
    let finalImage = selectedImage;

    // If color object is empty or incomplete, get from product data
    if (!color || !color.colorName || !color.colorHex) {
      const availableColors = productData.colors;

      if (!availableColors || availableColors.length === 0) {
        throw new Error('No color information available for this product');
      }

      // Find the color that has the requested size in its sizeStock, or use first color
      let selectedColor = availableColors.find((color) =>
        color.sizeStock?.some((s) => s.size === size)
      ) || availableColors[0];

      if (!selectedColor) {
        throw new Error('No color information available for this product');
      }

      // Create complete color object
      finalColor = {
        colorName: selectedColor.colorName || 'Default',
        colorHex: selectedColor.colorHex || '#000000',
        images: selectedColor.images || [],
        sizeStock: selectedColor.sizeStock || [],
        _id: selectedColor._id
      };

      // Get available sizes from the selected color
      const availableSizes = selectedColor.sizeStock?.map((s) => s.size) || [];

      if (availableSizes.length === 0) {
        throw new Error('No sizes available for this product');
      }

      // Use the requested size if available, otherwise use first available size
      finalSize = availableSizes.includes(size) ? size : availableSizes[0];

      // Get image from selected color
      finalImage = selectedColor.images?.[0] || productData.image;
    }

    if (!finalImage) {
      throw new Error('Product image is required');
    }

    // Check stock availability
    const sizeStockInfo = finalColor.sizeStock?.find((s) => s.size === finalSize);
    if (sizeStockInfo && quantity > sizeStockInfo.stock) {
      throw new Error(`Only ${sizeStockInfo.stock} items available in size ${finalSize}`);
    }

    // Get the correct product ID for the API call
    //const correctProductId = productData._id || productData.id;

    // Prepare data for the async action
    const asyncCartData = {
      productId: correctProductId, // Use the correct product ID
      quantity,
      size: finalSize,
      color: finalColor, // Pass complete color object
      selectedImage: finalImage,
      fromWishlist: true
    };


    // Add to cart using the async action
    try {
      const cartResponse = await dispatch(addToCartAsync(asyncCartData)).unwrap();

      if (cartResponse && cartResponse.success !== false) {
        // If cart addition was successful, remove from wishlist
        await dispatch(removeFromWishlist(foundItem.id || foundItem._id)).unwrap();
        showNotification(`${productData.name} - Item moved to cart!`, 'success');
        return { success: true };
      } else {
        throw new Error(cartResponse?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      //console.error('Cart API error:', error);
      throw new Error(error?.message || 'Failed to move item to cart');
    }
  } catch (error) {
    //console.error('Error moving item to cart:', error);
    //showNotification(error.message || 'Failed to move item to cart', 'error');
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