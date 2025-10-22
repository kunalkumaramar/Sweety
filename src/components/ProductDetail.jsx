import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import {
  getProductById,
  getProductsByCategory,
  getProductsBySubcategory,
  getAvailableSizes,
  clearCurrentProduct,
} from "../Redux/slices/productsSlice";
import { getCategories } from "../Redux/slices/categorySlice";
import { getSubcategoriesByCategory } from "../Redux/slices/subcategorySlice";
import { useCart } from "../components/CartContext";
import { useWishlist } from "../components/WishlistContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use cart and wishlist hooks instead of direct Redux
  const { addToCart: addToCartHandler } = useCart();
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();

  // Redux state
  const {
    currentProduct,
    products: similarProducts,
    loading,
    productLoading,
    error,
    productError,
    productSizes,
    sizesLoading,
  } = useSelector((state) => state.products);

  // Categories and subcategories for breadcrumbs
  const { categories } = useSelector((state) => state.categories);
  const { subcategories } = useSelector((state) => state.subcategories);

  // Get authentication state
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Local states
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProductsIndex, setSimilarProductsIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [loadedImages, setLoadedImages] = useState({});
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false); // State for size chart modal

  // Refs
  const sectionRef = useRef(null);
  const similarProductsRef = useRef(null);
  const sizeChartModalRef = useRef(null); // Ref for modal

  // Get current color object
  const selectedColor = currentProduct?.colors?.[selectedColorIndex];

  // Check if product is in wishlist using the hook
  const isInWishlist = currentProduct
    ? isItemInWishlist(currentProduct._id)
    : false;

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !categories || categories.length === 0) return "";
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "";
  };

  // Helper function to get subcategory name by ID
  const getSubcategoryNameById = (subcategoryId) => {
    if (!subcategoryId || !subcategories || subcategories.length === 0)
      return "";
    const subcategory = subcategories.find((sub) => sub._id === subcategoryId);
    return subcategory ? subcategory.name : "";
  };

  // Get breadcrumb data
  const getBreadcrumbData = () => {
    if (!currentProduct) return null;

    const categoryName = getCategoryNameById(currentProduct.category);
    const subcategoryName = getSubcategoryNameById(currentProduct.subcategory);

    return {
      categoryName,
      subcategoryName,
      categorySlug: categoryName
        ? categoryName.toLowerCase().replace(/\s+/g, "-")
        : "",
      subcategorySlug: subcategoryName
        ? subcategoryName.toLowerCase().replace(/\s+/g, "-")
        : "",
    };
  };

  // Add this component for better UX
  const ProductDetailSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="bg-gray-300 h-[600px] rounded-lg"></div>
        <div className="space-y-4">
          <div className="bg-gray-300 h-8 rounded w-3/4"></div>
          <div className="bg-gray-300 h-6 rounded w-1/2"></div>
          <div className="bg-gray-300 h-4 rounded w-full"></div>
          <div className="bg-gray-300 h-12 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  // Load categories and subcategories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(getCategories());
    }
  }, [dispatch, categories.length]);

  // Fetch product data
  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }

    // Cleanup on component unmount
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, dispatch]);

  // Load subcategories when product is loaded and has category
  useEffect(() => {
    if (currentProduct?.category && subcategories.length === 0) {
      dispatch(getSubcategoriesByCategory(currentProduct.category));
    }
  }, [currentProduct?.category, dispatch, subcategories.length]);

  // Initialize product data when currentProduct changes
  useEffect(() => {
    if (currentProduct?.colors?.length > 0) {
      // Set default color and reset image index
      setSelectedColorIndex(0);
      setCurrentImageIndex(0);

      // Set default size from first color's available sizes
      const firstColor = currentProduct.colors[0];
      const availableSize = firstColor.sizeStock?.find(
        (size) => size.stock > 0
      );
      setSelectedSize(availableSize?.size || "");

      // Fetch similar products - prefer subcategory over category
      if (currentProduct.subcategory) {
        dispatch(
          getProductsBySubcategory({
            subcategoryId: currentProduct.subcategory,
            page: 1,
            limit: 8,
            isActive: true,
          })
        );
      } else if (currentProduct.category) {
        dispatch(
          getProductsByCategory({
            categoryId: currentProduct.category,
            page: 1,
            limit: 8,
          })
        );
      }

      // Reset scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentProduct, dispatch]);

  // Load sizes when color changes
  useEffect(() => {
    if (currentProduct && selectedColor && selectedColor.colorName) {
      // Check if we already have sizes for this product/color combination
      const productSizesData = productSizes[currentProduct._id];
      if (!productSizesData || !productSizesData[selectedColor.colorName]) {
        dispatch(
          getAvailableSizes({
            productId: currentProduct._id,
            colorName: selectedColor.colorName,
          })
        );
      }
    }
  }, [currentProduct, selectedColor, dispatch, productSizes]);

  // Adjust similar products per page on resize
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) setItemsPerPage(2);
      else if (width < 1024) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Reset selected size when color changes
  useEffect(() => {
    if (selectedColor?.sizeStock) {
      const availableSize = selectedColor.sizeStock.find(
        (size) => size.stock > 0
      );
      setSelectedSize(availableSize?.size || "");
    }
  }, [selectedColorIndex, selectedColor]);

  // Handle body scroll locking for size chart modal
  useEffect(() => {
    if (isSizeChartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSizeChartOpen]);

  // Animate product details + similar products
  useEffect(() => {
    if (!loading && !productLoading && currentProduct) {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }

      const timer = setTimeout(() => {
        if (similarProductsRef.current) {
          gsap.fromTo(
            similarProductsRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          );
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [loading, productLoading, currentProduct]);

  // Handle Buy It Now
  const handleBuyNow = async () => {
    if (!currentProduct || !selectedColor || !selectedSize) return;

    setAddingToCart(true);

    try {
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || "";

      const result = await addToCartHandler(
        currentProduct,
        quantity,
        selectedColor.colorName,
        selectedSize,
        selectedImage
      );

      if (result.success) {
        navigate("/checkout");
      } else {
        console.error("Failed to add to cart for Buy Now");
      }
    } catch (error) {
      console.error("Failed to add to cart for Buy Now:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!currentProduct || !selectedColor || !selectedSize) return;

    setAddingToCart(true);

    try {
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || "";

      const result = await addToCartHandler(
        currentProduct,
        quantity,
        selectedColor.colorName,
        selectedSize,
        selectedImage
      );

      if (result.success) {
        console.log("Added to cart successfully");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!currentProduct) return;

    setAddingToWishlist(true);

    try {
      if (isInWishlist) {
        await removeFromWishlist(currentProduct._id);
      } else {
        const productForWishlist = {
          _id: currentProduct._id,
          id: currentProduct._id,
          name: currentProduct.name,
          brand: currentProduct.name,
          price: currentProduct.price,
          originalPrice: currentProduct.originalPrice,
          image: selectedColor?.images?.[0] || currentProduct.images?.[0] || "",
          images: currentProduct.images || [],
          description: currentProduct.description,
        };

        await addToWishlist(
          productForWishlist,
          selectedSize,              // Now passing "38"
          selectedColor?.colorName,  // Now passing "Blue"
          selectedColor?.colorHex,   // Now passing the hex color
          currentImage               // Now passing the image
        );
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Handle color selection
  const handleColorChange = (colorIndex) => {
    setSelectedColorIndex(colorIndex);
    setCurrentImageIndex(0);
  };

  // Similar products carousel
  const nextSimilarProducts = () => {
    if (similarProductsIndex < similarProducts.length - itemsPerPage) {
      setSimilarProductsIndex((prev) => prev + 1);
    }
  };

  const prevSimilarProducts = () => {
    if (similarProductsIndex > 0) {
      setSimilarProductsIndex((prev) => prev - 1);
    }
  };

  // Handle size chart modal toggle
  const handleSizeChartToggle = () => {
    setIsSizeChartOpen(!isSizeChartOpen);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeChartModalRef.current && !sizeChartModalRef.current.contains(event.target)) {
        setIsSizeChartOpen(false);
      }
    };

    if (isSizeChartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSizeChartOpen]);

  // Helper components
  const ColorCircle = ({ color, size = "w-4 h-4", isSelected = false }) => {
    const colorValue = color.colorHex || "#CCCCCC";

    return (
      <div
        className={`${size} rounded-full border-2 flex-shrink-0 ${
          isSelected ? "border-gray-800" : "border-gray-300"
        }`}
        style={{
          backgroundColor: colorValue,
        }}
        title={color.colorName}
      />
    );
  };

  const SimilarProductCard = ({ product }) => {
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const currentColor = product.colors?.[currentColorIndex];
    const currentImage = currentColor?.images?.[currentImageIndex];

    const productCategoryName = getCategoryNameById(product.category);

    const handleProductClick = () => {
      navigate(`/product/${product._id}`);
      window.scrollTo({ top: 30, behavior: "smooth" });
    };

    const handleColorChange = (colorIndex) => {
      setCurrentColorIndex(colorIndex);
      setCurrentImageIndex(0);
    };

    return (
      <div
        className="product-card bg-[#f9e2e7] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={handleProductClick}
      >
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <img
            src={currentImage || product.colors?.[0]?.images?.[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onMouseEnter={() => {
              if (currentColor?.images?.length > 1) {
                setCurrentImageIndex(1);
              }
            }}
            onMouseLeave={() => setCurrentImageIndex(0)}
          />
        </div>

        <div className="p-3">
          {productCategoryName && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {productCategoryName}
              </span>
            </div>
          )}

          <h3 className="text-gray-900 font-medium mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading screen
  if (loading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-20 w-20 border-b-2 border-pink-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error || productError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-4">{error || productError}</p>
          <button
            onClick={() => dispatch(getProductById(productId))}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!currentProduct && !loading && !productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const discount = currentProduct.originalPrice
    ? Math.round(
        ((currentProduct.originalPrice - currentProduct.price) /
          currentProduct.originalPrice) *
          100
      )
    : 0;

  // Filter similar products (exclude current product)
  const filteredSimilarProducts = similarProducts.filter(
    (product) => product._id !== currentProduct._id
  );

  // Get current images based on selected color
  const currentImages = selectedColor?.images || [];
  const currentImage = currentImages[currentImageIndex] || currentImages[0] || "";

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleMouseLeave = () => {
    setZoomOrigin({ x: 50, y: 50 });
  };

  return (
    <>
    
            {isSizeChartOpen && currentProduct.sizeChart && (
              <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                <div
                  ref={sizeChartModalRef}
                  className="relative bg-[#f9e2e7] rounded-lg w-full h-full sm:max-w-[90vw] sm:max-h-[90vh] sm:m-4 flex items-center justify-center p-4"
                >
                  <button
                    onClick={handleSizeChartToggle}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
                    aria-label="Close size chart"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <img
                    src={currentProduct.sizeChart}
                    alt="Size Chart"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}
    <div className="min-h-screen bg-gray-50">
      <section
        ref={sectionRef}
        className="container mx-auto px-4 md:px-6 lg:px-12 py-8 md:py-12"
      >
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm">
          <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; {currentProduct.name}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left: Images */}
          <div className="order-1 lg:order-1">
            {/* Desktop Layout - Thumbnails on left */}
            <div className="hidden lg:flex gap-4">
              <div className="flex flex-col gap-2 w-24">
                {currentImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`border-2 ${
                      currentImageIndex === idx ? "border-gray-800" : "border-gray-200"
                    } rounded-lg overflow-hidden relative`}
                  >
                    {!loadedImages[img] && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className={`w-full h-32 object-cover transition-opacity duration-300 ${loadedImages[img] ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => ({...prev, [img]: true}))}
                    />
                    {idx === 3 && currentImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center rounded-lg text-white text-lg font-medium">
                        +{currentImages.length - 4}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div
                className="relative flex-1 overflow-hidden rounded-lg"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {!loadedImages[currentImage] && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}
                <img
                  src={currentImage || ""}
                  alt={`${currentProduct.name} - ${selectedColor?.colorName}`}
                  className={`w-full h-[690px] object-cover transition-transform duration-300 hover:scale-125 cursor-zoom-in transition-opacity duration-300 ${loadedImages[currentImage] ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  onLoad={() => setLoadedImages(prev => ({...prev, [currentImage]: true}))}
                  style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                />

                {/* Desktop arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-pink-500 text-gray-800 hover:text-white transition-all duration-200 p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-pink-500 text-gray-800 hover:text-white transition-all duration-200 p-2 rounded-full shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className="lg:hidden">
              <div
                className="w-full mb-4 relative overflow-hidden rounded-lg"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {!loadedImages[currentImage] && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}
                <img
                  src={currentImage || ""}
                  alt={`${currentProduct.name} - ${selectedColor?.colorName}`}
                  className={`w-full h-[460px] md:h-[500px] object-cover transition-transform duration-300 hover:scale-125 cursor-zoom-in transition-opacity duration-300 ${loadedImages[currentImage] ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  onLoad={() => setLoadedImages(prev => ({...prev, [currentImage]: true}))}
                  style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                />

                {/* Mobile arrows centered below main image */}
                {currentImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="bg-white/90 hover:bg-pink-500 text-gray-700 hover:text-white p-2 rounded-full transition-all duration-200 shadow-md"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="bg-white/90 hover:bg-pink-500 text-gray-700 hover:text-white p-2 rounded-full transition-all duration-200 shadow-md"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center px-2">
                {currentImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`border-2 ${
                      currentImageIndex === idx
                        ? "border-gray-800"
                        : "border-gray-200"
                    } rounded-lg overflow-hidden flex-shrink-0 relative`}
                  >
                    {!loadedImages[img] && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className={`w-16 h-20 sm:w-20 sm:h-24 object-cover transition-opacity duration-300 ${loadedImages[img] ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => ({...prev, [img]: true}))}
                    />
                    {idx === 3 && currentImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center rounded-lg text-white text-sm font-medium">
                        +{currentImages.length - 4}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="order-2 lg:order-2 space-y-4 lg:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {currentProduct.name}
            </h2>

            {currentProduct.subheading && (
              <p className="text-lg text-gray-600 font-bold">
                {currentProduct.subheading}
              </p>
            )}

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
                {currentProduct.ratings && currentProduct.ratings.length > 0 && (
                  <>
                    <span className="ml-2 text-sm text-gray-600">
                      ({currentProduct.ratings.length} review
                      {currentProduct.ratings.length !== 1 ? "s" : ""})
                    </span>
                    <span className="text-sm text-gray-500">
                      {(
                        currentProduct.ratings.reduce(
                          (acc, rating) => acc + (rating.rating || rating),
                          0
                        ) / currentProduct.ratings.length
                      ).toFixed(1)}{" "}
                      out of 5
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xl md:text-2xl font-bold">
                ₹{currentProduct.price}
              </p>
              {currentProduct.originalPrice && (
                <p className="text-lg md:text-xl text-gray-500 line-through">
                  ₹{currentProduct.originalPrice}
                </p>
              )}
              {discount > 0 && (
                <span className="bg-pink-500 text-white text-sm px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            {currentProduct.description && (
              <p className="text-gray-600 text-sm md:text-base">
                {currentProduct.description}
              </p>
            )}

            {currentProduct.colors && currentProduct.colors.length > 0 && (
              <div>
                <p className="font-bold mb-2 text-sm md:text-base ">
                  Color: {selectedColor?.colorName}
                </p>
              </div>
            )}

            {selectedColor?.sizeStock && selectedColor.sizeStock.length > 0 && (
              <div>
                <p className="font-bold mb-2 text-sm md:text-base">
                  Size: {selectedSize}
                </p>
                {sizesLoading ? (
                  <div className="text-sm text-gray-500">Loading sizes...</div>
                ) : (
                  <div className="flex gap-2 md:gap-3 flex-wrap ">
                    {selectedColor.sizeStock.map((sizeObj, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(sizeObj.size)}
                        disabled={sizeObj.stock === 0}
                        className={`px-3 py-2 md:px-4 md:py-2 border-2 font-medium text-sm md:text-base rounded-md ${
                          selectedSize === sizeObj.size
                            ? "bg-pink-600 text-white border-pink-600"
                            : sizeObj.stock === 0
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-white text-black border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {sizeObj.size.toUpperCase()}
                        {sizeObj.stock === 0 && (
                          <span className="block text-xs">Out of Stock</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Size Chart Button */}
            {currentProduct.sizeChart && (
              <div>
                <button
                  onClick={handleSizeChartToggle}
                  className="text-pink-600 hover:text-pink-700 text-sm underline focus:outline-none"
                >
                  View Size Chart
                </button>
              </div>
            )}

            

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
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
                  className="flex-1 bg-black text-white py-3 px-4 md:px-6 hover:bg-gray-800 rounded text-sm md:text-base disabled:bg-gray-400"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor || addingToCart}
                >
                  {addingToCart ? "Adding..." : "Add To Cart"}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={addingToWishlist}
                  className={`p-3 border rounded-full transition ${
                    isInWishlist
                      ? "bg-pink-100 border-pink-400 text-pink-600"
                      : "border-gray-300 hover:bg-gray-100"
                  } ${addingToWishlist ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
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
              className="w-full bg-pink-600 text-white py-3 rounded hover:bg-pink-700 text-sm md:text-base disabled:bg-gray-400"
              disabled={!selectedSize || !selectedColor || addingToCart}
            >
              {addingToCart ? "Processing..." : "Buy It Now"}
            </button>
          </div>
        </div>

        {currentProduct.specifications && currentProduct.specifications.length > 0 && (
          <div className="mt-6 lg:mt-12">
            <table className="w-full border-collapse bg-[#f9e2e7] rounded-lg overflow-hidden">
              <tbody>
                {[...currentProduct.specifications]
                  .sort((a, b) => a.order - b.order)
                  .map((spec, index) => (
                    <tr 
                      key={spec._id} 
                      className="bg-[#f9e2e7]"
                    >
                      <td className="py-3 px-4 " style={{ width: '180px' }}>
                        <div className="font-semibold text-base text-gray-800 align-top">{spec.label}</div>
                        <div className="sm:hidden text-base text-gray-700">{spec.description}</div>
                      </td>
                      <td className="hidden sm:flex py-3 px-4 text-base text-gray-700">
                        {spec.description}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {filteredSimilarProducts.length > 0 && (
        <section
          ref={similarProductsRef}
          className="similar-products-section py-8 md:py-12 bg-gray-50"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-12">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
              Similar Products
            </h2>
            <div className="relative">
              {filteredSimilarProducts.length > itemsPerPage && (
                <>
                  <button
                    onClick={prevSimilarProducts}
                    disabled={similarProductsIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-10 h-10 md:w-fit md:px-2 md:h-14 bg-pink-200 hover:bg-pink-300 disabled:bg-gray-300 rounded-sm md:rounded-md -translate-x-3 md:translate-x-0"
                  >
                    <ChevronLeft className="text-white w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSimilarProducts}
                    disabled={
                      similarProductsIndex >=
                      filteredSimilarProducts.length - itemsPerPage
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 lg:w-10 h-10 md:w-fit md:px-2 md:h-14 bg-pink-200 hover:bg-pink-300 disabled:bg-gray-300 rounded-sm md:rounded-md translate-x-3 md:translate-x-0"
                  >
                    <ChevronRight className="text-white w-5 h-5" />
                  </button>
                </>
              )}
              <div
                className={
                  filteredSimilarProducts.length > itemsPerPage
                    ? "mx-4 lg:mx-12 md:mx-12"
                    : ""
                }
              >
                <div
                  className={`grid gap-4 md:gap-6 ${
                    itemsPerPage === 2
                      ? "grid-cols-2"
                      : itemsPerPage === 3
                      ? "grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
                  {filteredSimilarProducts
                    .slice(
                      similarProductsIndex,
                      similarProductsIndex + itemsPerPage
                    )
                    .map((product) => (
                      <SimilarProductCard key={product._id} product={product} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
    </>    
  );
};

export default ProductDetail;