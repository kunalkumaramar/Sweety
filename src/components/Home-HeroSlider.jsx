import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../Redux/slices/bannerSlice";
import { fetchMobileBanners } from "../Redux/slices/mobileBannerSlice";

// Cloudinary Image Optimization Component
const CloudinaryImage = ({ src, alt, className, priority = false, ...props }) => {
  const [isMobile] = useState(window.innerWidth < 768);

  // Determine optimal width based on usage
  const getOptimalWidth = () => {
    if (priority) return isMobile ? 800 : 1920;
    return isMobile ? 600 : 1200;
  };

  const getQuality = () => {
    return priority ? 'auto:best' : 'auto:eco';
  };

  const optimizeUrl = (url) => {
    if (!url?.includes('cloudinary.com')) return url;
   
    const width = getOptimalWidth();
    const quality = getQuality();
   
    return url.replace(
      '/upload/',
      `/upload/f_auto,q_${quality},w_${width},c_limit/`
    );
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!src?.includes('cloudinary.com')) return undefined;
   
    const widths = isMobile ? [480, 800] : [800, 1200, 1920];
    const baseUrl = src.replace('/upload/', '/upload/f_auto,q_auto:eco/');
    const path = src.split('/upload/')[1];
   
    return widths
      .map(w => `${baseUrl}w_${w},c_limit/${path} ${w}w`)
      .join(', ');
  };

  return (
    <img
      src={optimizeUrl(src)}
      srcSet={generateSrcSet()}
      sizes="100vw"
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      {...props}
    />
  );
};

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

  // Preload the first banner image (for LCP optimization)
  useEffect(() => {
    if (banners.length > 0) {
      const firstBannerUrl = banners[0].imageUrl;
      if (firstBannerUrl) {
        const preloadUrl = firstBannerUrl.replace(
          '/upload/',
          '/upload/f_auto,q_auto:eco,w_800,c_limit/' // Mobile-optimized preload
        );
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.fetchpriority = 'high';
        link.href = preloadUrl;
        document.head.appendChild(link);
       
        return () => document.head.removeChild(link);
      }
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
      <div className="relative h-[580px] lg:h-[680px] bg-gray-200 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}> {/* Reserve aspect ratio */}
        <div className="text-gray-600 text-xl">Loading banners...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative h-[580px] lg:h-[680px] bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}> {/* Reserve aspect ratio */}
        <div className="text-red-600 text-xl">Error loading banners: {error}</div>
      </div>
    );
  }

  // No banners state
  if (!banners || banners.length === 0) {
    return (
      <div className="relative h-[580px] lg:h-[680px] bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}> {/* Reserve aspect ratio */}
        <div className="text-gray-600 text-xl">No banners available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] overflow-hidden" style={{ aspectRatio: '16 / 9' }}> {/* Reserve space for CLS */}
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
              <CloudinaryImage
                src={banner.imageUrl}
                alt={banner.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  loadedImages[index] ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0} // Only first banner eager
                onLoad={() => {
                  setLoadedImages((prev) => {
                    const newLoaded = [...prev];
                    newLoaded[index] = true;
                    return newLoaded;
                  });
                }}
              />
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