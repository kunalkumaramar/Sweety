import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories } from "../Redux/slices/categorySlice";
import { getSubcategoriesByCategory } from "../Redux/slices/subcategorySlice";
import { getProductsBySubcategory } from "../Redux/slices/productsSlice";

// ⭐ Cloudinary Image Component (unchanged)
const CloudinaryImage = forwardRef(
  (
    {
      src,
      alt,
      className,
      priority = false,
      thumbnail = false,
      sizes = "100vw",
      ...props
    },
    ref
  ) => {
    const [isMobile] = useState(window.innerWidth < 768);
    const [shouldLoad, setShouldLoad] = useState(priority);
    const imgRef = useRef(null);

    useEffect(() => {
      if (priority || shouldLoad) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "50px" }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [priority, shouldLoad]);

    const getOptimalWidth = () => {
      if (thumbnail) return 150;
      if (priority) return isMobile ? 800 : 1200;
      return isMobile ? 400 : 600;
    };

    const getQuality = () => {
      if (thumbnail) return "auto:low";
      return priority ? "auto:best" : "auto:eco";
    };

    const optimizeUrl = (url) => {
      if (!url?.includes("cloudinary.com")) return url;

      const parts = url.match(
        /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^/]*)\/v(\d+)\/([^?]+)(\?.*)?/
      );
      if (!parts) return url;

      const [, base, , ver, path, query] = parts;
      const width = getOptimalWidth();
      const quality = getQuality();
      const newTransforms = `f_auto,q_${quality},w_${width},c_limit`;

      return `${base}${newTransforms}/v${ver}/${path}${query || ""}`;
    };

    const generateSrcSet = () => {
      if (thumbnail || !src?.includes("cloudinary.com")) return undefined;

      const parts = src.match(
        /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^/]*)\/v(\d+)\/([^?]+)(\?.*)?/
      );
      if (!parts) return undefined;

      const [, base, , ver, path, query] = parts;
      const q = "auto:eco";

      let srcSetWidths;
      if (priority) {
        srcSetWidths = isMobile ? [400, 800, 1200] : [600, 1200, 1920];
      } else {
        srcSetWidths = isMobile ? [200, 400] : [400, 600];
      }

      return srcSetWidths
        .map(
          (w) =>
            `${base}f_auto,q_${q},w_${w},c_limit/v${ver}/${path}${
              query || ""
            } ${w}w`
        )
        .join(", ");
    };

    return (
      <img
        ref={(node) => {
          imgRef.current = node;
          if (ref) ref.current = node;
        }}
        src={shouldLoad ? optimizeUrl(src) : undefined}
        srcSet={shouldLoad ? generateSrcSet() : undefined}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        {...props}
      />
    );
  }
);

