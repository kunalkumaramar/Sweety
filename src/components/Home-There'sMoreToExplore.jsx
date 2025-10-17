import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories } from "../Redux/slices/categorySlice";

const IntimatesCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector((state) => state.categories);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [loadedImages, setLoadedImages] = useState({});
  const containerRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) setItemsPerPage(2);      // Mobile: 2 cards
      else if (width < 1024) setItemsPerPage(3); // Medium: 3 cards  
      else setItemsPerPage(4);                   // Large: 4 cards
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Load GSAP
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const nextSlide = () => {
    if (currentIndex < categories.length - itemsPerPage) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCategoryClick = (category) => {
    // Create URL-friendly slug from category name (matching Navbar pattern)
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate first, then scroll will happen automatically on the new page
    navigate(`/products/${categorySlug}`);
  };

  const progressWidth = categories.length > 0 
    ? `${((currentIndex + itemsPerPage) / categories.length) * 100}%` 
    : '0%';

  // Check if navigation buttons should be shown
  const showNavigation = categories.length > itemsPerPage;
  const showPrevButton = showNavigation && currentIndex > 0;
  const showNextButton = showNavigation && currentIndex < categories.length - itemsPerPage;

  // Calculate card width percentage for sliding effect
  const cardWidthPercentage = 100 / itemsPerPage;

  // Loading state
  if (loading) {
    return (
      <div className="w-full py-8 sm:py-12 bg-white px-4 lg:px-2">
        <h2 className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-gray-800 tracking-wide"
          style={{ fontFamily: "Montaga, serif", fontWeight: 400, fontStyle: "normal" }}>
          There's More to explore
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full py-8 sm:py-12 bg-white px-4 lg:px-2">
        <h2 className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-gray-800 tracking-wide"
          style={{ fontFamily: "Montaga, serif", fontWeight: 400, fontStyle: "normal" }}>
          There's More to explore
        </h2>
        <div className="text-center text-red-500 py-8">
          <p>Failed to load categories. Please try again later.</p>
        </div>
      </div>
    );
  }

  // No categories
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full py-8 sm:py-12 bg-white px-4 lg:px-2">
        <h2 className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-gray-800 tracking-wide"
          style={{ fontFamily: "Montaga, serif", fontWeight: 400, fontStyle: "normal" }}>
          There's More to explore
        </h2>
        <div className="text-center text-gray-500 py-8">
          <p>No categories available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12 bg-white px-4 lg:px-2">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-gray-800 tracking-wide"
        style={{ fontFamily: "Montaga, serif", fontWeight: 400, fontStyle: "normal" }}>
        There's More to explore
      </h2>

      {/* Carousel Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Buttons - Hidden when not needed */}
        {showPrevButton && (
          <button
            onClick={prevSlide}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 bg-pink-400 hover:bg-pink-500 rounded-sm shadow-lg transition-all duration-200 flex items-center justify-center hover:shadow-xl hover:scale-105"
            aria-label="Previous categories"
          >
            <ChevronLeft className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {showNextButton && (
          <button
            onClick={nextSlide}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 bg-pink-400 hover:bg-pink-500 rounded-sm shadow-lg transition-all duration-200 flex items-center justify-center hover:shadow-xl hover:scale-105"
            aria-label="Next categories"
          >
            <ChevronRight className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Cards Container */}
        <div className="overflow-hidden mx-2 sm:mx-14">
          <div 
            ref={containerRef}
            className="flex transition-transform duration-200 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * cardWidthPercentage}%)`,
            }}
          >
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className="flex-shrink-0 mx-1.5 sm:mx-2 lg:mx-3 cursor-pointer group"
                style={{ 
                  width: `calc(${cardWidthPercentage}% - ${itemsPerPage === 2 ? '12px' : '24px'})`,
                }}
              >
                <div className="card-item overflow-hidden hover:shadow-xl transition-all duration-300 border-[4px] border-[#E8B0BD]">
                  {/* Image Container with Text Overlay */}
                  <div className="relative overflow-hidden">
                    {!loadedImages[category._id] && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <img
                      src={category.image || 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&crop=center'}
                      alt={category.name}
                      className={`w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover transition-all duration-500 group-hover:scale-105 ${loadedImages[category._id] ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => ({...prev, [category._id]: true}))}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&crop=center';
                      }}
                    />
                    
                    {/* Category Text Overlay */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-light tracking-wide drop-shadow-lg"
                        style={{
                          fontFamily: "Montaga, serif",
                          fontWeight: 400,
                        }}>
                        {category.name}
                      </h3>
                    </div>
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {showNavigation && (
        <div className="mt-8 sm:mt-12 w-full max-w-4xl mx-auto px-4">
          <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntimatesCarousel;