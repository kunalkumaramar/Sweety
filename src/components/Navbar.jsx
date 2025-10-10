import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { 
  searchProducts, 
  setSearchQuery, 
  clearSearchResults 
} from '../Redux/slices/productsSlice';
import { 
  searchCategories,
  getCategories 
} from '../Redux/slices/categorySlice';
import { 
  getAllSubcategories,
  searchSubcategories 
} from '../Redux/slices/subcategorySlice';
import Logo from "/LOGO.png";
import WavyBg from "/wavy-bg.png";
import Banner from "../components/Banner";
import SignIn from "../pages/SignIn";
import { useCart } from "./CartContext";

const Navbar = () => {
  // State management
  const [searchQuery, setSearchQueryState] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('products');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  
  // Redux state
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { cartItems } = useCart();
  const { count: wishlistCount } = useSelector(state => state.wishlist);
  
  // Refs
  const searchRef = useRef(null);
  
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { 
    searchResults: productResults, 
    searchLoading: productLoading 
  } = useSelector(state => state.products);
  
  const { 
    categories,
    searchResults: categoryResults, 
    searchLoading: categoryLoading 
  } = useSelector(state => state.categories);
  
  const { 
    subcategories,
    searchResults: subcategoryResults, 
    searchLoading: subcategoryLoading 
  } = useSelector(state => state.subcategories);

  const SearchResultsDropdown = () => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveSearchTab('products')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeSearchTab === 'products'
              ? 'text-pink-600 border-b-2 border-pink-600 bg-white'
              : 'text-gray-600 hover:text-pink-600'
          }`}
        >
          Products {productResults.length > 0 && `(${productResults.length})`}
        </button>
        <button
          onClick={() => setActiveSearchTab('categories')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeSearchTab === 'categories'
              ? 'text-pink-600 border-b-2 border-pink-600 bg-white'
              : 'text-gray-600 hover:text-pink-600'
          }`}
        >
          Categories {categoryResults.length > 0 && `(${categoryResults.length})`}
        </button>
        <button
          onClick={() => setActiveSearchTab('subcategories')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeSearchTab === 'subcategories'
              ? 'text-pink-600 border-b-2 border-pink-600 bg-white'
              : 'text-gray-600 hover:text-pink-600'
          }`}
        >
          Subcategories {subcategoryResults.length > 0 && `(${subcategoryResults.length})`}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-2">
        {isSearchLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : !hasSearchResults ? (
          <div className="text-center py-8 text-gray-500">
            <p>No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <>
            {/* Products Tab */}
            {activeSearchTab === 'products' && (
              <div className="space-y-2">
                {productResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Categories Tab */}
            {activeSearchTab === 'categories' && (
              <div className="space-y-2">
                {categoryResults.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center">
                      <span className="text-pink-600 font-semibold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{category.name}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Subcategories Tab */}
            {activeSearchTab === 'subcategories' && (
              <div className="space-y-2">
                {subcategoryResults.map((subcategory) => {
                  const category = categories.find(
                    cat => cat._id === subcategory.category || cat._id === subcategory.category?._id
                  );
                  return (
                    <button
                      key={subcategory._id}
                      onClick={() => handleSubcategoryClick(subcategory, category)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {subcategory.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">{subcategory.name}</p>
                        {category && (
                          <p className="text-xs text-gray-500">{category.name}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* View All Results Button */}
            <button
              onClick={handleViewAllResults}
              className="w-full mt-4 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              View All Results
            </button>
          </>
        )}
      </div>
    </div>
  );
};

  // Load categories and subcategories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(getCategories());
    }
    if (subcategories.length === 0) {
      dispatch(getAllSubcategories());
    }
  }, [dispatch, categories.length, subcategories.length]);

  // Map subcategories to categories
  const categoriesWithSubcategories = React.useMemo(() => {
    return categories.map(category => ({
      ...category,
      subcategories: subcategories.filter(sub => 
        sub.category === category._id || sub.category?._id === category._id
      )
    }));
  }, [categories, subcategories]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        performSearch(searchQuery.trim());
        setIsSearchDropdownOpen(true);
      } else {
        setIsSearchDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = (query) => {
    dispatch(searchProducts({ query, page: 1, limit: 5 }));
    dispatch(searchCategories(query));
    dispatch(searchSubcategories(query));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      dispatch(setSearchQuery(searchQuery.trim()));
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchDropdownOpen(false);
      setSearchQueryState("");
    }
  };

  // Handle search input change
  const handleInputChange = (e) => {
    setSearchQueryState(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQueryState("");
    setIsSearchDropdownOpen(false);
    dispatch(clearSearchResults());
  };

  // Navigation handlers
  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
    setIsSearchDropdownOpen(false);
    setSearchQueryState("");
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = (category) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/${categorySlug}`);
    setIsSearchDropdownOpen(false);
    setSearchQueryState("");
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleSubcategoryClick = (subcategory, category) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    const subcategorySlug = subcategory.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/${categorySlug}/${subcategorySlug}`);
    setIsSearchDropdownOpen(false);
    setSearchQueryState("");
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      dispatch(setSearchQuery(searchQuery.trim()));
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchDropdownOpen(false);
      setSearchQueryState("");
    }
  };

  // Check if current page is active
  const isActivePage = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Helper function to get category path
  const getCategoryPath = (category) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    return `/products/${categorySlug}`;
  };

  // Helper function to get subcategory path
  const getSubcategoryPath = (category, subcategory) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    const subcategorySlug = subcategory.name.toLowerCase().replace(/\s+/g, '-');
    return `/products/${categorySlug}/${subcategorySlug}`;
  };

  // Modal handlers
  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);

  // Search results helpers
  const hasSearchResults = productResults.length > 0 || categoryResults.length > 0 || subcategoryResults.length > 0;
  const isSearchLoading = productLoading || categoryLoading || subcategoryLoading;

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fadeIn" />
      )}

      {/* Desktop Navbar - Individual Grid Layout with Wave Background */}
      <div className="hidden lg:block relative" style={{ height: '130px', width: 'full', margin: '0 auto' }}>
        {/* Wavy PNG Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={WavyBg} 
            alt="" 
            className="w-full h-full object-cover object-center"
            style={{ objectFit: 'cover' }}
          />
        </div>
      
        {/* Content Container - Grid Layout with custom column sizes */}
        <div className="relative z-10 h-full">
          <div className="grid grid-cols-12 gap-2 h-full items-center px-6 pl-31">
            
            {/* Grid 1: Search Bar - 2 columns */}
            <div className="col-span-2 flex items-center justify-start">
              <div className="w-full max-w-[200px] relative" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center bg-white border-2 border-pink-400 rounded-sm px-3 py-2 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200">
                    <svg className="w-5 h-5 text-pink-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={() => searchQuery.length > 2 && setIsSearchDropdownOpen(true)}
                      className="flex-1 text-sm focus:outline-none bg-transparent placeholder-gray-400 min-w-0"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="ml-2 text-gray-400 hover:text-pink-500 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </form>
                {/* Search Dropdown */}
                {isSearchDropdownOpen && searchQuery.length > 2 && <SearchResultsDropdown />}
              </div>
            </div>
      
            {/* Grid 2: First Category (Bras) - 1 column */}
            <div className="col-span-1 flex items-center justify-center">
              {categoriesWithSubcategories[0] && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(categoriesWithSubcategories[0]._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={getCategoryPath(categoriesWithSubcategories[0])}
                    className={`text-base font-bold uppercase transition-colors hover:text-pink-600 whitespace-nowrap ${
                      isActivePage(getCategoryPath(categoriesWithSubcategories[0]))
                        ? "text-pink-600"
                        : "text-gray-700"
                    }`}
                  >
                    {categoriesWithSubcategories[0].name}
                  </Link>
      
                  {/* Subcategories Dropdown */}
                  {categoriesWithSubcategories[0].subcategories && 
                   categoriesWithSubcategories[0].subcategories.length > 0 && 
                   hoveredCategory === categoriesWithSubcategories[0]._id && (
                    <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-48 animate-slideDown">
                      <Link
                        to={getCategoryPath(categoriesWithSubcategories[0])}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-100 font-medium"
                      >
                        All {categoriesWithSubcategories[0].name}
                      </Link>
                      {categoriesWithSubcategories[0].subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          to={getSubcategoryPath(categoriesWithSubcategories[0], subcategory)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
      
            {/* Grid 3: Second Category (Panties) - 1 column */}
            <div className="col-span-1 flex items-center justify-center">
              {categoriesWithSubcategories[1] && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(categoriesWithSubcategories[1]._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={getCategoryPath(categoriesWithSubcategories[1])}
                    className={`text-base font-bold uppercase transition-colors hover:text-pink-600 whitespace-nowrap ${
                      isActivePage(getCategoryPath(categoriesWithSubcategories[1]))
                        ? "text-pink-600"
                        : "text-gray-700"
                    }`}
                  >
                    {categoriesWithSubcategories[1].name}
                  </Link>
      
                  {/* Subcategories Dropdown */}
                  {categoriesWithSubcategories[1].subcategories && 
                   categoriesWithSubcategories[1].subcategories.length > 0 && 
                   hoveredCategory === categoriesWithSubcategories[1]._id && (
                    <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-48 animate-slideDown">
                      <Link
                        to={getCategoryPath(categoriesWithSubcategories[1])}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-100 font-medium"
                      >
                        All {categoriesWithSubcategories[1].name}
                      </Link>
                      {categoriesWithSubcategories[1].subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          to={getSubcategoryPath(categoriesWithSubcategories[1], subcategory)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
      
            {/* Grid 4: Logo - 4 columns (center) */}
            <div className="col-span-3 flex items-center justify-center">
              <Link
                to="/"
                className="block hover:scale-105 transition-transform duration-200"
              >
                <img src={Logo} alt="Sweety Intimate" className="h-30 w-auto" />
              </Link>
            </div>
      
            {/* Grid 5: Third Category (Camisoles) - 1 column */}
            <div className="col-span-1 flex items-center justify-center">
              {categoriesWithSubcategories[2] && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(categoriesWithSubcategories[2]._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={getCategoryPath(categoriesWithSubcategories[2])}
                    className={`text-base font-bold uppercase transition-colors hover:text-pink-600 whitespace-nowrap ${
                      isActivePage(getCategoryPath(categoriesWithSubcategories[2]))
                        ? "text-pink-600"
                        : "text-gray-700"
                    }`}
                  >
                    {categoriesWithSubcategories[2].name}
                  </Link>
      
                  {/* Subcategories Dropdown */}
                  {categoriesWithSubcategories[2].subcategories && 
                   categoriesWithSubcategories[2].subcategories.length > 0 && 
                   hoveredCategory === categoriesWithSubcategories[2]._id && (
                    <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-48 animate-slideDown">
                      <Link
                        to={getCategoryPath(categoriesWithSubcategories[2])}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-100 font-medium"
                      >
                        All {categoriesWithSubcategories[2].name}
                      </Link>
                      {categoriesWithSubcategories[2].subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          to={getSubcategoryPath(categoriesWithSubcategories[2], subcategory)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
      
            {/* Grid 6: Fourth Category (Shorts) - 1 column */}
            <div className="col-span-1 flex items-center justify-center">
              {categoriesWithSubcategories[3] && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(categoriesWithSubcategories[3]._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={getCategoryPath(categoriesWithSubcategories[3])}
                    className={`text-base font-bold uppercase transition-colors hover:text-pink-600 whitespace-nowrap ${
                      isActivePage(getCategoryPath(categoriesWithSubcategories[3]))
                        ? "text-pink-600"
                        : "text-gray-700"
                    }`}
                  >
                    {categoriesWithSubcategories[3].name}
                  </Link>
      
                  {/* Subcategories Dropdown */}
                  {categoriesWithSubcategories[3].subcategories && 
                   categoriesWithSubcategories[3].subcategories.length > 0 && 
                   hoveredCategory === categoriesWithSubcategories[3]._id && (
                    <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-48 animate-slideDown">
                      <Link
                        to={getCategoryPath(categoriesWithSubcategories[3])}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-b border-gray-100 font-medium"
                      >
                        All {categoriesWithSubcategories[3].name}
                      </Link>
                      {categoriesWithSubcategories[3].subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          to={getSubcategoryPath(categoriesWithSubcategories[3], subcategory)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
      
            {/* Grid 7: Wishlist Icon - 1 column */}
            <div className="col-span-1 flex items-center justify-end">
              <button 
                onClick={() => navigate("/Wishlist")}
                className="flex flex-col items-center group relative"
              >
                <svg className="w-5 h-5 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>
      
            {/* Grid 8: Cart Icon - 1 column */}
            <div className="col-span-1 flex items-center justify-center">
              <button
                onClick={() => navigate("/cart")}
                className="flex flex-col items-center group relative"
              >
                <svg className="w-5 h-5 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
      
            {/* Grid 9: Profile Icon with Text - 1 column */}
            <div className="col-span-1 flex items-center justify-start gap-2">
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 group"
                >
                  <svg className="w-6 h-6 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex flex-col leading-tight pt-5 pl-3">
                    <span className="text-base flex flex-start font-bold text-gray-800">Hey</span>
                    <span className="text-base font-bold text-pink-500">Sweety!</span>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={openSignIn}
                  className="flex items-center gap-2 group"
                >
                  <svg className="w-6 h-6 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex flex-col leading-tight pt-5 pl-3">
                    <span className="text-base flex flex-start font-bold text-gray-800">Hey</span>
                    <span className="text-base font-bold text-pink-500">Sweety!</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Navbar */}
      <div className="lg:hidden bg-[#F9E2E7] border-b border-gray-200 shadow-sm relative">
        <div className="w-full px-4 sm:px-6 py-4">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-6 flex-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-md transition-all duration-200"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <span
                    className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                      mobileMenuOpen ? 'rotate-45 top-2.5' : 'top-1'
                    }`}
                  />
                  <span
                    className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 top-2.5 ${
                      mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                      mobileMenuOpen ? '-rotate-45 top-2.5' : 'top-4'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                <img src={Logo} alt="Sweety Intimate" className="h-12 sm:h-15 w-auto" />
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              {isAuthenticated ? (
                <button onClick={() => navigate('/profile')} className="p-1 text-pink-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              ) : (
                <button onClick={openSignIn} className="p-1 text-pink-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}

              <button onClick={() => navigate("/Wishlist")} className="p-1 text-pink-500 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={() => navigate("/cart")} className="p-1 text-pink-500 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation Slide-out Menu */}
      <div className={`mobile-menu-container fixed top-0 left-0 h-full w-80 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center">
              <img src={Logo} alt="Sweety Intimate" className="h-8 w-auto mr-2" />
              <span className="text-lg font-semibold text-gray-800">Menu</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-pink-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200 relative " ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-4 py-3 hover:border-pink-300 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200">
                <svg className="w-5 h-5 text-pink-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="flex-1 text-sm focus:outline-none bg-transparent placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="ml-2 text-gray-400 hover:text-pink-500 transition-colors duration-200 p-1 hover:bg-white rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
            {isSearchDropdownOpen && searchQuery.length > 2 && (
              <SearchResultsDropdown />
              )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-2">
              {categoriesWithSubcategories.map((category) => (
                <MobileCategoryMenu 
                  key={category._id} 
                  category={category} 
                  isActive={isActivePage(getCategoryPath(category))}
                  onLinkClick={() => setMobileMenuOpen(false)}
                  onCategoryClick={handleCategoryClick}
                  onSubcategoryClick={handleSubcategoryClick}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">© 2024 Sweety Intimate</p>
          </div>
        </div>
      </div>

      <Banner />
      
      {/* SignIn Modal */}
      <SignIn isOpen={isSignInOpen} onClose={closeSignIn} />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

// Mobile Category Menu Component
const MobileCategoryMenu = ({ category, isActive, onLinkClick, onCategoryClick, onSubcategoryClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div className="bg-[#f9e2e7] rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center">
        <button
          onClick={() => onCategoryClick(category)}
          className={`flex-1 px-4 py-4 text-left font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 ${
            isActive
              ? "text-pink-600 bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500"
              : "text-gray-800 hover:text-pink-600"
          }`}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isActive ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm uppercase tracking-wide">{category.name}</span>
            {isActive && (
              <svg className="w-4 h-4 ml-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
        
        {hasSubcategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-4 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 border-l border-gray-100"
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {hasSubcategories && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-gray-100 bg-[#f9e2e7]">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory._id}
                onClick={() => onSubcategoryClick(subcategory, category)}
                className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:text-pink-600 hover:bg-white hover:shadow-sm transition-all duration-200 border-b border-gray-100 last:border-b-0 flex items-center group"
              >
                <div className="w-2 h-2 rounded-full bg-gray-300 mr-3 group-hover:bg-pink-400 transition-colors duration-200"></div>
                <span className="flex-1">{subcategory.name}</span>
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;