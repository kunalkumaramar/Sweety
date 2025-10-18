import React, { useState, useEffect, useRef, useMemo, useCallback, forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Cloudinary Image Optimization Component
const CloudinaryImage = forwardRef(({ 
  src, 
  alt, 
  className, 
  priority = false, 
  thumbnail = false, 
  sizes = '100vw',
  ...props 
}, ref) => {
  const [isMobile] = useState(window.innerWidth < 768);

  // Determine optimal width for src fallback
  const getOptimalWidth = () => {
    if (thumbnail) return 150;
    if (priority) return isMobile ? 800 : 1200;
    return isMobile ? 400 : 600; // Adjusted for product cards
  };

  const getQuality = () => {
    if (thumbnail) return 'auto:low';
    return priority ? 'auto:best' : 'auto:eco';
  };

  const optimizeUrl = (url) => {
    if (!url?.includes('cloudinary.com')) return url;
   
    const parts = url.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]*)\/v(\d+)\/([^?]+)(\?.*)?/);
    if (!parts) return url;
   
    const [, base, , ver, path, query] = parts;
    const width = getOptimalWidth();
    const quality = getQuality();
    const newTransforms = `f_auto,q_${quality},w_${width},c_limit`;
   
    return `${base}${newTransforms}/v${ver}/${path}${query || ''}`;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (thumbnail || !src?.includes('cloudinary.com')) return undefined;
   
    const parts = src.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]*)\/v(\d+)\/([^?]+)(\?.*)?/);
    if (!parts) return undefined;
   
    const [, base, , ver, path, query] = parts;
    const q = 'auto:eco';
   
    let srcSetWidths;
    if (priority) {
      srcSetWidths = isMobile ? [400, 800, 1200] : [600, 1200, 1920];
    } else {
      srcSetWidths = isMobile ? [200, 400] : [400, 600];
    }
   
    return srcSetWidths
      .map(w => `${base}f_auto,q_${q},w_${w},c_limit/v${ver}/${path}${query || ''} ${w}w`)
      .join(', ');
  };

  return (
    <img
      ref={ref}
      src={optimizeUrl(src)}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      {...props}
    />
  );
});

// Helper function to get optimized URL (extracted for preload use)
const getOptimizedUrl = (url, isMobile, width = 400) => {
  if (!url?.includes('cloudinary.com')) return url;
 
  const parts = url.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]*)\/v(\d+)\/([^?]+)(\?.*)?/);
  if (!parts) return url;
 
  const [, base, , ver, path, query] = parts;
  const newTransforms = `f_auto,q_auto:eco,w_${width},c_limit`;
 
  return `${base}${newTransforms}/v${ver}/${path}${query || ''}`;
};

