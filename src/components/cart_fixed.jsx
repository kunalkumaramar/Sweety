import { useSelector } from 'react-redux';
import { useCart } from "../hooks/useCart";
import { useWishlist } from "./WishlistContext";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SignIn from "../pages/SignIn";

// Cart Item Component
const CartItem = ({ item, updateQuantity, deleteItem, addToWishlist }) => {
  const itemRef = useRef(null);
  const navigate = useNavigate();

  const handleQuantityChange = (change) => {
    const newQty = Math.max(1, item.quantity + change);
    if (item.quantity === 1 && change < 0) {
      deleteItem(item._id);
    } else {
      updateQuantity(item._id, newQty);
    }
  };

  return (
    <div ref={itemRef} className="flex gap-4 border-b p-4">
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">₹{item.price}</p>
        <div className="flex items-center mt-2 gap-2">
          <button 
            onClick={() => handleQuantityChange(-1)}
            className="px-2 py-1 border rounded"
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(1)}
            className="px-2 py-1 border rounded"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Cart Component
const Cart = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const auth = useSelector((state) => state.auth);

  const { 
    items: cartItems, 
    totals,
    totalItems,
    updateItemQuantity,
    deleteItem,
    addItemToCart,
    loading
  } = useCart();

  const { addToWishlist } = useWishlist();

  const handleProceedToBuy = async () => {
    if (!cartItems.length) return;
    
    const token = localStorage.getItem('token');
    if (!token || !auth.isAuthenticated) {
      setShowSignIn(true);
    } else {
      navigate('/checkout');
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({totalItems} items)</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Your cart is empty</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <CartItem
                key={item._id}
                item={item}
                updateQuantity={updateItemQuantity}
                deleteItem={deleteItem}
                addToWishlist={addToWishlist}
              />
            ))
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{getSubtotal()}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToBuy}
            disabled={cartItems.length === 0 || loading}
            className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      <SignIn
        isOpen={showSignIn}
        onClose={() => {
          setShowSignIn(false);
          const token = localStorage.getItem('token');
          if (token && auth.isAuthenticated) {
            navigate('/checkout');
          }
        }}
        initialMode="login"
      />
    </div>
  );
};

export default Cart;