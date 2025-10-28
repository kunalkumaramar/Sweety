// src/components/Products.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { gsap } from "gsap";
import {
  getAllProducts,
  searchProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  clearSearchResults,
  setSearchQuery,
} from "../Redux/slices/productsSlice";
import { getCategories, getCategoryById } from "../Redux/slices/categorySlice";
import {
  getSubcategoriesByCategory,
  getSubcategoryById,
} from "../Redux/slices/subcategorySlice";

const Products = ({
  category: propCategory,
  subcategory: propSubcategory,
  title: propTitle,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { category: urlCategory, subcategory: urlSubcategory } = useParams();
  const location = useLocation();

  // Redux state
  const {
    products,
    page,
    pages,
    searchResults,
    searchPage,
    searchPages,
    searchQuery,
    loading,
    searchLoading,
    error,
    searchError,
  } = useSelector((state) => state.products);

  const {
    categories,
    currentCategory,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories);

  const {
    subcategories,
    currentSubcategory,
  } = useSelector((state) => state.subcategories);

  const currentCategoryName = propCategory || urlCategory;
  const currentSubcategoryName = propSubcategory || urlSubcategory;

  // Find category and subcategory by name/slug
  const categoryConfig = categories.find(
    (cat) =>
      cat.name.toLowerCase().replace(/\s+/g, "-") === currentCategoryName ||
      cat._id === currentCategoryName
  );

  const subcategoryConfig = subcategories.find(
    (sub) =>
      sub.name?.toLowerCase().replace(/\s+/g, "-") === currentSubcategoryName ||
      sub._id === currentSubcategoryName
  );

  const pageTitle =
    propTitle ||
    (subcategoryConfig ? subcategoryConfig.name : categoryConfig?.name) ||
    `${currentCategoryName} Collection`;

  const [filters, setFilters] = useState({
    color: "",
    size: "",
    priceRange: "",
    tags: "",
  });
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const itemsPerPage = 8;

  // Get current products based on mode
  const currentProducts = isSearchMode ? searchResults : products;
 
  const currentPageNum = isSearchMode ? searchPage : page;
  const currentTotalPages = isSearchMode ? searchPages : pages;
  const isLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !categories || categories.length === 0) return "";
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "";
  };

  // Image optimization helper
  const optimizeImage = (url, width = 1920) => {
    if (!url) return url;
    return url.replace(
      '/upload/',
      `/upload/f_webp,q_auto:eco,w_${width}/`
    );
  };

  // Load categories on component mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(getCategories());
    }
  }, [dispatch, categories.length]);

  // Load category details when category changes
  useEffect(() => {
    if (currentCategoryName && categoryConfig?._id && !currentCategory) {
      dispatch(getCategoryById(categoryConfig._id));
    }
  }, [dispatch, currentCategoryName, categoryConfig, currentCategory]);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryConfig?._id) {
      dispatch(getSubcategoriesByCategory(categoryConfig._id));
    }
  }, [dispatch, categoryConfig]);

  // Load subcategory details when subcategory changes
  useEffect(() => {
    if (
      currentSubcategoryName &&
      subcategoryConfig?._id &&
      !currentSubcategory
    ) {
      dispatch(getSubcategoryById(subcategoryConfig._id));
    }
  }, [dispatch, currentSubcategoryName, subcategoryConfig, currentSubcategory]);

  // Check for search query in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get("search") || urlParams.get("q");

    if (query) {
      setIsSearchMode(true);
      dispatch(setSearchQuery(query));
      dispatch(searchProducts({ query, page: 1, limit: itemsPerPage }));
    } else {
      setIsSearchMode(false);
      dispatch(clearSearchResults());
    }
  }, [location.search, dispatch]);

  // Load products when component mounts or category changes
  useEffect(() => {
    if (!isSearchMode) {
      if (subcategoryConfig?._id) {
        // If we have a subcategory ID, get products by subcategory
        dispatch(
          getProductsBySubcategory({
            subcategoryId: subcategoryConfig._id,
            page: currentPage,
            limit: itemsPerPage,
            isActive: true,
          })
        );
      } else if (categoryConfig?._id) {
        // If we have a category ID, get products by category
        dispatch(
          getProductsByCategory({
            categoryId: categoryConfig._id,
            page: currentPage,
            limit: itemsPerPage,
          })
        );
      } else if (!currentCategoryName || currentCategoryName === "all") {
        // Get all products
        dispatch(getAllProducts({ page: currentPage, limit: itemsPerPage }));
      }
    }
  }, [
    dispatch,
    categoryConfig,
    subcategoryConfig,
    currentCategoryName,
    currentPage,
    isSearchMode,
    itemsPerPage,
  ]);

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      color: "",
      size: "",
      priceRange: "",
      tags: "",
    });
    setCurrentPage(1);
  }, [currentCategoryName, currentSubcategoryName]);

  // GSAP animations
  useEffect(() => {
    if (!isLoading && currentProducts.length > 0) {
      gsap.fromTo(
        ".product-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );

      const productCards = document.querySelectorAll(".product-card");
      productCards.forEach((card) => {
        const handleMouseEnter = () => {
          gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out" });
        };
        const handleMouseLeave = () => {
          gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
        };

        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);

        // Cleanup
        return () => {
          card.removeEventListener("mouseenter", handleMouseEnter);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    }
  }, [currentProducts, isLoading]);

  // Get unique filter values from current products
  const getUniqueValues = (key) => {
    if (!currentProducts || currentProducts.length === 0) return [];

    const values = currentProducts
  .map((product) => {
    switch (key) {
      case "colors":
        return product.colors?.map((color) => color.colorName) || [];

      case "sizes": {
        // ✅ Wrapped in braces to allow const declarations
        const allSizes = [];
        product.colors?.forEach((color) => {
          color.sizeStock?.forEach((sizeObj) => {
            if (sizeObj.stock > 0) {
              allSizes.push(sizeObj.size);
            }
          });
        });
        return allSizes;
      }

      case "tags":
        return product.tags || [];

      default:
        return product[key];
    }
  })
  .flat()
  .filter(Boolean);

return [...new Set(values)];

  };

  // Filter and sort products locally
  const filteredProducts = React.useMemo(() => {
    let filtered = [...currentProducts];

    // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
  if (value) {
    switch (key) {
      case "color":
        filtered = filtered.filter((product) =>
          product.colors?.some((color) =>
            color.colorName.toLowerCase().includes(value.toLowerCase())
          )
        );
        break;

      case "size":
        filtered = filtered.filter((product) =>
          product.colors?.some((color) =>
            color.sizeStock?.some(
              (sizeObj) =>
                sizeObj.size.toLowerCase() === value.toLowerCase() &&
                sizeObj.stock > 0
            )
          )
        );
        break;

      case "tags":
        filtered = filtered.filter((product) =>
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(value.toLowerCase())
          )
        );
        break;

      case "priceRange": {
        const [min, max] = value.split("-").map(Number);
        filtered = filtered.filter((product) => {
          const price = product.price;
          return price >= min && (max ? price <= max : true);
        });
        break;
      }

      default:
        filtered = filtered.filter(
          (product) =>
            product[key] &&
            product[key].toLowerCase().includes(value.toLowerCase())
        );
    }
  }
});


    // Apply sorting
    switch (sortBy) {
      case "Price: Low to High":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Newest First":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  }, [currentProducts, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= currentTotalPages) {
      setCurrentPage(newPage);

      if (isSearchMode) {
        dispatch(
          searchProducts({
            query: searchQuery,
            page: newPage,
            limit: itemsPerPage,
          })
        );
      } else if (subcategoryConfig?._id) {
        dispatch(
          getProductsBySubcategory({
            subcategoryId: subcategoryConfig._id,
            page: newPage,
            limit: itemsPerPage,
            isActive: true,
          })
        );
      } else if (categoryConfig?._id) {
        dispatch(
          getProductsByCategory({
            categoryId: categoryConfig._id,
            page: newPage,
            limit: itemsPerPage,
          })
        );
      } else {
        dispatch(
          getAllProducts({
            page: newPage,
            limit: itemsPerPage,
          })
        );
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

 

  // Helper function to generate category path
  const getCategoryPath = (category) => {
    if (!category) return "/products";
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
    return `/products/${categorySlug}`;
  };

  if (isLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (currentError || categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {currentError || categoriesError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="relative flex-1 min-w-[100px] sm:min-w-[120px]">
      <select
        className={`appearance-none bg-white px-2 sm:px-4 py-2 pr-5 sm:pr-7 focus:outline-none w-full text-xs sm:text-base transition-colors ${
          value ? "text-pink-600" : "text-gray-700"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-2 text-gray-700">
        <svg
          className="fill-current h-3 w-3 sm:h-4 sm:w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );

  const ColorCircle = ({ color, size = "w-6 h-6", isSelected = false }) => {
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

  const ProductCard = ({ product }) => {
    const [currentColorIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const currentColor = product.colors?.[currentColorIndex];
    const currentImage = currentColor?.images?.[currentImageIndex];

    // Get category name for this product
    const productCategoryName = getCategoryNameById(product.category);

    const handleProductClick = () => {
      navigate(`/product/${product._id}`);
      window.scrollTo({ top: 30, behavior: "smooth" });
    };

 

    return (
      <div
        className="product-card bg-[#f9e2e7] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={handleProductClick}
      >
        {/* Clean Product Image - No Overlays */}
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <img
            src={optimizeImage(currentImage || product.colors?.[0]?.images?.[0])}
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
          {/* 1. Available Colors Display */}
          {/* <div className="flex items-center gap-1 mb-2">
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
          </div> */}

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

  const Pagination = () => {
    const handlePageChangeLocal = (newPage) => {
      handlePageChange(newPage);
    };

    const getVisiblePages = () => {
      const delta = 1;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPageNum - delta);
        i <= Math.min(currentTotalPages - 1, currentPageNum + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPageNum - delta > 2) {
        rangeWithDots.push(1, "...");
      } else if (currentTotalPages > 1) {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPageNum + delta < currentTotalPages - 1) {
        rangeWithDots.push("...", currentTotalPages);
      } else if (
        currentTotalPages > 1 &&
        !rangeWithDots.includes(currentTotalPages)
      ) {
        rangeWithDots.push(currentTotalPages);
      }

      return rangeWithDots;
    };

    if (currentTotalPages <= 1) return null;

    return (
      <div
        className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12 font-bold"
        style={{ fontFamily: "Montserrat" }}
      >
        <button
          onClick={() => handlePageChangeLocal(currentPageNum - 1)}
          disabled={currentPageNum === 1}
          className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-950 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {getVisiblePages().map((pageNum, index) => (
          <div key={index}>
            {pageNum === "..." ? (
              <span className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-500">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChangeLocal(pageNum)}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base border rounded-xl transition-all ${
                  currentPageNum === pageNum
                    ? "border-gray-900 bg-white text-gray-900 transform -translate-y-1 shadow-md"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-500 hover:text-gray-900"
                }`}
              >
                {pageNum}
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => handlePageChangeLocal(currentPageNum + 1)}
          disabled={currentPageNum === currentTotalPages}
          className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-950 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
            {isSearchMode ? (
              <span className="text-gray-900 font-medium">
                Search Results for "{searchQuery}"
              </span>
            ) : (
              <>
                <Link
                  to={getCategoryPath(categoryConfig)}
                  className="hover:text-pink-600 transition-colors"
                >
                  {categoryConfig?.name || currentCategoryName || "Products"}
                </Link>
                {currentSubcategoryName && subcategoryConfig && (
                  <>
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
                    <span className="text-gray-900 font-medium">
                      {subcategoryConfig.name || currentSubcategoryName}
                    </span>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-pink-600 mb-1">
            {isSearchMode ? `Search Results for "${searchQuery}"` : pageTitle}
          </h1>
          {subcategoryConfig?.description && (
            <p className="text-pink-600 text-sm mt-2">
              {subcategoryConfig.description}
            </p>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile Filters */}
          <div className="block md:hidden">
            <span className="font-bold text-lg text-pink-600 block mb-2">
              FILTERS
            </span>
            <div className="bg-white rounded-[20px] border-2 border-[#f06292] flex-1 p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* <FilterDropdown
                  label="Color"
                  options={getUniqueValues("colors")}
                  value={filters.color}
                  onChange={(value) => handleFilterChange("color", value)}
                /> */}
                <FilterDropdown
                  label="Size"
                  options={getUniqueValues("sizes")}
                  value={filters.size}
                  onChange={(value) => handleFilterChange("size", value)}
                />
                {/*<FilterDropdown
                  label="Tags"
                  options={getUniqueValues("tags")}
                  value={filters.tags}
                  onChange={(value) => handleFilterChange("tags", value)}
                />*/}
                <FilterDropdown
                  label="Price Range"
                  options={[
                    "0-500",
                    "500-1000",
                    "1000-2000",
                    "2000-5000",
                    "5000+",
                  ]}
                  value={filters.priceRange}
                  onChange={(value) => handleFilterChange("priceRange", value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-700 text-sm font-medium">SORT BY</span>
              <div className="relative border-[#f06292] border-2 rounded-[20px]">
                <select
                  className={`appearance-none text-center bg-[#f2e9e2] rounded-[20px] px-3 py-1 pr-6 text-sm transition-colors ${
                    sortBy !== "Recommended" ? "text-pink-600" : "text-gray-700"
                  }`}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Newest First">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="flex items-center">
              <span className="font-bold text-l lg:text-2xl pr-212 text-pink-600">
                FILTERS
              </span>
              <div className="bg-white rounded-[20px] border-2 border-[#f06292] flex-1">
                <div className="flex justify-evenly flex-wrap gap-2 bg-white rounded-[20px] p-3">
                  {/* <FilterDropdown
                    label="Color"
                    options={getUniqueValues("colors")}
                    value={filters.color}
                    onChange={(value) => handleFilterChange("color", value)}
                  /> */}
                  <FilterDropdown
                    label="Size"
                    options={getUniqueValues("sizes")}
                    value={filters.size}
                    onChange={(value) => handleFilterChange("size", value)}
                  />
                  {/*<FilterDropdown
                    label="Tags"
                    options={getUniqueValues("tags")}
                    value={filters.tags}
                    onChange={(value) => handleFilterChange("tags", value)}
                  />*/}
                  <FilterDropdown
                    label="Price Range"
                    options={[
                      "0-500",
                      "500-1000",
                      "1000-2000",
                      "2000-5000",
                      "5000+",
                    ]}
                    value={filters.priceRange}
                    onChange={(value) =>
                      handleFilterChange("priceRange", value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 text-sm lg:text-base">
                  SORT BY
                </span>
                <div className="relative border-[#f06292] border-2 rounded-[20px]">
                  <select
                    className={`appearance-none text-center bg-[#f2e9e2] rounded-[20px] px-4 py-2 pr-8 transition-colors ${
                      sortBy !== "Recommended"
                        ? "text-pink-600"
                        : "text-gray-700"
                    }`}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Price: Low to High">
                      Price: Low to High
                    </option>
                    <option value="Price: High to Low">
                      Price: High to Low
                    </option>
                    <option value="Newest First">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* No products message */}
        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-24 w-24 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or check back later for new arrivals.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    color: "",
                    size: "",
                    priceRange: "",
                    tags: "",
                  });
                  if (isSearchMode) {
                    navigate("/products");
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors duration-200 mr-2"
              >
                {isSearchMode ? "View All Products" : "Clear Filters"}
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination />
      </div>
    </div>
  );
};

export default Products;