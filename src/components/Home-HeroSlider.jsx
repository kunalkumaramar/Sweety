import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../Redux/slices/bannerSlice";
import { fetchMobileBanners } from "../Redux/slices/mobileBannerSlice";

const HeroSlider = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Get banners from Redux store with fallback
  const { banners = [], loading = false, error = null } = useSelector((state) =>
    isMobile ? state.mobileBanners || {} : state.banners || {}
  );

  // Banner image optimization helper with responsive widths
  const optimizeBanner = (url) => {
    if (!url) return url;
    // Default desktop transformation
    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto:eco,w_1920,c_limit/'
    );
  };
  
  // Generate responsive image URLs for different viewports
  const getResponsiveImageUrl = (url) => {
    if (!url) return url;
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const path = url.split('/upload/')[1];
    // Return multiple sizes for srcset
    return {
      mobile: baseUrl + 'f_auto,q_auto:eco,w_480,c_limit/' + path,
      tablet: baseUrl + 'f_auto,q_auto:eco,w_768,c_limit/' + path,
      desktop: baseUrl + 'f_auto,q_auto:eco,w_1920,c_limit/' + path,
    };
  };

  // Handle window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch banners based on device type
  useEffect(() => {
    if (isMobile) {
      dispatch(fetchMobileBanners());
    } else {
      dispatch(fetchBanners());
    }
  }, [dispatch, isMobile]);

  // Reset loadedImages when banners change
  useEffect(() => {
    if (banners.length > 0) {
      setLoadedImages(new Array(banners.length).fill(false));
    }
  }, [banners]);

  // Auto-slide functionality with circular transition
  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const handleBannerClick = (link) => {
    if (!link) return;
    
    // Trim whitespace
    link = link.trim();
    
    // Check if the link starts with http:// or https://
    const hasProtocol = /^https?:\/\//i.test(link);
    
    if (hasProtocol) {
      // It's an absolute URL - always open in new tab
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link.startsWith('www.') || /^[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(link)) {
      // It's a domain without protocol (like www.google.com or google.com)
      // Add https:// and open in new tab
      window.open('https://' + link, '_blank', 'noopener,noreferrer');
    } else {
      // It's a relative/internal path - use React Router
      const cleanLink = link.startsWith('/') ? link : `/${link}`;
      navigate(cleanLink);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative h-[580px] lg:h-[680px] bg-gray-200 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading banners...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative h-[580px] lg:h-[680px] bg-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Error loading banners: {error}</div>
      </div>
    );
  }

  // No banners state
  if (!banners || banners.length === 0) {
    return (
      <div className="relative h-[580px] lg:h-[680px] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">No banners available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] overflow-hidden">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ pointerEvents: index === currentSlide ? "auto" : "none" }}
          >
            <div
              onClick={() => handleBannerClick(banner.link)}
              className={`w-full h-full relative ${banner.link ? 'cursor-pointer' : ''}`}
            >
              {!loadedImages[index] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              )}
              <picture>
                <source
                  srcSet={getResponsiveImageUrl(banner.imageUrl).mobile}
                  media="(max-width: 480px)"
                />
                <source
                  srcSet={getResponsiveImageUrl(banner.imageUrl).tablet}
                  media="(max-width: 768px)"
                />
                <img
                  src={getResponsiveImageUrl(banner.imageUrl).desktop}
                  srcSet={`${getResponsiveImageUrl(banner.imageUrl).desktop} 1920w, ${getResponsiveImageUrl(banner.imageUrl).tablet} 768w, ${getResponsiveImageUrl(banner.imageUrl).mobile} 480w`}
                  sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1920px"
                  alt={banner.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadedImages[index] ? "opacity-100" : "opacity-0"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                  onLoad={() => {
                    setLoadedImages((prev) => {
                      const newLoaded = [...prev];
                      newLoaded[index] = true;
                      return newLoaded;
                    });
                  }}
                />
              </picture>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "bg-white w-8 h-2"
                : "bg-white/50 w-2 h-2 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;