// ⭐ FIXED: Circular Product Card with proper positioning
const CircularProductCard = React.memo(
  ({ product, index, currentIndex, totalItems, isMobile, onCardClick }) => {
    const [loaded, setLoaded] = useState(false);

    // ⭐ CRITICAL FIX: Calculate relative position for infinite loop
    const getRelativePosition = () => {
      let diff = index - currentIndex;
      
      // ⭐ Handle wrap-around for infinite loop
      if (diff > totalItems / 2) {
        diff -= totalItems;
      } else if (diff < -totalItems / 2) {
        diff += totalItems;
      }
      
      return diff;
    };

    const relativePosition = getRelativePosition();
    const isMainCard = relativePosition === 0;

    // ⭐ Render cards within viewport range (both sides)
    const distanceFromCenter = Math.abs(relativePosition);
    const shouldRender = distanceFromCenter <= (isMobile ? 2 : 3);

    // ⭐ FIXED: Transform calculations for proper circular positioning
    const cardTransform = useMemo(() => {
      if (!shouldRender) {
        return {
          transform: "translate3d(0, 0, -1000px)", // Hide far behind
          opacity: 0,
          zIndex: -1,
          pointerEvents: "none",
        };
      }

      const angleStep = (2 * Math.PI) / totalItems;
      const angle = relativePosition * angleStep;
      const radius = isMobile ? 160 : 350; // ⭐ Increased radius for better visibility
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      // ⭐ FIXED: Better scaling curve
      const scale = z > 0 
        ? 1 
        : Math.max(0.6, 0.6 + (z / radius) * 0.4); // Cards behind are smaller
      
      // ⭐ FIXED: Opacity for depth perception
      const opacity = z > 0 
        ? 1 
        : Math.max(0.3, 0.3 + (z / radius) * 0.7);
      
      const tiltY = relativePosition === 0 ? 0 : x > 0 ? -15 : 15;

      return {
        transform: `translate3d(${x}px, 0, ${z}px) rotateY(${
          angle + (tiltY * Math.PI) / 180
        }rad) scale(${scale})`,
        opacity,
        zIndex: Math.round((z + radius) * 10),
        pointerEvents: isMainCard ? "auto" : "none", // ⭐ Only main card clickable
      };
    }, [relativePosition, totalItems, isMainCard, isMobile, shouldRender]);

    const imageSrc =
      product.colors?.[0]?.images?.[0] ||
      product.images?.[0] ||
      "/placeholder.png";

    const cardSizes = "(max-width: 768px) 140px, 265px";

    if (!shouldRender) return null;

    return (
      <div
        className="absolute transition-all duration-700 ease-out cursor-pointer will-change-transform"
        style={{
          transform: cardTransform.transform,
          opacity: cardTransform.opacity,
          zIndex: cardTransform.zIndex,
          width: isMobile ? "140px" : "265px",
          pointerEvents: cardTransform.pointerEvents,
        }}
        onClick={() => isMainCard && onCardClick(product)}
      >
        <div className="bg-[#f9e2e7] overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
          <div className="sm:p-4">
            <div
              className="bg-white p-1 relative overflow-hidden"
              style={{ aspectRatio: "1 / 1.2" }}
            >
              {!loaded && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <CloudinaryImage
                src={imageSrc}
                alt={product.name}
                className={`w-full h-full object-contain transition-all duration-300 hover:scale-105 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                priority={isMainCard}
                sizes={cardSizes}
                onLoad={() => setLoaded(true)}
              />
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
              {product.originalPrice &&
                product.originalPrice > product.price && (
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
  const dispatch = useDispatch();

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );
  const { subcategories } = useSelector((state) => state.subcategories);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const isFetchingRef = useRef(false);
  const hasFetchedSubcategories = useRef(false);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const scrollAccumulator = useRef(0);
  const scrollTimeout = useRef(null);
  const autoScrollRef = useRef(null);
  const isUserInteracting = useRef(false);

  const total = featuredProducts.length;

  // Detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  // Fetch categories
  useEffect(() => {
    if (!isVisible) return;
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(getCategories());
    }
  }, [dispatch, categories.length, categoriesLoading, isVisible]);

  // Fetch subcategories
  useEffect(() => {
    if (!isVisible) return;
    if (
      categories.length > 0 &&
      !hasFetchedSubcategories.current &&
      !isFetchingRef.current
    ) {
      hasFetchedSubcategories.current = true;

      categories.forEach((category) => {
        const hasSubcats = subcategories.some(
          (sub) => sub.category === category._id
        );

        if (!hasSubcats) {
          dispatch(getSubcategoriesByCategory(category._id));
        }
      });
    }
  }, [dispatch, categories, subcategories, isVisible]);

  // Build featured products
  useEffect(() => {
    if (!isVisible) return;

    const buildFeaturedProducts = async () => {
      if (isFetchingRef.current || subcategories.length === 0) {
        return;
      }

      const cacheKey = "featured_raw_products";
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      const cacheExpiry = 3600000;

      if (cached && cacheTime && now - parseInt(cacheTime) < cacheExpiry) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache && parsedCache.length > 0) {
            setFeaturedProducts(parsedCache);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }

      try {
        isFetchingRef.current = true;

        const hideSpinnerTimer = setTimeout(() => {
          setLoading(false);
        }, 500);

        const limitedSubcats = subcategories.slice(0, 8); // ⭐ Increased to 8 for better loop
        const loadedProducts = [];

        for (const subcat of limitedSubcats) {
          try {
            const result = await dispatch(
              getProductsBySubcategory({
                subcategoryId: subcat._id,
                page: 1,
                limit: 1,
              })
            ).unwrap();

            const product = result?.products?.[0];

            if (product) {
              const category = categories.find(
                (cat) => cat._id === subcat.category
              );

              const enrichedProduct = {
                ...product,
                categoryName: category?.name || "Unknown",
                subcategoryName: subcat.name,
              };

              loadedProducts.push(enrichedProduct);

              if (loadedProducts.length >= 4 && loading) {
                setFeaturedProducts([...loadedProducts]);
                clearTimeout(hideSpinnerTimer);
                setLoading(false);
              }
            }
          } catch (err) {
            console.error(`Failed to fetch product for ${subcat.name}`, err);
          }
        }

        const seenIds = new Set();
        const uniqueProducts = loadedProducts.filter((product) => {
          if (seenIds.has(product._id)) return false;
          seenIds.add(product._id);
          return true;
        });

        const shuffled = uniqueProducts.sort(() => Math.random() - 0.5);

        setFeaturedProducts(shuffled);

        localStorage.setItem(cacheKey, JSON.stringify(shuffled));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

        clearTimeout(hideSpinnerTimer);
        setError(null);
      } catch (err) {
        console.error("Error building featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    buildFeaturedProducts();
  }, [dispatch, categories, subcategories, isVisible, loading]);

  // Auto-scroll with infinite loop
  useEffect(() => {
    if (!isMobile || total === 0 || !isVisible) return;
    const startAutoScroll = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        if (!isUserInteracting.current) {
          setCurrentIndex((prev) => (prev + 1) % total); // ⭐ Wraps infinitely
        }
      }, 3000);
    };
    startAutoScroll();
    return () => clearInterval(autoScrollRef.current);
  }, [isMobile, total, isVisible]);

  // Wheel scroll with infinite loop
  useEffect(() => {
    if (isMobile || total === 0 || !isVisible) return;

    let lastScrollTime = 0;
    const scrollThrottle = 150;

    const handleScroll = (e) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInCardsArea =
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2;
      if (!isInCardsArea) return;

      scrollAccumulator.current += e.deltaY;

      const threshold = 100;
      if (Math.abs(scrollAccumulator.current) >= threshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        
        // ⭐ FIXED: Infinite loop navigation
        setCurrentIndex((prev) => {
          const next = prev + direction;
          if (next < 0) return total - 1; // Wrap to end
          if (next >= total) return 0; // Wrap to start
          return next;
        });
        
        scrollAccumulator.current = 0;
        lastScrollTime = now;
      }

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        scrollAccumulator.current = 0;
      }, 150);
    };

    window.addEventListener("wheel", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [total, currentIndex, isMobile, isVisible]);

  // ⭐ FIXED: Navigation with infinite loop
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

  const onTouchStart = useCallback((e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (!touchStartX) return;

      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      const minSwipeDistance = 50;

      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }

      setTouchStartX(null);
    },
    [touchStartX, handleNext, handlePrevious]
  );

  const progressWidth = `${((currentIndex + 1) / total) * 100}%`; // ⭐ Fixed progress calculation

  if (loading) {
    return (
      <div ref={sectionRef} className="w-full py-12 bg-white px-4">
        <h2
          className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-12 text-black tracking-wide"
          style={{ fontFamily: "Montaga, serif" }}
        >
          FEATURED PRODUCTS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg">
              <div className="aspect-[1/1.2] bg-gray-300"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || total === 0) {
    return (
      <div ref={sectionRef} className="w-full py-12 bg-white px-4">
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
    <div ref={sectionRef} className="w-full py-8 bg-white sm:py-12 lg:px-2">
      <h2
        className="text-2xl sm:text-3xl lg:text-6xl font-light text-center mb-8 sm:mb-12 text-black tracking-wide"
        style={{ fontFamily: "Montaga, serif" }}
      >
        FEATURED PRODUCTS
      </h2>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isMobile && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 rounded-sm shadow-lg transition-all duration-300 flex items-center justify-center bg-[#F9E2E7] hover:bg-pink-500 hover:shadow-xl hover:scale-105"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-8 h-12 sm:w-10 sm:h-14 rounded-sm shadow-lg transition-all duration-300 flex items-center justify-center bg-[#F9E2E7] hover:bg-pink-500 hover:shadow-xl hover:scale-105"
              aria-label="Next product"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </>
        )}

        {/* ⭐ FIXED: Increased container height and removed overflow-x-hidden */}
        <div
          ref={containerRef}
          className={`relative ${
            isMobile ? "h-[450px]" : "h-[650px]"
          } flex items-center justify-center transform-gpu overflow-visible`}
          style={{
            perspective: isMobile ? "600px" : "1000px",
            perspectiveOrigin: "center center",
          }}
          onTouchStart={isMobile ? onTouchStart : undefined}
          onTouchEnd={isMobile ? onTouchEnd : undefined}
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
              perspective: 500px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FeaturedProducts;
