// ProductDetail.jsx
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

  // Refs
  const sectionRef = useRef(null);
  const similarProductsRef = useRef(null);

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

  // Animate product details + similar products - Fixed GSAP targets
  useEffect(() => {
    if (!loading && !productLoading && currentProduct) {
      // Use refs to ensure elements exist
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }

      // Add a delay to ensure similar products section is rendered
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

  // Handle Buy It Now - Add to cart and navigate to checkout
  const handleBuyNow = async () => {
    if (!currentProduct || !selectedColor || !selectedSize) return;

    setAddingToCart(true);

    try {
      // Get current selected image
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || "";

      // Use the cart context to add to cart
      const result = await addToCartHandler(
        currentProduct,
        quantity,
        selectedColor.colorName,
        selectedSize,
        selectedImage
      );

      if (result.success) {
        // Navigate to checkout after successfully adding to cart
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

  // Handle add to cart with new API
  const handleAddToCart = async () => {
    if (!currentProduct || !selectedColor || !selectedSize) return;

    setAddingToCart(true);

    try {
      // Get current selected image
      const currentImages = selectedColor?.images || [];
      const selectedImage =
        currentImages[currentImageIndex] || currentImages[0] || "";

      // Use the cart context to add to cart
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

  // Handle wishlist toggle with new API
  const handleWishlistToggle = async () => {
    if (!currentProduct) return;

    setAddingToWishlist(true);

    try {
      if (isInWishlist) {
        await removeFromWishlist(currentProduct._id);
      } else {
        // Transform product for wishlist
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

        await addToWishlist(productForWishlist);
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
    setCurrentImageIndex(0); // Reset to first image of selected color
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

  // Helper components
  const ColorCircle = ({ color, size = "w-4 h-4", isSelected = false }) => {
    // Use colorHex if available, otherwise default to a neutral color
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

  // Fixed SimilarProductCard component
  const SimilarProductCard = ({ product }) => {
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const currentColor = product.colors?.[currentColorIndex];
    const currentImage = currentColor?.images?.[currentImageIndex];

    // Use the helper function that's defined in the parent component scope
    const productCategoryName = getCategoryNameById(product.category);

    const handleProductClick = () => {
      navigate(`/product/${product._id}`);
      window.scrollTo({ top: 30, behavior: "smooth" });
    };

    const handleColorChange = (colorIndex) => {
      setCurrentColorIndex(colorIndex);
      setCurrentImageIndex(0); // Reset image index when color changes
    };

    return (
      <div
        className="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={handleProductClick}
      >
        {/* Clean Product Image - No Overlays */}
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          <img
            src={currentImage || product.colors?.[0]?.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            onMouseEnter={() => {
              if (currentColor?.images?.length > 1) {
                setCurrentImageIndex(1);
              }
            }}
            onMouseLeave={() => setCurrentImageIndex(0)}
          />
        </div>

        <div className="p-3">
          {/* 1. Available Colors Display */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex gap-1">
              {product.colors?.slice(0, 5).map((color, index) => (
                <button
                  key={color._id || index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(index);
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  <ColorCircle
                    color={color}
                    size="w-6 h-6"
                    isSelected={currentColorIndex === index}
                  />
                </button>
              ))}
              {product.colors?.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          </div>

          {/* 2. Category Name */}
          {productCategoryName && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {productCategoryName}
              </span>
            </div>
          )}

          {/* 3. Product Name */}
          <h3 className="text-gray-900 font-medium mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* 4. Price Section */}
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
  const currentImage = currentImages[currentImageIndex] || currentImages[0];

  // Image navigation handlers (safe guards for empty images)
  const handleNextImage = () => {
    if (!currentImages || currentImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrevImage = () => {
    if (!currentImages || currentImages.length <= 1) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );
  };

  // Get breadcrumb data
  const breadcrumbData = getBreadcrumbData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <svg
              className="w-4 h-4"
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

            {breadcrumbData?.categoryName && (
              <>
                <Link
                  to={`/products/${breadcrumbData.categorySlug}`}
                  className="hover:text-pink-600 transition-colors"
                >
                  {breadcrumbData.categoryName}
                </Link>
                <svg
                  className="w-4 h-4"
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
              </>
            )}

            {breadcrumbData?.subcategoryName && (
              <>
                <Link
                  to={`/products/${breadcrumbData.categorySlug}/${breadcrumbData.subcategorySlug}`}
                  className="hover:text-pink-600 transition-colors"
                >
                  {breadcrumbData.subcategoryName}
                </Link>
                <svg
                  className="w-4 h-4"
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
              </>
            )}

            <span className="text-gray-900 font-medium truncate">
              {currentProduct.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section
        ref={sectionRef}
        className="product-detail-section py-6 md:py-12 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left: Images */}
          <div className="order-1 lg:order-1">
            {/* Desktop Layout - Side by side */}
            <div className="hidden lg:flex gap-4">
              <div className="flex-1 relative">
                <img
                  src={currentImage || ""}
                  alt={`${currentProduct.name} - ${selectedColor?.colorName}`}
                  className="w-full h-[600px] object-cover rounded-lg"
                />

                {/* Desktop arrows: circular buttons centered vertically */}
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

              <div className="flex flex-col gap-2 w-28">
                {currentImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`border-2 ${
                      currentImageIndex === idx
                        ? "border-gray-800"
                        : "border-gray-200"
                    } rounded-lg overflow-hidden relative`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-[142px] object-cover"
                    />
                    {idx === 3 && currentImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center rounded-lg text-white text-lg font-medium">
                        +{currentImages.length - 4}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className="lg:hidden">
              <div className="w-full mb-4 relative">
                <img
                  src={currentImage || ""}
                  alt={`${currentProduct.name} - ${selectedColor?.colorName}`}
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
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

              {/* Thumbnails - show up to 4; last thumbnail shows +N if more */}
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
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover"
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

            {/* Reviews Summary */}
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

            {/* Colors */}
            {currentProduct.colors && currentProduct.colors.length > 0 && (
              <div>
                <p className="font-bold mb-2 text-sm md:text-base ">
                  Color: {selectedColor?.colorName}
                </p>
                <div className="flex gap-2 md:gap-3 flex-wrap ">
                  {currentProduct.colors.map((color, idx) => (
                    <button
                      key={color._id}
                      onClick={() => handleColorChange(idx)}
                      className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center p-1 ${
                        selectedColorIndex === idx
                          ? "border-black"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <ColorCircle
                        color={color}
                        size="w-8 h-8 md:w-10 md:h-10"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
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

            {/* Size Chart Link */}
            {currentProduct.sizeChart && (
              <div>
                <a
                  href={currentProduct.sizeChart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 text-sm underline"
                >
                  View Size Chart
                </a>
              </div>
            )}

            {/* Quantity + Cart */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex items-center border-2 rounded w-fit bg-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2  hover:bg-gray-100"
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
      </section>

      {/* Similar Products */}
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
  );
};

export default ProductDetail;
