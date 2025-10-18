// sweetyintimate/src/components/Home-BrandSection.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { getAllSubcategories } from '../Redux/slices/subcategorySlice';
import { getCategories } from '../Redux/slices/categorySlice';

const LingerieHeroSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categoryStripRef = useRef(null);
  const leftSectionRef = useRef(null);
  const rightSectionRef = useRef(null);
  const readMoreBtnRef = useRef(null);
  const shopNowBtnRef = useRef(null);

  // Redux state
  const { subcategories, loading: subcategoriesLoading } = useSelector(state => state.subcategories);
  const { categories } = useSelector(state => state.categories);

  const [leftImageLoaded, setLeftImageLoaded] = useState(false);
  const [rightImageLoaded, setRightImageLoaded] = useState(false);

  // Fetch subcategories and categories on mount
  useEffect(() => {
    if (subcategories.length === 0) {
      dispatch(getAllSubcategories());
    }
    if (categories.length === 0) {
      dispatch(getCategories());
    }
  }, [dispatch, subcategories.length, categories.length]);

  // Helper function to get category by subcategory
  const getCategoryForSubcategory = (subcategory) => {
    return categories.find(cat => 
      cat._id === subcategory.category || cat._id === subcategory.category?._id
    );
  };

  // Helper function to navigate to subcategory
  const handleSubcategoryClick = (subcategory) => {
    const category = getCategoryForSubcategory(subcategory);
    
    if (category) {
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
      const subcategorySlug = subcategory.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/products/${categorySlug}/${subcategorySlug}`);
    }
  };

  // Handle Shop Now button click - navigate to all products
  const handleShopNow = () => {
    navigate('/products/all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Category strip scroll animation
    const categoryStrip = categoryStripRef.current;
    if (categoryStrip && subcategories.length > 0) {
      gsap.to(categoryStrip, {
        x: -200,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }

    // Hover animations for buttons
    const readMoreBtn = readMoreBtnRef.current;
    const shopNowBtn = shopNowBtnRef.current;

    if (readMoreBtn) {
      readMoreBtn.addEventListener('mouseenter', () => {
        gsap.to(readMoreBtn, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      readMoreBtn.addEventListener('mouseleave', () => {
        gsap.to(readMoreBtn, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    }

    if (shopNowBtn) {
      shopNowBtn.addEventListener('mouseenter', () => {
        gsap.to(shopNowBtn, {
          scale: 1.05,
          boxShadow: "0 10px 25px rgba(237, 29, 121, 0.3)",
          duration: 0.3,
          ease: "power2.out"
        });
      });

      shopNowBtn.addEventListener('mouseleave', () => {
        gsap.to(shopNowBtn, {
          scale: 1,
          boxShadow: "0 0px 0px rgba(237, 29, 121, 0)",
          duration: 0.3,
          ease: "power2.out"
        });
      });
    }

    // Entry animations
    gsap.fromTo(leftSectionRef.current, 
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(rightSectionRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: "power3.out" }
    );

    // Cleanup
    return () => {
      if (readMoreBtn) {
        readMoreBtn.removeEventListener('mouseenter', () => {});
        readMoreBtn.removeEventListener('mouseleave', () => {});
      }
      if (shopNowBtn) {
        shopNowBtn.removeEventListener('mouseenter', () => {});
        shopNowBtn.removeEventListener('mouseleave', () => {});
      }
    };
  }, [subcategories.length]);

  // Create tripled array for infinite scroll effect
  const displaySubcategories = subcategories.length > 0 
    ? [...subcategories, ...subcategories, ...subcategories]
    : [];

  return (
    <div className="w-full bg-gray-50">
      {/* Category Strip */}
      <div className="w-full bg-gray-700 text-white overflow-hidden py-2 sm:py-3 md:py-4">
        {subcategoriesLoading ? (
          <div className="flex justify-center items-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="ml-2 text-sm">Loading...</span>
          </div>
        ) : displaySubcategories.length > 0 ? (
          <div 
            ref={categoryStripRef}
            className="flex whitespace-nowrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16"
            style={{ width: 'max-content' }}
          >
            {displaySubcategories.map((subcategory, index) => (
              <button 
                key={`${subcategory._id}-${index}`}
                onClick={() => handleSubcategoryClick(subcategory)}
                className="text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:text-pink-400 transition-colors duration-300 cursor-pointer flex-shrink-0 uppercase"
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-2">
            <span className="text-sm">No subcategories available</span>
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Section - Responsive width */}
        <div 
          ref={leftSectionRef}
          className="w-full md:w-[70%] relative flex items-center justify-center 
                     min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] xl:min-h-[90vh]
                     px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-16"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {!leftImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            )}
            <img 
              src="https://res.cloudinary.com/dhezrgjf6/image/upload/f_auto,q_auto:eco,w_800/v1759750904/prd3_q8a5wg.jpg"
              alt="Lingerie Background"
              className={`w-full h-full object-cover object-center transition-opacity duration-300 ${leftImageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setLeftImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-opacity-20 md:bg-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-full w-full">
            {/* Main Heading */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl 
                           font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                           leading-tight tracking-wide">
              <span className="block">STYLISH AND</span>
              <span className="block">COMFORTABLE BRAS</span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 
                          text-gray-600 font-medium mb-4 sm:mb-6 md:mb-8 lg:mb-12 
                          leading-relaxed max-w-none sm:max-w-lg md:max-w-xl lg:max-w-2xl">
              At Sweety Intimates, we believe lingerie is more than just fabric – it's a celebration of confidence, comfort, and femininity. Our mission is to design pieces that make every woman feel beautiful in her own skin, whether it's for everyday wear or special moments.
            </p>

            {/* Read More Button */}
            <button 
              ref={readMoreBtnRef}
              onClick={() => navigate('/blogs')}
              className="border-2 border-gray-400 bg-transparent text-gray-700 
                         px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-4
                         text-xs sm:text-sm md:text-base font-medium 
                         hover:border-gray-600 hover:text-gray-900 transition-all duration-300
                         min-w-[100px] sm:min-w-[120px] md:min-w-[140px]"
            >
              READ MORE
            </button>
          </div>
        </div>

        {/* Right Section - Responsive width */}
        <div 
          ref={rightSectionRef}
          className="w-full md:w-[30%] relative flex flex-col justify-end 
                     min-h-[80vh] sm:min-h-[50vh] md:min-h-[70vh] lg:min-h-[80vh] xl:min-h-[90vh]
                     px-4 py-6 sm:px-6 sm:py-8 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12 "
        >
        {/* Background Image */}
<div className="absolute inset-0">
  {!rightImageLoaded && (
    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )}
  <img 
    src="https://res.cloudinary.com/djgcv06ka/image/upload/f_auto,q_auto:eco,w_800/v1760613841/46_z1w04o.png"
    alt="Lingerie Background"
    className={`w-full h-full object-cover md:object-cover sm:object-cover object-center transition-opacity duration-300 ${rightImageLoaded ? "opacity-100" : "opacity-0"}`}
    loading="lazy"
    onLoad={() => setRightImageLoaded(true)}
  />
</div>


          {/* Content */}
          <div className="relative z-10 text-white mb-4 sm:mb-6 md:mb-8 lg:mb-12">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 
                           font-bold mb-3 sm:mb-4 md:mb-6 lg:mb-8 
                           leading-tight tracking-wide">
              <span className="block">DESIGNED TO</span>
              <span className="block">FLATTER YOUR SHAPE</span>
            </h2>
            
            <button 
              ref={shopNowBtnRef}
              onClick={handleShopNow}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-4
                         text-xs sm:text-sm md:text-base font-bold text-white 
                         transition-all duration-300 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]
                         cursor-pointer"
              style={{ backgroundColor: 'rgba(237, 29, 121, 1)' }}
            >
              SHOP NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LingerieHeroSection;