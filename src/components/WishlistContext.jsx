import React, { createContext, useContext } from "react";
import { useDispatch } from "react-redux";
import { useWishlist as useWishlistHook } from "../hooks/useWishlist";
import { addToCartAsync, fetchCartDetails } from "../Redux/slices/cartSlice";
import { removeFromWishlist as removeFromWishlistThunk } from "../Redux/slices/WishlistSlice";
import Notification from "./Notification";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  const {
    wishlistItems,
    loading,
    error,
    count,
    clearing,
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
    toggleWishlist: toggleWishlistAction,
    moveToCart,
    moveAllToCart,
    clearWishlist,
    refreshWishlist,
    isItemInWishlist,
    isWishlistEmpty,
    getWishlistTotal,
    isAuthenticated
  } = useWishlistHook();

  const [notification, setNotification] = React.useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const addToWishlist = async (product, selectedSize = null, selectedColorName = null, selectedColorHex = null, selectedImage = null) => {
    if (!isAuthenticated) {
      showNotification('Please login to use wishlist', 'error');
      return { success: false };
    }

    if (typeof product !== 'object' || product === null) {
      console.error('Invalid product argument:', product);
      showNotification('Invalid product data. Cannot add to wishlist.', 'error');
      return { success: false, error: 'Invalid product object' };
    }

    if (!product._id && !product.id) {
      console.error('Product missing ID:', product);
      showNotification('Product ID is missing. Cannot add to wishlist.', 'error');
      return { success: false, error: 'Product ID required' };
    }

    const productWithSelection = {
      ...product,
      selectedSize: selectedSize || product.selectedSize,
      selectedColorName: selectedColorName || product.selectedColorName,
      selectedColorHex: selectedColorHex || product.selectedColorHex,
      selectedImage: selectedImage || product.selectedImage
    };

    //console.log('Full productWithSelection object:', productWithSelection);
    {/*console.log('Adding to wishlist with selection:', {
      product: productWithSelection.brand || productWithSelection.name,
      productId: productWithSelection._id || productWithSelection.id,
      selectedSize: productWithSelection.selectedSize,
      selectedColorName: productWithSelection.selectedColorName,
      selectedImage: productWithSelection.selectedImage
    });*/}

    const payload = {
      productId: productWithSelection._id || productWithSelection.id,
      priceWhenAdded: productWithSelection.price || productWithSelection.priceWhenAdded || productWithSelection.originalPrice || 0,
      selectedSize: productWithSelection.selectedSize,
      selectedColorName: productWithSelection.selectedColorName,
      selectedColorHex: productWithSelection.selectedColorHex,
      selectedImage: productWithSelection.selectedImage
    };

    if (!payload.productId) {
      console.error('Formatted payload missing productId:', payload);
      showNotification('Failed to extract product ID.', 'error');
      return { success: false, error: 'Product ID extraction failed' };
    }

    try {
      const result = await addToWishlistAction(payload);
      
      if (result && (result.success || !result.error)) {
        showNotification(`${productWithSelection.brand || productWithSelection.name} added to wishlist!`);
        return { success: true };
      } else {
        showNotification(
          result?.error === 'Authentication required' 
            ? 'Please login to use wishlist' 
            : `Failed to add ${productWithSelection.brand || productWithSelection.name} to wishlist: ${result?.error || 'Unknown error'}`,
          'error'
        );
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error('Thunk dispatch error:', error);
      showNotification(`Failed to add to wishlist: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
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

  const toggleWishlist = async (product, selectedSize = null, selectedColorName = null, selectedColorHex = null, selectedImage = null) => {
    if (!isAuthenticated) {
      showNotification('Please login to use wishlist', 'error');
      return { success: false };
    }

    if (typeof product !== 'object' || product === null) {
      console.error('Invalid product for toggle:', product);
      showNotification('Invalid product data. Cannot toggle wishlist.', 'error');
      return { success: false };
    }

    if (!product._id && !product.id) {
      console.error('Product missing ID for toggle:', product);
      showNotification('Product ID is missing. Cannot toggle wishlist.', 'error');
      return { success: false };
    }

    const productId = product._id || product.id;
    const wasInWishlist = isItemInWishlist(productId);
    
    const productWithSelection = {
      ...product,
      selectedSize: selectedSize || product.selectedSize,
      selectedColorName: selectedColorName || product.selectedColorName,
      selectedColorHex: selectedColorHex || product.selectedColorHex,
      selectedImage: selectedImage || product.selectedImage
    };

    //console.log('Full productWithSelection for toggle:', productWithSelection);

    const payload = {
      productId,
      priceWhenAdded: productWithSelection.price || productWithSelection.priceWhenAdded || productWithSelection.originalPrice || 0,
      selectedSize: productWithSelection.selectedSize,
      selectedColorName: productWithSelection.selectedColorName,
      selectedColorHex: productWithSelection.selectedColorHex,
      selectedImage: productWithSelection.selectedImage
    };

    if (!payload.productId) {
      showNotification('Failed to extract product ID for toggle.', 'error');
      return { success: false };
    }

    try {
      const result = await toggleWishlistAction(payload);
      
      if (result && (result.success || !result.error)) {
        const action = result.action || (wasInWishlist ? 'removed' : 'added');
        const message = action === 'added' 
          ? `${productWithSelection.brand || productWithSelection.name} added to wishlist!`
          : `${productWithSelection.brand || productWithSelection.name} removed from wishlist!`;
        const type = action === 'added' ? 'success' : 'info';
        
        showNotification(message, type);
        return { success: true };
      } else {
        showNotification(
          `Failed to ${wasInWishlist ? 'remove from' : 'add to'} wishlist: ${result?.error || 'Unknown error'}`,
          'error'
        );
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error('Toggle thunk error:', error);
      showNotification(`Failed to toggle wishlist: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  const moveItemToCart = async (productId, quantity = 1, size = '', color = {}, selectedImage = '') => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      {/*console.log('moveItemToCart called with:', {
        productId,
        quantity,
        size,
        color,
        selectedImage
      });*/}

      const foundItem = wishlistItems?.find((item) => {
        const itemProductId = item.id || (item.product && (item.product._id || item.product.id)) || item._id;
        const matches = itemProductId === productId || item._id === productId || item.id === productId;
       {/*console.log('Checking item:', {
          itemId: item.id,
          itemProductId: itemProductId,
          productId: productId,
          matches: matches,
          selectedSize: item.selectedSize,
          selectedColorName: item.selectedColorName
        });*/}
        return matches;
      });

      if (!foundItem) {
        console.error('Item not found in wishlist. Available items:', wishlistItems.map(item => ({
          id: item.id,
          productId: item.product?._id,
          selectedSize: item.selectedSize
        })));
        throw new Error('Item not found in wishlist');
      }

      {/*console.log('Found item in wishlist:', {
        selectedSize: foundItem.selectedSize,
        selectedColorName: foundItem.selectedColorName,
        selectedImage: foundItem.selectedImage
      });*/}

      const productData = foundItem.product || foundItem;
      const correctProductId = foundItem.id || productData.id || productData._id;

      let finalSize = foundItem.selectedSize || size;
      let finalColorName = foundItem.selectedColorName || color.colorName || 'Assorted colors';
      let finalColorHex = foundItem.selectedColorHex || color.colorHex || '#808080';
      let finalImage = foundItem.selectedImage || selectedImage || productData.image;

      if (!finalSize && productData.colors) {
        const firstColor = productData.colors[0];
        if (firstColor?.sizeStock?.[0]) {
          finalSize = firstColor.sizeStock[0].size;
        }
      }

      {/*console.log('Moving to cart with FINAL values:', {
        productId: correctProductId,
        size: finalSize,
        colorName: finalColorName,
        colorHex: finalColorHex,
        image: finalImage,
        storedSize: foundItem.selectedSize,
        passedSize: size
      });*/}

      const asyncCartData = {
        productId: correctProductId,
        quantity,
        size: finalSize,
        color: {
          colorName: finalColorName,
          colorHex: finalColorHex
        },
        selectedImage: finalImage,
        fromWishlist: true
      };

      // FIXED: Call addToCartAsync directly through dispatch
      const cartResponse = await dispatch(addToCartAsync(asyncCartData)).unwrap();

      if (cartResponse && cartResponse.success !== false) {
        // Remove from wishlist after successful cart add
        await removeFromWishlistAction(correctProductId);
        
        // FIXED: Refresh cart details to sync Navbar and other components
        try {
          await dispatch(fetchCartDetails()).unwrap();
        } catch (cartRefreshError) {
          console.warn('Cart refresh error (non-critical):', cartRefreshError);
        }
        
        showNotification('Item moved to cart!', 'success');
        //console.log('Before refreshWishlist, wishlistItems:', wishlistItems);
        await refreshWishlist();
        //console.log('After refreshWishlist, wishlistItems:', wishlistItems);
        return { success: true };
      } else {
        throw new Error(cartResponse?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error moving item to cart:', error);
      showNotification(error.message || 'Failed to move item to cart', 'error');
      return { success: false, error: error.message };
    }
  };

  const moveAllItemsToCart = async () => {
    if (isWishlistEmpty()) {
      showNotification('Your wishlist is empty', 'info');
      return { success: false };
    }

    //console.log('Before moveAllToCart, wishlistItems:', wishlistItems);
    const result = await moveAllToCart();
    
    if (result.success) {
      showNotification('All items moved to cart!', 'success');
      //console.log('Before refreshWishlist (moveAll), wishlistItems:', wishlistItems);
      await refreshWishlist();
      //console.log('After refreshWishlist (moveAll), wishlistItems:', wishlistItems);
    } else {
      const message = result.moved > 0 
        ? `${result.moved} items moved to cart, ${result.failed} failed`
        : 'Failed to move items to cart';
      showNotification(message, result.moved > 0 ? 'info' : 'error');
    }
    
    return result;
  };

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

  const contextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    moveToCart: moveItemToCart,
    moveAllToCart: moveAllItemsToCart,
    clearWishlist: clearWishlistItems,
    refreshWishlist,
    loading,
    error,
    count,
    clearing,
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