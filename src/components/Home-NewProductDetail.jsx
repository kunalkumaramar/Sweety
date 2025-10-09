// HomeProductDetailSection.jsx - Fully Mobile Responsive
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getAllProducts } from '../Redux/slices/productsSlice';
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HomeProductDetailSection = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { addToCart: addToCartHandler } = useCart();
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();

  const { products, loading, error } = useSelector(state => state.products);

  const [latestProduct, setLatestProduct] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const selectedColor = latestProduct?.colors?.[selectedColorIndex];
  const isInWishlist = latestProduct ? isItemInWishlist(latestProduct._id) : false;

  useEffect(() => {
    dispatch(getAllProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const latest = products[0];
      setLatestProduct(latest);

      if (latest.colors?.length > 0) {
        setSelectedColorIndex(0);
        const firstColor = latest.colors[0];
        const availableSize = firstColor.sizeStock?.find(size => size.stock > 0);
        setSelectedSize(availableSize?.size || "");
        setCurrentImageIndex(0);
      }
    }
  }, [products]);

  const handleBuyNow = async () => {
    if (!latestProduct || !selectedColor || !selectedSize) return;
    setAddingToCart(true);
    try {
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || '';
      const result = await addToCartHandler(
        latestProduct,
        quantity,
        selectedColor.colorName,
        selectedSize,
        selectedImage
      );
      if (result.success) navigate('/checkout');
    } catch (error) {
      console.error('Buy Now failed:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    if (!latestProduct || !selectedColor || !selectedSize) return;
    setAddingToCart(true);
    try {
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || '';
      const result = await addToCartHandler(
        latestProduct,
        quantity,
        selectedColor.colorName,
        selectedSize,
        selectedImage
      );
      if (result.success) console.log('Added to cart');
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!latestProduct) return;
    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(latestProduct._id);
      } else {
        const productForWishlist = {
          _id: latestProduct._id,
          id: latestProduct._id,
          name: latestProduct.name,
          brand: latestProduct.name,
          price: latestProduct.price,
          originalPrice: latestProduct.originalPrice,
          image: selectedColor?.images?.[0] || latestProduct.images?.[0] || '',
          images: latestProduct.images || [],
          description: latestProduct.description
        };
        await addToWishlist(productForWishlist);
      }
    } catch (error) {
      console.error('Wishlist update failed:', error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleColorChange = (colorIndex) => {
    setSelectedColorIndex(colorIndex);
    setCurrentImageIndex(0);
    const newColor = latestProduct.colors[colorIndex];
    if (newColor.sizeStock) {
      const availableSize = newColor.sizeStock.find(size => size.stock > 0);
      setSelectedSize(availableSize?.size || "");
    }
  };

  const handleViewFullDetails = () => {
    if (latestProduct) navigate(`/product/${latestProduct._id}`);
  };

  const ColorCircle = ({ color, size = 'w-4 h-4', isSelected = false }) => {
    const colorValue = color.colorHex || '#CCCCCC';
    return (
      <div
        className={`${size} rounded-full border-2 flex-shrink-0 ${
          isSelected ? 'border-gray-800' : 'border-gray-300'
        }`}
        style={{ backgroundColor: colorValue }}
        title={color.colorName}
      />
    );
  };

  if (loading) {
    return <p className="text-center py-8 sm:py-12 text-sm sm:text-base">Loading...</p>;
  }
  if (error) {
    return <p className="text-center text-red-600 py-8 sm:py-12 text-sm sm:text-base px-4">Error: {error}</p>;
  }
  if (!latestProduct) {
    return <p className="text-center text-gray-600 py-8 sm:py-12 text-sm sm:text-base">No products available</p>;
  }

  const discount = latestProduct.originalPrice
    ? Math.round(
        ((latestProduct.originalPrice - latestProduct.price) /
          latestProduct.originalPrice) *
          100
      )
    : 0;

  const currentImages = selectedColor?.images || [];
  const currentImage = currentImages[currentImageIndex] || currentImages[0];

  return (
    <section ref={sectionRef} className="py-6 sm:py-8 md:py-12 bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">

        {/* Left: Images */}
        <div ref={imageRef} className="order-1 lg:order-1">
          {/* Desktop Layout */}
          <div className="hidden lg:flex gap-4">
            <div className="flex-1 flex flex-col items-center">
              <img
                src={currentImage}
                alt={`${latestProduct.name} - ${selectedColor?.colorName}`}
                className="w-full h-[600px] object-cover rounded-lg"
              />

              <div className="flex justify-center items-center gap-6 mt-3">
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + currentImages.length) % currentImages.length
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-pink-600 hover:text-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-pink-600 hover:text-white transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex flex-col gap-2 w-28">
              {currentImages.slice(0, 4).map((img, idx) => {
                if (idx === 3 && currentImages.length > 4) {
                  const extraCount = currentImages.length - 3;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(3)}
                      className="relative border-2 border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-full h-[142px] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center text-white font-bold text-lg">
                        +{extraCount}
                      </div>
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`border-2 ${
                      currentImageIndex === idx ? "border-gray-800" : "border-gray-200"
                    } rounded-lg overflow-hidden`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-[142px] object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Layout - Enhanced Responsiveness */}
          <div className="lg:hidden">
            <div className="relative w-full mb-3 sm:mb-4">
              <img
                src={currentImage}
                alt={`${latestProduct.name} - ${selectedColor?.colorName}`}
                className="w-full h-[280px] xs:h-[320px] sm:h-[380px] md:h-[480px] object-cover rounded-lg"
              />
              
              {/* Mobile Navigation Arrows Overlay */}
              {currentImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) => (prev - 1 + currentImages.length) % currentImages.length
                      )
                    }
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-pink-600 hover:text-white transition shadow-md pointer-events-auto"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
                    }
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-pink-600 hover:text-white transition shadow-md pointer-events-auto"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}


            </div>

            {/* Thumbnail Strip - Centered with +N for extra images */}
            <div className="flex gap-1.5 sm:gap-2 justify-center px-1 pb-2">
              {currentImages.slice(0, 4).map((img, idx) => {
                if (idx === 3 && currentImages.length > 4) {
                  const extraCount = currentImages.length - 3;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(3)}
                      className="relative border-2 border-gray-200 rounded-md overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-14 h-16 xs:w-16 xs:h-20 sm:w-18 sm:h-22 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                        +{extraCount}
                      </div>
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`border-2 ${
                      currentImageIndex === idx ? "border-pink-600" : "border-gray-200"
                    } rounded-md overflow-hidden flex-shrink-0 transition-all`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-14 h-16 xs:w-16 xs:h-20 sm:w-18 sm:h-22 object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Details - Enhanced Mobile Responsiveness */}
        <div ref={detailsRef} className="order-2 lg:order-2 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          <div>
            <span className="bg-pink-600 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase inline-block">NEW</span>
          </div>
          
          <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
            {latestProduct.name}
          </h2>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-pink-600 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {latestProduct.ratings && latestProduct.ratings.length > 0 && (
                <>
                  <span className="ml-2 text-sm text-gray-600">
                    ({latestProduct.ratings.length} review
                    {latestProduct.ratings.length !== 1 ? "s" : ""})
                  </span>
                  <span className="text-sm text-gray-500">
                    {(
                      latestProduct.ratings.reduce(
                        (acc, rating) => acc + (rating.rating || rating),
                        0
                      ) / latestProduct.ratings.length
                    ).toFixed(1)}{" "}
                    out of 5
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <p className="text-lg xs:text-xl sm:text-xl md:text-2xl font-bold text-gray-900">
              ₹{latestProduct.price}
            </p>
            {latestProduct.originalPrice && (
              <p className="text-base xs:text-lg sm:text-lg md:text-xl text-gray-500 line-through">
                ₹{latestProduct.originalPrice}
              </p>
            )}
            {discount > 0 && (
              <span className="bg-pink-500 text-white text-xs sm:text-sm px-2.5 py-1 sm:px-3 rounded-full font-medium">
                {discount}% OFF
              </span>
            )}
          </div>

          {latestProduct.description && (
            <p className="text-gray-600 text-xs xs:text-sm sm:text-sm md:text-base leading-relaxed">
              {latestProduct.description}
            </p>
          )}

          {/* Colors - Mobile Optimized */}
          {latestProduct.colors?.length > 0 && (
            <div>
              <p className="font-bold mb-2 text-xs xs:text-sm sm:text-sm md:text-base">
                Color: <span className="font-normal">{selectedColor?.colorName}</span>
              </p>
              <div className="flex gap-2 sm:gap-2.5 md:gap-3 flex-wrap">
                {latestProduct.colors.map((color, idx) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorChange(idx)}
                    className={`w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center p-1 transition-all ${
                      selectedColorIndex === idx 
                        ? "border-black shadow-md" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <ColorCircle 
                      color={color} 
                      size="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes - Mobile Optimized */}
          {selectedColor?.sizeStock?.length > 0 && (
            <div>
              <p className="font-bold mb-2 text-xs xs:text-sm sm:text-sm md:text-base">
                Size: <span className="font-normal">{selectedSize}</span>
              </p>
              <div className="flex gap-2 sm:gap-2.5 md:gap-3 flex-wrap">
                {selectedColor.sizeStock.map((sizeObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(sizeObj.size)}
                    disabled={sizeObj.stock === 0}
                    className={`px-3 py-2 xs:px-3.5 xs:py-2 sm:px-4 sm:py-2.5 border-2 font-medium text-xs xs:text-sm sm:text-sm md:text-base rounded-md transition-all min-w-[3rem] ${
                      selectedSize === sizeObj.size
                        ? "bg-pink-500 text-white border-pink-500"
                        : sizeObj.stock === 0
                        ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-white text-black border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {sizeObj.size.toUpperCase()}
                    {sizeObj.stock === 0 && (
                      <span className="block text-[10px] xs:text-xs mt-0.5">Out of Stock</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Cart - Mobile Optimized */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 items-stretch xs:items-center pt-2">
            <div className="flex items-center border-2 rounded w-fit bg-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <div className="flex gap-2 flex-1">
              <button
                className="flex-1 bg-black text-white py-2.5 xs:py-3 px-4 sm:px-5 md:px-6 hover:bg-gray-800 active:bg-gray-900 rounded-lg text-xs xs:text-sm sm:text-sm md:text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all touch-manipulation"
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor || addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add To Cart'}
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={addingToWishlist}
                className={`p-2.5 xs:p-3 border-2 rounded-lg transition-all touch-manipulation ${
                  isInWishlist 
                    ? "bg-pink-100 border-pink-400 text-pink-600" 
                    : "bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                } ${addingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg 
                  className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5" 
                  fill={isInWishlist ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={handleBuyNow}
            className="w-full bg-pink-600 text-white py-2.5 xs:py-3 sm:py-3.5 rounded-lg hover:bg-pink-700 active:bg-pink-800 text-xs xs:text-sm sm:text-sm md:text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all touch-manipulation shadow-sm"
            disabled={!selectedSize || !selectedColor || addingToCart}
          >
            {addingToCart ? 'Processing...' : 'Buy It Now'}
          </button>

          <button
            onClick={handleViewFullDetails}
            className="w-full bg-gray-100 text-gray-800 py-2.5 xs:py-3 sm:py-3.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 text-xs xs:text-sm sm:text-sm md:text-base font-medium border-2 border-gray-300 transition-all touch-manipulation"
          >
            View Full Details
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (min-width: 475px) {
          .xs:text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .xs:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .xs:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .xs:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .xs:w-11 { width: 2.75rem; }
          .xs:h-11 { height: 2.75rem; }
          .xs:w-7 { width: 1.75rem; }
          .xs:h-7 { height: 1.75rem; }
          .xs:h-320px { height: 320px; }
          .xs:w-16 { width: 4rem; }
          .xs:h-20 { height: 5rem; }
          .xs:px-3.5 { padding-left: 0.875rem; padding-right: 0.875rem; }
          .xs:py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .xs:w-5 { width: 1.25rem; }
          .xs:h-5 { height: 1.25rem; }
          .xs:flex-row { flex-direction: row; }
          .xs:mx-0 { margin-left: 0; margin-right: 0; }
        }
      `}</style>
    </section>
  );
};

export default HomeProductDetailSection;