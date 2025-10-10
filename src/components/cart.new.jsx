import { useSelector } from 'react-redux';
import { useCart } from "../hooks/useCart";
import { useWishlist } from "./WishlistContext";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SignIn from "../pages/SignIn";

const Cart = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const auth = useSelector((state) => state.auth);

  const { 
    items: cartItems, 
    totals,
    totalItems,
    totalPrice,
    updateItemQuantity,
    deleteItem,
    addItemToCart,
    applyDiscount,
    removeDiscount,
    hasDiscount,
    appliedDiscount,
    applyingDiscount,
    removingDiscount,
    clearCartItems,
    loading,
    isAuthenticated
  } = useCart();

  const handleProceedToBuy = () => {
    const token = localStorage.getItem('token');
    if (!token || !auth.isAuthenticated) {
      setShowSignIn(true);
      return;
    }
    navigate('/checkout');
  };

  return (
    <React.Fragment>
      <div className="bg-gray-100 min-h-screen">
        {/* Your existing cart content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-grow">
              <h1 className="text-2xl font-bold mb-4">Shopping Cart ({totalItems} items)</h1>
              {/* Your cart items list */}
            </div>
            
            {/* Cart Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                {/* Order summary content */}
                <button
                  onClick={handleProceedToBuy}
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Proceed to Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-md w-full mx-4 relative">
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
                  navigate('/checkout');
                }
              }}
              initialMode="login"
            />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Cart;