import { useSelector, useDispatch } from "react-redux";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "./WishlistContext";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SignIn from "../pages/SignIn";
import Notification from "./Notification";
import {
  validateDiscountAsync,
  applyDiscountAsync,
  removeDiscountAsync,
} from "../Redux/slices/cartSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ⭐ Enhanced Reusable Cart Item Component
const CartItem = ({ item, updateQuantity, deleteItem }) => {
  const itemRef = useRef(null);
  const quantityRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const element = itemRef.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.01,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        boxShadow: "none",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const goToDetail = () => {
    navigate(`/product/${item.product?._id || item._id}`);
  };

  const handleQuantityChange = async (change) => {
    if (quantityRef.current) {
      gsap.to(quantityRef.current, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }

    if (item.quantity === 1 && change === -1) {
      handleDelete();
    } else {
      const newQuantity = Math.max(1, item.quantity + change);
      await updateQuantity(item._id, newQuantity);
    }
  };

  const handleDelete = () => {
    gsap.to(itemRef.current, {
      x: -100,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => deleteItem(item._id),
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: item.product?.name || item.name,
      text: `Check out this amazing product: ${
        item.product?.name || item.name
      }`,
      url: `${window.location.origin}/product/${item.product?._id || item._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Product link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // FIXED: Better price calculation with proper fallbacks
  const currentPrice = item.product?.price || item.price || 0;
  const originalPrice =
    item.product?.originalPrice || (currentPrice > 0 ? currentPrice * 1.2 : 0);
  const discount =
    originalPrice > 0 && currentPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  // Get proper item total - use server-calculated value or calculate locally
  const itemTotal = item.itemTotal || currentPrice * (item.quantity || 1);

  return (
    <div
      ref={itemRef}
      className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0 items-start transition-all duration-300"
    >
      <img
        src={item.selectedImage || item.product?.images?.[0] || item.image}
        alt={item.product?.name || item.name}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={goToDetail}
        loading="lazy"
      />

      {/* Mobile Layout */}
      <div className="flex-1 lg:hidden">
        <div
          className="text-base sm:text-lg font-semibold text-gray-800 mb-1 hover:text-pink-600 transition-colors cursor-pointer"
          onClick={goToDetail}
        >
          {item.product?.name || item.name}
        </div>
        {/* Color and Size */}
        {(item.color?.colorName || item.size) && (
          <div className="flex gap-2 mb-2">
            {item.color?.colorName && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: item.color.colorHex || "#000" }}
                ></div>
                {item.color.colorName}
              </span>
            )}
            {item.size && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                Size: {item.size.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className="mb-3">
          {discount > 0 && (
            <div className="bg-pink-600 text-white text-xs px-2 py-1 rounded mb-1 inline-block animate-pulse">
              {discount}% OFF
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold text-gray-800">
              ₹{currentPrice > 0 ? currentPrice.toLocaleString() : "0"}
            </div>
            {originalPrice > currentPrice && (
              <div className="text-sm text-gray-500 line-through">
                M.R.P: ₹{originalPrice.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Quantity + Actions */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center border border-pink-300 rounded-full overflow-hidden">
            <button
              className="w-8 h-8 flex items-center justify-center text-lg text-gray-600 hover:bg-pink-100 hover:text-pink-600"
              onClick={() => handleQuantityChange(-1)}
            >
              {item.quantity === 1 ? "🗑️" : "-"}
            </button>
            <input
              ref={quantityRef}
              type="text"
              value={item.quantity || 1}
              readOnly
              className="w-10 text-center bg-transparent text-sm font-medium"
            />
            <button
              className="w-8 h-8 flex items-center justify-center text-lg text-gray-600 hover:bg-pink-100 hover:text-pink-600"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="text-gray-300">|</span>
            <button
              className="text-pink-600 hover:underline"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-800">
            ₹{itemTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 gap-4">
        <div className="flex-1 pr-5">
          <div
            className="text-base font-semibold text-gray-800 mb-1 hover:text-pink-600 cursor-pointer"
            onClick={goToDetail}
          >
            {item.product?.name || item.name}
          </div>

          {/* Color and Size */}
          {(item.color?.colorName || item.size) && (
            <div className="flex gap-2 mb-2">
              {item.color?.colorName && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: item.color.colorHex || "#000" }}
                  ></div>
                  {item.color.colorName}
                </span>
              )}
              {item.size && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Size: {item.size.toUpperCase()}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-pink-300 rounded-full overflow-hidden">
              <button
                className="w-8 h-8 flex items-center justify-center text-lg text-gray-600 hover:bg-pink-100 hover:text-pink-600"
                onClick={() => handleQuantityChange(-1)}
              >
                {item.quantity === 1 ? "🗑️" : "-"}
              </button>
              <input
                ref={quantityRef}
                type="text"
                value={item.quantity || 1}
                readOnly
                className="w-10 text-center bg-transparent text-sm font-medium"
              />
              <button
                className="w-8 h-8 flex items-center justify-center text-lg text-gray-600 hover:bg-pink-100 hover:text-pink-600"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>

            <div className="flex gap-2 text-xs">
              <span className="text-gray-300">|</span>
              <button
                className="text-pink-600 hover:underline"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right min-w-28">
          {discount > 0 && (
            <div className="bg-pink-600 text-white text-xs px-2 py-1 rounded mb-1 inline-block animate-pulse">
              {discount}% OFF
            </div>
          )}
          <div className="text-lg font-semibold text-gray-800">
            ₹{currentPrice > 0 ? currentPrice.toLocaleString() : "0"}
          </div>
          {originalPrice > currentPrice && (
            <div className="text-sm text-gray-500 line-through mt-1">
              M.R.P: ₹{originalPrice.toLocaleString()}
            </div>
          )}
          <div className="text-lg font-semibold text-gray-800 mt-2">
            Total: ₹{itemTotal.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// ⭐ Deal Item Component with better product filtering
const DealItem = ({ deal,  }) => {
  const itemRef = useRef(null);
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/product/${deal._id || deal.id}`);

  

  const originalPrice = deal.originalPrice || deal.price * 1.2;
  const discount = Math.round(
    ((originalPrice - deal.price) / originalPrice) * 100
  );

  return (
    <div
      ref={itemRef}
      className="flex gap-3 py-3 border-b border-gray-200 last:border-b-0"
    >
      <img
        src={
          deal.colors?.[0]?.images?.[0] ||
          deal.images?.[0] ||
          "/placeholder-image.jpg"
        }
        alt={deal.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover cursor-pointer"
        onClick={goToDetail}
        loading="lazy"
      />
      <div className="flex-1">
        <div
          onClick={goToDetail}
          className="text-sm font-semibold text-gray-800 mb-1 cursor-pointer hover:text-pink-600"
        >
          {deal.name}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-pink-600 text-xs font-semibold">
            -{discount}%
          </span>
          <span className="text-sm font-semibold text-gray-800">
            ₹{deal.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ⭐ Enhanced Coupon Component with better error handling
const CouponSection = ({
  onApplyDiscount,
  onRemoveDiscount,
  hasDiscount,
  appliedDiscount,
  loading,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [error, setError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setError("");
    const result = await onApplyDiscount(couponCode.trim());
    if (result.success) {
      setCouponCode("");
      setShowCouponInput(false);
    } else {
      setError(result.error || "Failed to apply coupon");
    }
  };

  const handleRemoveDiscount = async () => {
    setError("");
    const result = await onRemoveDiscount();
    if (!result.success) {
      setError(result.error || "Failed to remove discount");
    }
  };

  if (hasDiscount && appliedDiscount) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <div className="flex flex-col">
          <span className="text-green-600 text-sm font-medium">
            ✓ Discount Applied
          </span>
          <span className="text-green-700 text-xs">
            {appliedDiscount.code} - ₹
            {(appliedDiscount.discountAmount || 0).toLocaleString()} off
          </span>
        </div>
        <button
          onClick={handleRemoveDiscount}
          disabled={loading}
          className="text-red-600 text-xs hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {error && (
        <div className="text-red-500 text-xs mb-2 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {!showCouponInput ? (
        <button
          onClick={() => {
            setShowCouponInput(true);
            setError("");
          }}
          className="w-full bg-white border border-pink-300 text-pink-600 py-3 rounded-3xl text-sm font-semibold hover:bg-pink-50 transition-colors"
        >
          Add Coupon
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setError("");
            }}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border border-pink-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || loading}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Applying..." : "Apply"}
          </button>
          <button
            onClick={() => {
              setShowCouponInput(false);
              setCouponCode("");
              setError("");
            }}
            className="text-gray-500 px-2 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// Main Cart Component
const Cart = () => {
  const dispatch = useDispatch();

  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const auth = useSelector((state) => state.auth);
  // Get cart items from Redux
  const { items } = useSelector((state) => state.cart);

  const {
    items: cartItems,
    totals,
    totalItems,
    updateItemQuantity,
    deleteItem,
    addItemToCart,
    hasDiscount,
    appliedDiscount,
    applyingDiscount,
    removingDiscount,
    clearCartItems,
    loading,
    isAuthenticated,
  } = useCart();

  const handleProceedToBuy = async () => {
    if (!cartItems.length) return;

    const token = localStorage.getItem("token");
    if (!token || !auth.isAuthenticated) {
      setShowSignIn(true);
    } else {
      navigate("/checkout");
    }
  };

  const { addToWishlist } = useWishlist();
  const containerRef = useRef(null);
  const [deals, setDeals] = useState([]);
  const [rawDeals, setRawDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  const renderStars = (rating) => "★".repeat(Math.floor(rating));

  // Use totals from API with proper fallbacks
  const getTotalItems = () => {
    if (totals?.itemCount >= 0) return totals.itemCount;
    if (totalItems >= 0) return totalItems;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getSubtotal = () => {
    if (totals?.subtotal >= 0) return totals.subtotal;
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 0;
      const itemTotal = item.itemTotal || price * quantity;
      return total + itemTotal;
    }, 0);
  };

  const getDiscountAmount = () => totals?.discountAmount || 0;

  const getTotalAmount = () => {
    if (totals?.total >= 0) return totals.total;
    return Math.max(0, getSubtotal() - getDiscountAmount());
  };

  // Fetch popular deals from API, excluding items already in cart
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setDealsLoading(true);

        // Fetch categories
        const categoriesRes = await fetch(`${API_BASE_URL}/category`);
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.data || [];

        const products = [];

        for (const category of categories) {
          // Fetch subcategories
          const subcategoriesRes = await fetch(
            `${API_BASE_URL}/sub-category/category/${category._id}`
          );
          const subcategoriesData = await subcategoriesRes.json();
          const subcategories = subcategoriesData.data || [];

          if (subcategories.length > 0) {
            // Fetch one product from each subcategory
            for (const subcategory of subcategories) {
              const productsRes = await fetch(
                `${API_BASE_URL}/product/subcategory/${subcategory._id}?page=1&limit=1&isActive=true`
              );
              const productsData = await productsRes.json();
              const latestProduct = productsData.data?.products?.[0];

              if (latestProduct) {
                products.push({
                  ...latestProduct,
                  categoryName: category.name,
                  subcategoryName: subcategory.name,
                });
              }
            }
          } else {
            // No subcategories - fetch directly from category
            const productsRes = await fetch(
              `${API_BASE_URL}/product/category/${category._id}?page=1&limit=1&isActive=true`
            );
            const productsData = await productsRes.json();
            const latestProduct = productsData.data?.products?.[0];

            if (latestProduct) {
              products.push({
                ...latestProduct,
                categoryName: category.name,
                subcategoryName: null,
              });
            }
          }
        }

        setRawDeals(products);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
        setRawDeals([]);
      } finally {
        setDealsLoading(false);
      }
    };

    // Only fetch if we have cart items loaded
    if (!loading) {
      const cacheKey = "cart_raw_deals";
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      const cacheExpiry = 3600000; // 1 hour

      if (cached && cacheTime && now - parseInt(cacheTime) < cacheExpiry) {
        setRawDeals(JSON.parse(cached));
        setDealsLoading(false);
      } else {
        fetchDeals();
      }
    }
  }, [loading]); // Removed cartItems from deps to avoid refetch on cart change

  useEffect(() => {
    if (rawDeals.length === 0) {
      setDeals([]);
      return;
    }

    const cacheKey = "cart_raw_deals";
    // Filter out cart items and limit to 6
    const cartProductIds = cartItems.map(
      (item) => item.product?._id || item.productId
    );
    const filteredProducts = rawDeals
      .filter((product) => !cartProductIds.includes(product._id))
      .slice(0, 6);

    setDeals(filteredProducts);

    // Cache the raw data
    localStorage.setItem(cacheKey, JSON.stringify(rawDeals));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  }, [rawDeals, cartItems]);

  const handleApplyDiscount = async (code) => {
    if (!code.trim()) {
      showNotification("Please enter a discount code", "error");
      return { success: false, error: "Please enter a discount code" };
    }

    try {
      // Get all product IDs from cart
      const productIds = items.map(
        (item) => item.product?._id || item.productId
      );

      // First validate if discount can be used
      const validationResult = await dispatch(
        validateDiscountAsync({
          code: code.trim(),
          productIds,
        })
      ).unwrap();

      // Check the nested canUse
      if (!validationResult?.data?.canUse) {
        const errorMessage =
          validationResult?.data?.message || "Invalid discount code";
        throw new Error(errorMessage);
      }

      // If validation passes (assuming canUse: true), apply the discount
      const result = await dispatch(
        applyDiscountAsync({
          code: code.trim(),
          type: "coupon",
        })
      ).unwrap();

      const discountAmount =
        result.appliedCoupon?.discountAmount ||
        result.appliedVoucher?.discountAmount ||
        0;

      showNotification(
        `Discount applied successfully! You saved ₹${discountAmount}`,
        "success"
      );
      return { success: true, result };
    } catch (error) {
      // Handle validation errors
      const errorMessage =
        typeof error === "string" ? error : error.message || "";

      if (errorMessage.toLowerCase().includes("already used")) {
        showNotification("You have already used this discount code", "error");
      } else if (errorMessage.toLowerCase().includes("expired")) {
        showNotification("This discount code has expired", "error");
      } else if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("invalid")
      ) {
        showNotification("Invalid discount code", "error");
      } else {
        showNotification(errorMessage || "Failed to apply discount", "error");
      }

      return { success: false, error: errorMessage };
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await dispatch(removeDiscountAsync()).unwrap();
      showNotification("Discount removed successfully", "info");
      return { success: true };
    } catch (error) {
      const errorMessage =
        typeof error === "string" ? error : error.message || "";
      showNotification("Failed to remove discount", "error");
      return { success: false, error: errorMessage };
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* Mobile Layout */}
      <div className="lg:hidden p-3 pb-24" ref={containerRef}>
        {/* Auth Status Indicator */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              <span className="font-medium">Guest Mode:</span> Your cart will be
              saved temporarily.
              <button
                onClick={() => setShowSignIn(true)}
                className="underline ml-1 text-pink-600 hover:text-pink-700"
              >
                Login
              </button>
              to save permanently.
            </div>
          </div>
        )}{" "}
        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-4">
          <div className="text-base font-semibold mb-2">
            Subtotal ({getTotalItems()} items): ₹
            {getSubtotal().toLocaleString()}
          </div>
          {getDiscountAmount() > 0 && (
            <div className="text-sm text-green-600 mb-2">
              Discount: -₹{getDiscountAmount().toLocaleString()}
            </div>
          )}
          <div className="text-xl font-semibold mb-4 text-pink-600">
            Total: ₹{getTotalAmount().toLocaleString()}
          </div>
          <div className="flex flex-col gap-3">
            <CouponSection
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
              hasDiscount={hasDiscount}
              appliedDiscount={appliedDiscount}
              loading={applyingDiscount || removingDiscount}
            />
            <button
              onClick={handleProceedToBuy}
              className="bg-pink-600 text-white py-3 rounded-3xl text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
              disabled={!cartItems.length}
            >
              Proceed to Buy ({getTotalItems()} items)
            </button>

            {/* SignIn Modal */}
            <SignIn
              isOpen={showSignIn}
              onClose={() => setShowSignIn(false)}
              initialMode="login"
            />
          </div>
        </div>
        {/* Cart */}
        <div className="bg-white rounded-xl shadow-lg mb-4">
          <div className="flex justify-between items-center text-lg font-semibold p-4 border-b">
            <div className="flex items-center gap-2">
              Shopping Cart{" "}
              <span className="text-gray-500 text-sm">
                ({getTotalItems()} items)
              </span>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCartItems}
                className="text-pink-600 text-sm hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="px-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10">
                <div className="text-4xl text-gray-300 mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Add items to get started with your shopping
                </p>
                <button
                  className="bg-pink-600 text-white py-3 px-6 rounded-2xl text-sm"
                  onClick={() => (window.location.href = "/")}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  updateQuantity={updateItemQuantity}
                  deleteItem={deleteItem}
                  addToWishlist={addToWishlist}
                  renderStars={renderStars}
                />
              ))
            )}
          </div>
        </div>
        {/* Deals */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="text-lg font-semibold text-center p-4 border-b">
            Popular Deals
          </div>
          <div className="px-4 pb-4">
            {dealsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading deals...
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No deals available
              </div>
            ) : (
              deals.map((deal) => (
                <DealItem
                  key={deal._id}
                  deal={deal}
                  addToCart={addItemToCart}
                  renderStars={renderStars}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block p-5" ref={containerRef}>
        <div className="max-w-7xl mx-auto flex gap-5 h-[calc(100vh-40px)]">
          {/* Cart Section */}
          <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col">
            {/* Auth Status Indicator */}
            {!isAuthenticated && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                <div className="text-yellow-800 text-sm">
                  <span className="font-medium">Guest Mode:</span> Your cart
                  will be saved temporarily.
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="underline ml-1 text-pink-600 hover:text-pink-700"
                  >
                    Login
                  </button>
                  to save permanently.
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-semibold p-5 border-b">
              <div className="flex items-center gap-2">
                Shopping Cart{" "}
                <span className="text-gray-500 text-base">
                  ({getTotalItems()} items)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-base">Price</span>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCartItems}
                    className="text-pink-600 text-sm hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 hide-scrollbar">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="text-6xl text-gray-300 mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add items to get started with your shopping
                  </p>
                  <button
                    className="bg-pink-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-pink-700"
                    onClick={() => (window.location.href = "/")}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    updateQuantity={updateItemQuantity}
                    deleteItem={deleteItem}
                    addToWishlist={addToWishlist}
                    renderStars={renderStars}
                  />
                ))
              )}
            </div>
          </div>

          {/* Summary + Deals */}
          <div className="w-2/5 flex flex-col h-full">
            {/* Subtotal (fixed height, content auto) */}
            <div className="bg-white rounded-xl p-5 shadow-lg mb-5">
              <div className="text-lg font-semibold mb-2">
                Subtotal ({getTotalItems()} items): ₹
                {getSubtotal().toLocaleString()}
              </div>
              {getDiscountAmount() > 0 && (
                <div className="text-base text-green-600 mb-2">
                  Discount: -₹{getDiscountAmount().toLocaleString()}
                </div>
              )}
              <div className="text-2xl font-semibold mb-5 text-pink-600">
                Total: ₹{getTotalAmount().toLocaleString()}
              </div>
              <div className="flex flex-col gap-3">
                <CouponSection
                  onApplyDiscount={handleApplyDiscount}
                  onRemoveDiscount={handleRemoveDiscount}
                  hasDiscount={hasDiscount}
                  appliedDiscount={appliedDiscount}
                  loading={applyingDiscount || removingDiscount}
                />
                <button
                  onClick={handleProceedToBuy}
                  className="bg-pink-600 text-white py-3 rounded-3xl text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
                  disabled={!cartItems.length}
                >
                  Proceed to Buy ({getTotalItems()} items)
                </button>
              </div>
            </div>

            {/* Deals (fills rest, scrolls) */}
            <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col min-h-0">
              <div className="text-lg font-semibold text-center p-5 border-b">
                Popular Deals
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5 hide-scrollbar">
                {dealsLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading deals...
                  </div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No deals available
                  </div>
                ) : (
                  deals.map((deal) => (
                    <DealItem
                      key={deal._id}
                      deal={deal}
                      addToCart={addItemToCart}
                      renderStars={renderStars}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-md w-full mx-4">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-50"
            >
              ✕
            </button>
            <SignIn
              isOpen={true}
              onClose={() => {
                setShowSignIn(false);
                if (auth.isAuthenticated) {
                  navigate("/checkout");
                }
              }}
              initialMode="login"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Hide scrollbar + animations
const styles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.7;} }
  .animate-pulse { animation: pulse 2s infinite; }
`;

if (!document.querySelector("#cart-styles")) {
  const styleElement = document.createElement("style");
  styleElement.id = "cart-styles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default Cart;
