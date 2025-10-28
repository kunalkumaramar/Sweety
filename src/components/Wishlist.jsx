//src/components/wishlist.jsx
import { useWishlist } from "./WishlistContext";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import SignIn from "../pages/SignIn";
import { gsap } from "gsap";

// ⭐ Reusable Wishlist Item Component
const WishlistItem = ({
  item,
  removeFromWishlist,
  moveToCart,
}) => {
  const itemRef = useRef(null);
  const navigate = useNavigate();

  // Ensure we have a unique ID for the item
  // const itemId = item._id || item.id;

  useEffect(() => {
    // GSAP hover animations
    const element = itemRef.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const goToDetail = () => {
    navigate(`/product/${item._id || item.id}`);
  };



  const handleRemove = () => {
    // Animate removal
    gsap.to(itemRef.current, {
      x: -100,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => removeFromWishlist(item.id || item._id),
    });
  };

  const handleMoveToCart = async () => {
    try {  
      // Extract the product data
      const productData = item.product || item;  
      // Get the actual product ID - the one that matches with products in the system
      const productId = item.id || productData.id || productData._id;
      
      if (!productId) {
        console.error('No product ID found. Item structure:', item);
        return;
      }

      console.log('handleMoveToCart - Item details:', {
        productId,
        selectedSize: item.selectedSize,
        selectedColorName: item.selectedColorName,
        selectedImage: item.selectedImage
      });

      // FIX #1: ALWAYS use stored size/color from the wishlist item
      const finalSize = item.selectedSize || '30';
      const finalColorName = item.selectedColorName || 'Assorted colors';
      const finalColorHex = item.selectedColorHex || '#808080';
      const finalImage = item.selectedImage || productData.image;

      console.log('Calling moveToCart with:', {
        productId,
        size: finalSize,
        colorName: finalColorName,
        colorHex: finalColorHex,
        image: finalImage
      });

      // Call moveToCart with size/color from stored wishlist item
      const result = await moveToCart(
        productId,
        1,
        finalSize,
        {
          colorName: finalColorName,
          colorHex: finalColorHex
        },
        finalImage
      );

      if (result && result.success) {
        // FIX #2: Immediately animate and remove from UI
        gsap.to(itemRef.current, {
          x: 100,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    } catch (error) {
      console.error('Failed to move item to cart:', error);
    }
  };

  // Get price - use priceWhenAdded if available, fallback to current price
  const displayPrice = item.priceWhenAdded || item.price;
  const originalPrice = item.originalPrice;

  // Generate a unique key for the wishlist item
  const itemKey =
    item.id || item._id || Math.random().toString(36).substr(2, 9);

  return (
    <div
      key={itemKey}
      ref={itemRef}
      className="flex gap-4 py-4 px-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-4 transition-all duration-300"
    >
      <img
        src={item.images?.[0] || item.image}
        alt={item.description || item.name}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0 cursor-pointer"
        onClick={goToDetail}
        loading="lazy"
      />

      {/* Mobile Layout - Single Column */}
      <div className="flex-1 lg:hidden">
        <div
          className="text-base sm:text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-pink-600 transition-colors"
          onClick={goToDetail}
        >
          {item.brand || item.name}
        </div>
        
        {/* Selected Size Display */}
        {item.selectedSize && (
          <div className="text-xs text-gray-600 mb-2">
            Size: {item.selectedSize}
          </div>
        )}
        
        {/* Price Section for Mobile */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-lg font-semibold text-gray-800">
            ₹{displayPrice ? displayPrice.toLocaleString() : "N/A"}
          </div>
          {originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              ₹{originalPrice.toLocaleString()}
            </div>
          )}
          {(item.discount || originalPrice) && displayPrice && (
            <div className="text-sm text-pink-600 font-semibold">
              (
              {item.discount ||
                Math.round(
                  ((originalPrice - displayPrice) / originalPrice) * 100
                )}
              % off)
            </div>
          )}
        </div>

        {/* Added date info */}
        {item.addedAt && (
          <div className="text-xs text-gray-400 mb-2">
            Added on {new Date(item.addedAt).toLocaleDateString()}
          </div>
        )}

        {/* Status for Mobile */}
        {(item.discount || originalPrice) && (
          <div className="bg-pink-600 text-white text-xs px-2 py-1 rounded mb-3 inline-block">
            Limited time deal
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            className="border border-pink-600 text-pink-600 py-2 px-4 rounded-2xl text-sm font-medium hover:bg-pink-50 transition-colors"
            onClick={handleRemove}
          >
            Remove
          </button>
          {moveToCart && (
            <button
              className="bg-pink-500 text-white py-2 px-4 rounded-2xl text-sm font-medium hover:bg-pink-700 transition-colors"
              onClick={handleMoveToCart}
            >
              Move to Cart
            </button>
          )}
          <button
            className="text-pink-600 hover:underline text-sm"
            onClick={goToDetail}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Desktop Layout - Two Columns */}
      <div className="hidden lg:flex flex-1 gap-4">
        {/* Left Column - Product Info */}
        <div className="flex-1 pr-5">
          <div
            className="text-base sm:text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-pink-600 transition-colors"
            onClick={goToDetail}
          >
            {item.brand || item.name}
          </div>
          
          {/* Selected Size Display */}
          {item.selectedSize && (
            <div className="text-xs text-gray-600 mb-2">
              Size: {item.selectedSize}
            </div>
          )}
          
          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-lg font-semibold text-gray-800">
              ₹{displayPrice ? displayPrice.toLocaleString() : "N/A"}
            </div>
            {originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toLocaleString()}
              </div>
            )}
            {(item.discount || originalPrice) && displayPrice && (
              <div className="text-sm text-pink-600 font-semibold">
                (
                {item.discount ||
                  Math.round(
                    ((originalPrice - displayPrice) / originalPrice) * 100
                  )}
                % off)
              </div>
            )}
          </div>

          {/* Added date info */}
          {item.addedAt && (
            <div className="text-xs text-gray-400 mb-3">
              Added on {new Date(item.addedAt).toLocaleDateString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              className="border border-pink-600 text-pink-600 py-2 px-4 rounded-2xl text-sm font-medium hover:bg-pink-50 transition-colors"
              onClick={handleRemove}
            >
              Remove
            </button>
            {moveToCart && (
              <button
                className="bg-pink-500 text-white py-2 px-4 rounded-2xl text-sm font-medium hover:bg-pink-700 transition-colors"
                onClick={handleMoveToCart}
              >
                Move to Cart
              </button>
            )}
            <button
              className="text-pink-600 hover:underline text-sm"
              onClick={goToDetail}
            >
              View Details
            </button>
          </div>
        </div>

        {/* Right Column - Availability Status */}
        <div className="text-right min-w-24 flex-shrink-0">
          {(item.discount || originalPrice) && (
            <div className="bg-pink-600 text-white text-xs px-2 py-1 rounded mt-2 inline-block">
              Limited time deal
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ⭐ Reusable Recommendation Item Component
const RecommendationItem = ({ item, addToWishlist }) => {
  const itemRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const element = itemRef.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        y: -5,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        y: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const goToDetail = () => {
    navigate(`/product/${item._id || item.id}`);
  };

  return (
    <div
      ref={itemRef}
      className="flex gap-3 py-3 border-b border-gray-200 last:border-b-0 transition-all duration-300"
    >
      <img
        src={item.colors?.[0]?.images?.[0] || item.images?.[0] || item.image || '/placeholder.png'}
        alt={item.description || item.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0 cursor-pointer"
        onClick={goToDetail}
        loading="lazy"
      />
      <div className="flex-1">
        <div
          onClick={goToDetail}
          className="text-sm sm:text-base font-semibold text-gray-800 mb-1 cursor-pointer hover:text-pink-600 transition-colors"
        >
          {item.brand || item.name}
        </div>
        <div className="flex items-center gap-2 mb-2">
          {(item.discount || item.originalPrice) && (
            <span className="text-pink-600 text-xs font-semibold">
              -
              {item.discount ||
                Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
                )}
              %
            </span>
          )}
          <span className="text-sm font-semibold text-gray-800">
            ₹{item.price.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="border border-pink-600 text-pink-600 py-1 px-3 rounded-2xl text-xs font-medium hover:bg-pink-50 transition-colors"
            onClick={() => addToWishlist(item)}
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const {
    wishlistItems,
    removeFromWishlist,
    addToWishlist,
    moveToCart,
    moveAllToCart,
    clearWishlist,
    loading,
    count,
    isAuthenticated,
  } = useWishlist();

  const { addItemToCart } = useCart();
  const containerRef = useRef(null);
  const [showSignIn, setShowSignIn] = useState(false);

  // Recommendations based on wishlist or popular products
  const [recommendations, setRecommendations] = useState([]);
  const [rawRecommendations, setRawRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        
        // Fetch categories
        const categoriesRes = await fetch(`${API_BASE_URL}/category`);
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.data || [];

        const products = [];

        for (const category of categories) {
          // Fetch subcategories
          const subcategoriesRes = await fetch(`${API_BASE_URL}/sub-category/category/${category._id}`);
          const subcategoriesData = await subcategoriesRes.json();
          const subcategories = subcategoriesData.data || [];

          if (subcategories.length > 0) {
            // If subcategories exist, fetch one product from each
            for (const subcategory of subcategories) {
              const productsRes = await fetch(
                `${API_BASE_URL}/product/subcategory/${subcategory._id}?page=1&limit=2&isActive=true`
              );
              const productsData = await productsRes.json();
              const latestProducts = productsData.data?.products || [];
              
              latestProducts.forEach(latestProduct => {
                if (latestProduct) {
                  products.push({
                    ...latestProduct,
                    categoryName: category.name,
                    subcategoryName: subcategory.name
                  });
                }
              });
            }
          } else {
            // If no subcategories, fetch directly from category
            const productsRes = await fetch(
              `${API_BASE_URL}/product/category/${category._id}?page=1&limit=2&isActive=true`
            );
            const productsData = await productsRes.json();
            const latestProducts = productsData.data?.products || [];

            latestProducts.forEach((latestProduct) => {
              if (latestProduct) {
                products.push({
                  ...latestProduct,
                  categoryName: category.name,
                  subcategoryName: null
                });
              }
            });
          }
        }

        setRawRecommendations(products);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setRawRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    const cacheKey = 'wishlist_raw_recs';
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    const now = Date.now();
    const cacheExpiry = 3600000; // 1 hour

    if (cached && cacheTime && (now - parseInt(cacheTime)) < cacheExpiry) {
      setRawRecommendations(JSON.parse(cached));
      setLoadingRecommendations(false);
    } else {
      fetchRecommendations();
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (rawRecommendations.length === 0) {
      setRecommendations([]);
      return;
    }

    const cacheKey = 'wishlist_raw_recs';
    const filteredProducts = rawRecommendations
      .filter(product => !wishlistItems.find(item => (item.id || item._id) === product._id))
      .slice(0, 6);

    setRecommendations(filteredProducts);

    // Cache the raw data
    localStorage.setItem(cacheKey, JSON.stringify(rawRecommendations));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  }, [rawRecommendations, wishlistItems]);

  const renderStars = (rating) => "★".repeat(rating);
  const getTotalItems = () => count || wishlistItems.length;

  useEffect(() => {
    // Initial animation for the entire container
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  // Handle add all to cart
  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    await moveAllToCart();
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    if (
      wishlistItems.length > 0 &&
      confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      await clearWishlist();
    }
  };

  // Show loading state for initial load
  if (loading && wishlistItems.length === 0 && isAuthenticated) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-gray-300 mb-4 animate-pulse">♡</div>
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      { !isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">♡</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Please login to view your wishlist
            </h3>
            <p className="text-gray-500 mb-6">
              Create an account or sign in to save your favorite items
            </p>
            <button
              className="bg-pink-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-pink-700 transition-colors"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div
              ref={containerRef}
              className="p-3 pb-24"
            >
              {/* Quick Actions - Mobile First */}
              <div className="bg-white rounded-xl p-4 shadow-lg mb-4">
                <div className="text-base font-semibold text-gray-800 mb-4">
                  Quick Actions
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full bg-pink-600 text-white py-3 rounded-3xl text-sm font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddAllToCart}
                    disabled={wishlistItems.length === 0}
                  >
                    Move All to Cart
                  </button>
                  <button
                    className="w-full border border-pink-600 text-pink-600 py-3 rounded-3xl text-sm font-semibold hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleClearWishlist}
                    disabled={wishlistItems.length === 0}
                  >
                    Clear Wishlist
                  </button>
                </div>
              </div>

              {/* Wishlist Items */}
              <div className="bg-white rounded-xl shadow-lg mb-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600">♡</span>
                    My Wishlist
                    <span className="text-gray-500 text-sm font-medium">
                      ({getTotalItems()} items)
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                      <div className="text-4xl text-gray-300 mb-4">♡</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Your wishlist is empty
                      </h3>
                      <p className="text-gray-500 mb-6 text-sm">
                        Save items you love by clicking the heart icon
                      </p>
                      <button
                        className="bg-pink-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-pink-700 transition-colors text-sm"
                        onClick={() => (window.location.href = "/")}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    wishlistItems.map((item) => (
                      <WishlistItem
                        key={item._id || item.id}
                        item={item}
                        removeFromWishlist={removeFromWishlist}
                        addToCart={addItemToCart}
                        moveToCart={moveToCart}
                        renderStars={renderStars}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-lg">
                <div className="text-lg font-semibold text-gray-800 p-4 text-center border-b border-gray-200">
                  You Might Also Like
                </div>
                <div className="px-4 pb-4">
                  {loadingRecommendations ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                  ) : recommendations.length > 0 ? (
                    recommendations.map((item) => (
                      <RecommendationItem
                        key={item._id || item.id}
                        item={item}
                        addToCart={addItemToCart}
                        addToWishlist={addToWishlist}
                        renderStars={renderStars}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      No recommendations available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block p-5">
            <div
              ref={containerRef}
              className="max-w-7xl mx-auto flex flex-row gap-5 h-[calc(100vh-40px)]"
            >
              {/* Left - Wishlist */}
              <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col">
                <div className="flex justify-between items-center text-xl font-semibold text-gray-800 p-5 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600">♡</span>
                    My Wishlist
                    <span className="text-gray-500 text-base font-medium">
                      ({getTotalItems()} items)
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-2 hide-scrollbar">
                  {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <div className="text-6xl text-gray-300 mb-4">♡</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Your wishlist is empty
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Save items you love by clicking the heart icon
                      </p>
                      <button
                        className="bg-pink-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-pink-700 transition-colors"
                        onClick={() => (window.location.href = "/")}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    wishlistItems.map((item) => (
                      <WishlistItem
                        key={item._id || item.id}
                        item={item}
                        removeFromWishlist={removeFromWishlist}
                        addToCart={addItemToCart}
                        moveToCart={moveToCart}
                        renderStars={renderStars}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right - Actions + Recommendations */}
              <div className="w-2/5 flex flex-col gap-5">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-5 shadow-lg">
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full bg-pink-600 text-white py-3 rounded-3xl text-sm font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleAddAllToCart}
                      disabled={wishlistItems.length === 0}
                    >
                      Move All to Cart
                    </button>
                    <button
                      className="w-full border border-pink-600 text-pink-600 py-3 rounded-3xl text-sm font-semibold hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleClearWishlist}
                      disabled={wishlistItems.length === 0}
                    >
                      Clear Wishlist
                    </button>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-lg flex flex-col flex-1 min-h-0">
                  <div className="text-lg font-semibold text-gray-800 p-5 pb-3 text-center border-b border-gray-200">
                    You Might Also Like
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 pb-5 hide-scrollbar">
                    {loadingRecommendations ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                      </div>
                    ) : recommendations.length > 0 ? (
                      recommendations.map((item) => (
                        <RecommendationItem
                          key={item._id || item.id}
                          item={item}
                          addToCart={addItemToCart}
                          addToWishlist={addToWishlist}
                          renderStars={renderStars}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No recommendations available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SignIn Modal */}
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
              onClose={() => setShowSignIn(false)}
              initialMode="login"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Hide scrollbar utility
const styles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

if (!document.querySelector("#wishlist-styles")) {
  const styleElement = document.createElement("style");
  styleElement.id = "wishlist-styles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default Wishlist;