const CircularProductCard = React.memo(
  ({ product, index, currentIndex, totalItems, isMobile, onCardClick }) => {
    const isMainCard = index === currentIndex;
    const [loaded, setLoaded] = useState(false);

    const cardTransform = useMemo(() => {
      const angleStep = (2 * Math.PI) / totalItems;
      const angle = (index - currentIndex) * angleStep;
      const radius = isMobile ? 190 : 320;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const scale =
        z > 0 ? 1 : Math.max(isMobile ? 0.6 : 0.7, 0.7 + (z / radius) * 0.3);
      const opacity = isMainCard ? 1 : 0.7;
      const tiltY = isMainCard ? 0 : x > 0 ? -15 : 15;

      return {
        transform: `translate3d(${x}px, 0, ${z}px) rotateY(${
          angle + (tiltY * Math.PI) / 180
        }rad) scale(${scale})`,
        opacity,
        zIndex: Math.round((z + radius) * 10),
      };
    }, [index, currentIndex, totalItems, isMainCard, isMobile]);

    const imageSrc = product.colors?.[0]?.images?.[0] ||
      product.images?.[0] ||
      "/placeholder.png";

    const cardSizes = "(max-width: 768px) 160px, 265px";

    return (
      <div
        className="absolute transition-all duration-500 ease-out cursor-pointer will-change-transform overflow-x-hidden"
        style={{
          transform: cardTransform.transform,
          opacity: cardTransform.opacity,
          zIndex: cardTransform.zIndex,
          width: isMobile ? "160px" : "265px",
        }}
        onClick={() => onCardClick(product)}
      >
        <div className="bg-[#f9e2e7] overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
          <div className=" sm:p-4">
            <div className="bg-white p-1 relative overflow-hidden">
              {!loaded && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <CloudinaryImage
                src={imageSrc}
                alt={product.name}
                className={`w-full h-auto max-h-72 object-contain transition-all duration-300 hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
                priority={index === currentIndex && currentIndex === 0} // Prioritize only the initial main card
                sizes={cardSizes}
                onLoad={() => setLoaded(true)}
              />
              <div className="absolute inset-0 bg-transparent bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
          </div>

          <div className="px-3 sm:px-4 pb-4 sm:pb-5 text-center">
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
              {product.subcategoryName || product.categoryName}
            </p>
            <p className="font-bold text-xs sm:text-sm text-black mb-1 transition-colors duration-300 hover:text-gray-800 line-clamp-2">
              {product.name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-sm sm:text-base font-bold text-pink-600">
                ₹{product.price?.toLocaleString("en-IN")}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs text-gray-500 line-through">
                  ₹{product.originalPrice?.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [rawFeaturedProducts, setRawFeaturedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const containerRef = useRef(null);
  const scrollAccumulator = useRef(0);
  const scrollTimeout = useRef(null);
  const autoScrollRef = useRef(null);
  const isUserInteracting = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const total = featuredProducts.length;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1024) setItemsPerPage(4);
      else if (width >= 768) setItemsPerPage(3);
      else setItemsPerPage(2);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const categoriesRes = await fetch(`${API_BASE_URL}/category`);
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.data || [];
        const products = [];

        for (const category of categories) {
          const subcategoriesRes = await fetch(
            `${API_BASE_URL}/sub-category/category/${category._id}`
          );
          const subcategoriesData = await subcategoriesRes.json();
          const subcategories = subcategoriesData.data || [];

          if (subcategories.length > 0) {
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
            const productsRes = await fetch(
              `${API_BASE_URL}/product/category/${category._id}?page=1&limit=1`
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

        setRawFeaturedProducts(products);
        setError(null);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load featured products");
        setRawFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const cacheKey = "featured_raw_products";
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    const now = Date.now();
    const cacheExpiry = 3600000; // 1 hour

    if (cached && cacheTime && now - parseInt(cacheTime) < cacheExpiry) {
      setRawFeaturedProducts(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchFeaturedProducts();
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (rawFeaturedProducts.length === 0) {
      setFeaturedProducts([]);
      return;
    }
    const cacheKey = "featured_raw_products";
    setFeaturedProducts(rawFeaturedProducts);
    localStorage.setItem(cacheKey, JSON.stringify(rawFeaturedProducts));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  }, [rawFeaturedProducts]);

  // Preload the first product image if mobile (for LCP optimization) - Fixed regex issue
  useEffect(() => {
    if (isMobile && featuredProducts.length > 0) {
      const firstImage = featuredProducts[0].colors?.[0]?.images?.[0] ||
        featuredProducts[0].images?.[0];
      if (firstImage) {
        const preloadUrl = getOptimizedUrl(firstImage, isMobile, 400);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.fetchpriority = 'high';
        link.href = preloadUrl;
        document.head.appendChild(link);
       
        return () => document.head.removeChild(link);
      }
    }
  }, [featuredProducts, isMobile]);

  // Auto-scroll (mobile)
  useEffect(() => {
    if (!isMobile || total === 0) return;
    const startAutoScroll = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        if (!isUserInteracting.current) {
          setCurrentIndex((prev) => (prev + 1) % total);
        }
      }, 3000);
    };
    startAutoScroll();
    return () => clearInterval(autoScrollRef.current);
  }, [isMobile, total]);

  // Wheel scroll (desktop)
  useEffect(() => {
    if (isMobile || total === 0) return;
    const handleScroll = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInCardsArea =
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2;
      if (!isInCardsArea) return;

      e.preventDefault();
      scrollAccumulator.current += e.deltaY;

      const threshold = 100;
      if (Math.abs(scrollAccumulator.current) >= threshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        setCurrentIndex((prev) =>
          direction > 0
            ? Math.min(prev + 1, total - 1)
            : Math.max(prev - 1, 0)
        );
        scrollAccumulator.current = 0;
      }

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        scrollAccumulator.current = 0;
      }, 150);
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [total, currentIndex, isMobile]);

  const handlePrevious = useCallback(() => {
    if (isMobile) {
      isUserInteracting.current = true;
      setTimeout(() => (isUserInteracting.current = false), 5000);
    }
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total, isMobile]);

  const handleNext = useCallback(() => {
    if (isMobile) {
      isUserInteracting.current = true;
      setTimeout(() => (isUserInteracting.current = false), 5000);
    }
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total, isMobile]);

  const handleCardClick = useCallback((product) => {
    window.location.href = `/product/${product._id}`;
  }, []);

  const progressWidth = `${((currentIndex + itemsPerPage) / total) * 100}%`;

  if (loading) {
    return (
      <div className="w-full py-12 bg-white px-4">
        <h2
          className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-12 text-black tracking-wide"
          style={{ fontFamily: "Montaga, serif" }}
        >
          FEATURED PRODUCTS
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error || total === 0) {
    return (
      <div className="w-full py-12 bg-white px-4">
        <h2
          className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-12 text-black tracking-wide"
          style={{ fontFamily: "Montaga, serif" }}
        >
          FEATURED PRODUCTS
        </h2>
        <div className="text-center text-gray-500">
          {error || "No featured products available"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 bg-white sm:py-12 lg:px-2">
      <h2
        className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-black tracking-wide"
        style={{ fontFamily: "Montaga, serif" }}
      >
        FEATURED PRODUCTS
      </h2>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 rounded-sm shadow-lg transition-all duration-300 flex items-center justify-center bg-[#F9E2E7] hover:bg-pink-500 hover:shadow-xl hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 rounded-sm shadow-lg transition-all duration-300 flex items-center justify-center bg-[#F9E2E7] hover:bg-pink-500 hover:shadow-xl hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Circular Carousel */}
        <div
          ref={containerRef}
          className={`relative ${
            isMobile ? "h-[450px]" : "h-[600px]"
          } flex items-center justify-center transform-gpu sm:overflow-visible overflow-x-hidden`}
          style={{
            perspective: isMobile ? "700px" : "900px",
            perspectiveOrigin: "center center",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center transform-gpu">
            {featuredProducts.map((product, index) => (
              <CircularProductCard
                key={product._id}
                product={product}
                index={index}
                currentIndex={currentIndex}
                totalItems={total}
                isMobile={isMobile}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 sm:mt-8 w-full max-w-4xl mx-auto px-4">
        <div className="h-1 bg-gray-200 relative overflow-hidden rounded-full">
          <div
            className="h-full bg-[#F9E2E7] absolute top-0 left-0 transition-all duration-500 rounded-full"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <style>
        {`
          .transform-gpu {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
          .will-change-transform {
            will-change: transform, opacity;
          }
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @media (max-width: 768px) {
            .transform-gpu {
              perspective: 600px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FeaturedProducts;