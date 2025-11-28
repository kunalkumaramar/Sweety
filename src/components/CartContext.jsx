//src/components/CartContext.jsx - Updated for new API structure with guest cart support
import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setAuthenticated,
  addToCart as addToCartLocal,
  removeFromCart,
  updateQuantity,
  clearCart,
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
  syncWithApiCart,
  applyGuestDiscountAsync,
  removeGuestDiscountAsync,
} from "../Redux/slices/cartSlice";
import { apiService } from "../services/api";
import Notification from "./Notification";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Get cart state from Redux
  const {
    items: cartItems,
    totalItems,
    totalPrice,
    cartDetails,
    cart,
    totals,
    isAuthenticated,
    loading,
    addingToCart,
    updatingCart,
    removingFromCart,
    clearingCart,
    validatingCart,
    mergingCart,
    applyingDiscount,
    removingDiscount,
    error,
    addError,
    updateError,
    removeError,
    clearError,
    validateError,
    mergeError,
    discountError,
    hasDiscount,
    appliedDiscount,
    cartValidation,
  } = useSelector((state) => state.cart);

  const [notification, setNotification] = React.useState(null);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const authStatus = !!token;
      if (authStatus !== isAuthenticated) {
        dispatch(setAuthenticated(authStatus));
      }
    };

    checkAuth();

    // Listen for storage changes (user login/logout)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [dispatch, isAuthenticated]);

  // Load cart details on mount and when auth status changes
  useEffect(() => {
    dispatch(fetchCartDetails());
  }, [dispatch, isAuthenticated]);

  // Show notifications for errors
  useEffect(() => {
    if (addError) {
      showNotification("Failed to add item to cart", "error");
    }
    if (updateError) {
      showNotification("Failed to update cart item", "error");
    }
    if (removeError) {
      showNotification("Failed to remove item from cart", "error");
    }
    if (clearError) {
      showNotification("Failed to clear cart", "error");
    }
    if (validateError && isAuthenticated) {
      showNotification("Cart validation failed", "error");
    }
    if (mergeError) {
      showNotification("Failed to merge cart", "error");
    }
    if (discountError) {
      showNotification("Discount operation failed", "error");
    }
  }, [
    addError,
    updateError,
    removeError,
    clearError,
    validateError,
    mergeError,
    discountError,
    isAuthenticated,
  ]);

  // Auto-merge cart when user logs in
  useEffect(() => {
    const handleAuthChange = async () => {
      const sessionId = localStorage.getItem("guestSessionId");
      if (isAuthenticated && sessionId) {
        await dispatch(mergeCartAsync(sessionId));
        localStorage.removeItem("guestSessionId");
        dispatch(fetchCartDetails());
      }
    };

    handleAuthChange();
  }, [isAuthenticated, dispatch]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  // Add to cart with color and image selection
  const addToCart = async (
    product,
    quantity = 1,
    selectedColor = "",
    selectedSize = "M",
    selectedImage = ""
  ) => {
    try {
      // Validate input
      if (!product) {
        throw new Error("Product is required");
      }

      const productId = product.id || product._id;
      if (!productId) {
        throw new Error("Product ID is required");
      }

      // Ensure product has required fields with fallbacks
      const productData = {
        _id: productId,
        name: product.name || product.brand || "Unknown Product",
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        images: Array.isArray(product.images)
          ? product.images
          : product.image
          ? [product.image]
          : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        description: product.description || "",
        rating: product.rating || 0,
      };

      // Prepare color object based on product data
      const colorObj =
        selectedColor && productData.colors.length > 0
          ? productData.colors.find(
              (c) => c.colorName === selectedColor || c.name === selectedColor
            ) || { colorName: selectedColor, colorHex: "#000000" }
          : { colorName: selectedColor || "", colorHex: "#000000" };

      // Use selected image or first available image
      const imageUrl =
        selectedImage ||
        (productData.images.length > 0 ? productData.images[0] : "") ||
        "";

      // Immediate UI feedback
      dispatch(
        addToCartLocal({
          product: productData,
          size: selectedSize.toLowerCase(),
          quantity: Math.max(1, quantity),
          color: colorObj,
          selectedImage: imageUrl,
        })
      );

      // API call
      await dispatch(
        addToCartAsync({
          productId: productData._id,
          quantity: Math.max(1, quantity),
          size: selectedSize.toLowerCase(),
          color: colorObj,
          selectedImage: imageUrl,
        })
      ).unwrap();

      showNotification(`${product.name || product.brand} added to cart!`);

      return { success: true };
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Remove from local state if API call failed
      const productId = product?.id || product?._id;
      if (productId) {
        dispatch(
          removeFromCart({
            productId,
            size: selectedSize.toLowerCase(),
            colorName: selectedColor,
          })
        );
      }
      showNotification(
        `Failed to add ${product.name || product.brand} to cart`,
        "error"
      );
      return {
        success: false,
        error: error.message || "Failed to add item to cart",
      };
    }
  };

  // Update cart quantity by item ID
  const updateQuantity = async (itemId, newQuantity) => {
    if (!itemId) {
      showNotification("Item ID is required", "error");
      return { success: false };
    }

    const item = cartItems.find((item) => item._id === itemId);

    if (!item) {
      showNotification("Item not found in cart", "error");
      return { success: false };
    }

    const validQuantity = Math.max(1, newQuantity || 1);

    try {
      // Immediate UI feedback
      dispatch(
        updateQuantity({
          itemId,
          quantity: validQuantity,
        })
      );

      // API call
      await dispatch(
        updateCartItemAsync({
          itemId,
          quantity: validQuantity,
          size: item.size || "M",
          color: item.color || {},
          selectedImage: item.selectedImage || "",
        })
      ).unwrap();

      return { success: true };
    } catch (error) {
      console.error("Failed to update cart:", error);
      // Refresh cart to restore correct state
      dispatch(fetchCartDetails());
      showNotification("Failed to update cart item", "error");
      return {
        success: false,
        error: error.message || "Failed to update item quantity",
      };
    }
  };

  // Update cart quantity by change amount (for +/- buttons)
  const updateCartQuantity = async (itemId, change) => {
    const item = cartItems.find((item) => item._id === itemId);

    if (!item) return { success: false };

    const newQuantity = Math.max(1, (item.quantity || 1) + change);
    return updateQuantity(itemId, newQuantity);
  };

  // Delete item from cart by item ID
  const deleteItem = async (itemId) => {
    if (!itemId) {
      showNotification("Item ID is required", "error");
      return { success: false };
    }

    const item = cartItems.find((item) => item._id === itemId);

    if (!item) {
      showNotification("Item not found in cart", "error");
      return { success: false };
    }

    const productId = item.product?._id || item.productId;
    const productName = item.product?.name || item.product?.brand || "Item";
    const size = item.size || "";
    const colorName = item.color?.colorName || "";

    if (!productId) {
      showNotification("Product ID not found", "error");
      return { success: false };
    }

    try {
      // Immediate UI feedback
      dispatch(
        removeFromCart({
          productId,
          size,
          colorName,
        })
      );

      // API call
      await dispatch(
        removeFromCartAsync({
          productId,
          size,
          colorName,
        })
      ).unwrap();

      showNotification(`${productName} removed from cart!`, "info");
      return { success: true };
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      // Refresh cart to restore correct state
      dispatch(fetchCartDetails());
      showNotification("Failed to remove item from cart", "error");
      return {
        success: false,
        error: error.message || "Failed to delete item",
      };
    }
  };

  // Clear entire cart
  const clearCartItems = async () => {
    try {
      await dispatch(clearCartAsync()).unwrap();
      showNotification("Cart cleared successfully!", "info");
      return { success: true };
    } catch (error) {
      console.error("Failed to clear cart:", error);
      showNotification("Failed to clear cart", "error");
      return { success: false, error: error.message || "Failed to clear cart" };
    }
  };

  // Validate cart (only for authenticated users)
  const validateCart = async () => {
    if (!isAuthenticated) {
      return {
        valid: true,
        issues: [],
        message: "Validation not available for guest users",
      };
    }

    try {
      const result = await dispatch(validateCartAsync()).unwrap();

      if (!result.valid && result.issues?.length > 0) {
        showNotification(
          `Cart validation issues: ${result.issues.join(", ")}`,
          "warning"
        );
      }

      return result;
    } catch (error) {
      console.error("Failed to validate cart:", error);
      showNotification("Failed to validate cart", "error");
      return {
        valid: false,
        issues: ["Validation failed"],
        error: error.message,
      };
    }
  };

  // Add to wishlist
  const addToWishlistHandler = async (item) => {
    if (!isAuthenticated) {
      showNotification("Please login to add items to wishlist", "error");
      return { success: false, error: "Authentication required" };
    }

    try {
      const productId = item.product?._id || item._id;
      const productPrice = item.product?.price || item.price || 0;
      await apiService.addToWishlist(productId, productPrice);
      showNotification(`${item.product?.name || item.name} added to wishlist!`);
      return { success: true };
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      showNotification("Failed to add to wishlist", "error");
      return { success: false, error: error.message };
    }
  };

  // Handle cart merge after user login
  const mergeCart = async () => {
    try {
      const sessionId = localStorage.getItem("guestSessionId");
      if (sessionId && isAuthenticated) {
        await dispatch(mergeCartAsync(sessionId)).unwrap();
        // Clear guest session after merge
        localStorage.removeItem("guestSessionId");
        // Refresh cart details
        dispatch(fetchCartDetails());
        showNotification("Cart merged successfully!");
        return { success: true };
      }
      return { success: false, message: "No guest cart to merge" };
    } catch (error) {
      console.error("Failed to merge cart:", error);
      showNotification("Failed to merge cart", "error");
      return { success: false, error: error.message };
    }
  };

  // Apply discount/coupon (only for authenticated users)
  // Apply discount for both authenticated and guest users
  const applyDiscount = async (code, type = "coupon") => {
    if (!code || typeof code !== "string") {
      showNotification("Please enter a valid discount code", "error");
      return { success: false, error: "Valid discount code is required" };
    }

    try {
      let result;

      if (isAuthenticated) {
        // Authenticated users
        result = await dispatch(
          applyDiscountAsync({ code: code.trim(), type })
        ).unwrap();
        showNotification("Discount applied successfully!");
      } else {
        // Guest users
        result = await dispatch(
          applyGuestDiscountAsync({ code: code.trim(), type })
        ).unwrap();
        showNotification("Discount applied successfully!");
      }

      // Refresh cart details to get updated totals
      dispatch(fetchCartDetails());
      return { success: true, result };
    } catch (error) {
      console.error("Failed to apply discount:", error);
      showNotification(
        "Failed to apply discount. Please check the code and try again.",
        "error"
      );
      return { success: false, error: error.message };
    }
  };

  // Remove discount - works for both authenticated and guest users
  const removeDiscount = async () => {
    try {
      // Use different thunk based on authentication status
      if (isAuthenticated) {
        await dispatch(removeDiscountAsync()).unwrap();
      } else {
        await dispatch(removeGuestDiscountAsync()).unwrap();
      }

      // Refresh cart details to get updated totals
      dispatch(fetchCartDetails());
      showNotification("Discount removed successfully!", "info");
      return { success: true };
    } catch (error) {
      console.error("Failed to remove discount:", error);
      showNotification("Failed to remove discount", "error");
      return { success: false, error: error.message };
    }
  };

  // Refresh cart data
  const refreshCart = () => {
    dispatch(fetchCartDetails());
  };

  // Clear all errors
  const clearAllErrors = () => {
    dispatch(clearErrors());
  };

  // Helper functions
  const getCartTotal = () => {
    return totals?.total >= 0 ? totals.total : totalPrice || 0;
  };

  const getCartSubtotal = () => {
    if (totals?.subtotal >= 0) {
      return totals.subtotal;
    }

    return cartItems.reduce((total, item) => {
      const itemPrice = item.product?.price || item.price || 0;
      const itemQuantity = item.quantity || 0;
      const itemTotal = item.itemTotal || itemPrice * itemQuantity;
      return total + itemTotal;
    }, 0);
  };

  const getDiscountAmount = () => {
    return totals?.discountAmount || 0;
  };

  const getCartItemCount = () => {
    if (totals?.itemCount >= 0) {
      return totals.itemCount;
    }

    if (totalItems >= 0) {
      return totalItems;
    }

    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Transform cart items to match the expected format for the Cart component
  const transformedCartItems = cartItems.map((item) => ({
    id: item._id,
    _id: item._id,
    name: item.product?.name || item.name,
    brand: item.product?.name || item.brand,
    description:
      item.product?.description || item.description || item.product?.name,
    price: item.product?.price || item.price,
    originalPrice:
      item.product?.originalPrice || item.originalPrice || item.product?.price,
    discount:
      item.product?.originalPrice && item.product?.price
        ? Math.round(
            ((item.product.originalPrice - item.product.price) /
              item.product.originalPrice) *
              100
          )
        : 0,
    image:
      item.selectedImage ||
      (Array.isArray(item.product?.images)
        ? item.product.images[0]
        : item.product?.images) ||
      item.image,
    images: item.product?.images || item.images,
    rating: item.product?.rating || item.rating || 5,
    color: item.color || {},
    size: item.size,
    quantity: item.quantity,
    selectedImage: item.selectedImage,
    addedAt: item.addedAt,
    itemTotal: item.itemTotal,
    product: item.product,
  }));

  const contextValue = {
    // Cart data
    items: transformedCartItems,
    cartItems: transformedCartItems, // Alias for backward compatibility
    totalItems: getCartItemCount(),
    totalPrice: getCartTotal(),
    cartDetails,
    cart,
    totals,
    isAuthenticated,

    // Computed values
    subtotal: getCartSubtotal(),
    discountAmount: getDiscountAmount(),

    // Cart actions
    addToCart,
    addItemToCart: addToCart, // Alias for consistency
    updateQuantity: updateCartQuantity, // For +/- buttons
    updateItemQuantity: updateQuantity, // For direct quantity update
    deleteItem,
    clearCartItems,
    refreshCart,
    validateCart,

    // Wishlist
    addToWishlist: addToWishlistHandler,

    // User actions
    mergeCart,

    // Discount actions (only available for authenticated users)
    applyDiscount,
    removeDiscount,
    hasDiscount,
    appliedDiscount,

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

    // Error states and management
    error,
    addError,
    updateError,
    removeError,
    clearError,
    validateError,
    mergeError,
    discountError,
    clearAllErrors,

    // Validation
    cartValidation,

    // Helper functions
    getCartTotal,
    getCartSubtotal,
    getDiscountAmount,
    getCartItemCount,

    // Utility
    syncWithApiCart: (data) => dispatch(syncWithApiCart(data)),
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
