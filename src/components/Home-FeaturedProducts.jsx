import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CircularProductCard = React.memo(
  ({ product, index, currentIndex, totalItems, isMobile, onCardClick }) => {
    const isMainCard = index === currentIndex;
    const [loaded, setLoaded] = useState(false);

    const cardTransform = useMemo(() => {
      const angleStep = (2 * Math.PI) / totalItems;
      const angle = (index - currentIndex) * angleStep;
      const radius = isMobile ? 180 : 320; // slightly smaller on mobile
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const scale = z > 0 ? 1 : Math.max(isMobile ? 0.7 : 0.75, 0.7 + (z / radius) * 0.3);
      const opacity = isMainCard ? 1 : 0.8;
      const tiltY = isMainCard ? 0 : (x > 0 ? -15 : 15);

      return {
        transform: `translate3d(${x}px, 0, ${z}px) rotateY(${
          angle + (tiltY * Math.PI) / 180
        }rad) scale(${scale})`,
        opacity,
        zIndex: Math.round((z + radius) * 10),
      };
    }, [index, currentIndex, totalItems, isMainCard, isMobile]);

    return (
      <div
        className="absolute transition-all duration-500 ease-out cursor-pointer will-change-transform"
        style={{
          transform: cardTransform.transform,
          opacity: cardTransform.opacity,
          zIndex: cardTransform.zIndex,
          width: isMobile ? "150px" : "265px",
        }}
        onClick={() => onCardClick(product)}
      >
        <div className="bg-[#f9e2e7] overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-xl">
          <div className="p-3 sm:p-4">
            <div className="bg-white p-1 relative overflow-hidden rounded-lg">
              {!loaded && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <img
                src={
                  product.colors?.[0]?.images?.[0] ||
                  product.images?.[0] ||
                  "/placeholder.png"
                }
                alt={product.name}
                className={`w-full h-auto max-h-64 object-contain transition-all duration-300 hover:scale-105 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
              />
            </div>
          </div>

          <div className="px-3 sm:px-4 pb-4 sm:pb-5 text-center">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1 uppercase tracking-wide">
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
  const autoScrollRef = useRef(null);
  const isUserInteracting = useRef(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const total = featuredProducts.length;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesRes = await fetch(`${API_BASE_URL}/category`);
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.data || [];

        const products = [];
        for (const category of categories) {
          const subRes = await fetch(
            `${API_BASE_URL}/sub-category/category/${category._id}`
          );
          const subData = await subRes.json();
          const subs = subData.data || [];

          if (subs.length > 0) {
            for (const sub of subs) {
              const prodRes = await fetch(
                `${API_BASE_URL}/product/subcategory/${sub._id}?page=1&limit=1&isActive=true`
              );
              const prodData = await prodRes.json();
              const latest = prodData.data?.products?.[0];
              if (latest) {
                products.push({
                  ...latest,
                  categoryName: category.name,
                  subcategoryName: sub.name,
                });
              }
            }
          }
        }

        setRawFeaturedProducts(products);
        setError(null);
      } catch (e) {
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (rawFeaturedProducts.length) {
      setFeaturedProducts(rawFeaturedProducts);
    }
  }, [rawFeaturedProducts]);

  // Auto scroll (mobile only)
  useEffect(() => {
    if (!isMobile || total === 0) return;
    autoScrollRef.current = setInterval(() => {
      if (!isUserInteracting.current) {
        setCurrentIndex((prev) => (prev + 1) % total);
      }
    }, 3000);
    return () => clearInterval(autoScrollRef.current);
  }, [isMobile, total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleCardClick = useCallback((product) => {
    window.location.href = `/product/${product._id}`;
  }, []);

  const progressWidth = `${((currentIndex + itemsPerPage) / total) * 100}%`;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "Montaga, serif" }}>
          FEATURED PRODUCTS
        </h2>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
      </div>
    );
  }

  if (error || total === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "Montaga, serif" }}>
          FEATURED PRODUCTS
        </h2>
        {error || "No featured products available"}
      </div>
    );
  }

  return (
    <div className="w-full py-10 bg-white overflow-hidden">
      <h2
        className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-10 text-black tracking-wide"
        style={{ fontFamily: "Montaga, serif" }}
      >
        FEATURED PRODUCTS
      </h2>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
        {/* Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center rounded-md bg-[#F9E2E7] hover:bg-pink-500 transition-all"
        >
          <ChevronLeft className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center rounded-md bg-[#F9E2E7] hover:bg-pink-500 transition-all"
        >
          <ChevronRight className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel */}
        <div
          ref={containerRef}
          className={`relative ${isMobile ? "h-[400px]" : "h-[600px]"} flex items-center justify-center overflow-visible`}
          style={{
            perspective: isMobile ? "700px" : "900px",
            perspectiveOrigin: "center center",
            width: "100%",
          }}
        >
          <div className="relative w-full flex items-center justify-center transform-gpu">
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

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default FeaturedProducts;
