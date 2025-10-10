import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from './WishlistContext';
import { gsap } from 'gsap';

const Wishlist = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { 
    wishlistItems, 
    removeFromWishlist, 
    moveItemToCart,
    loading,
    error 
  } = useWishlist();

  const auth = useSelector(state => state.auth);

  useEffect(() => {
    // Animation on mount
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please sign in to view your wishlist</h2>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p>Error loading wishlist: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlistItems.length} items)</h1>
      
      <div className="grid gap-6">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          wishlistItems.map(item => {
            // Ensure we have a unique key for each item
            const itemId = item._id || item.id;
            if (!itemId) {
              console.warn('Item missing ID:', item);
              return null;
            }
            
            return (
              <WishlistItem
                key={itemId}
                item={item}
                removeFromWishlist={removeFromWishlist}
                moveToCart={moveItemToCart}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Wishlist;