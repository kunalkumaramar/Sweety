// sweetyintimate/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";

// Pages
import Home from "./pages/Home";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import SearchResults from "./components/SearchResults";
import Wishlist from "./components/Wishlist";
import Cart from "./components/cart";
import UserProfile from "./pages/UserProfile";
import AboutUs from "./pages/AboutUs";
import OrderSuccess from "./pages/OrderSuccess";
import Blogs from "./pages/Blogs";
import ContactUs from "./pages/ContactUs";
import SweetyFAQ from "./pages/FAQ";
import ReturnRefundPolicy from "./pages/ReturnandRefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsCondition from "./pages/Terms&Conditions";

// Components
import ScrollToTop from './components/ScrollToTop';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Checkout from "./components/Checkout";
import { SmoothCursor } from "./components/SmoothCursor";
import GoogleCallback from "./components/GoogleCallback";

// Context Providers
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="font-sans">
              {/* Global Layout Components */}
              <ScrollToTop />
              <Navbar />
              <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* About Us - Add this route */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/faq" element={<SweetyFAQ />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsCondition />} />

                {/* Dynamic product routes */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category" element={<Products />} />
                <Route
                  path="/products/:category/:subcategory"
                  element={<Products />}
                />

                {/* Product details */}
                <Route path="/product/:productId" element={<ProductDetail />} />

                {/* Cart & Wishlist */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Search */}
                <Route path="/search" element={<SearchResults />} />

                {/* User Profile */}
                <Route path="/profile" element={<UserProfile />} />

                <Route path="/blogs" element={<Blogs />} />

                {/* Auth routes (can be removed as SignIn modal handles both) */}
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/login" element={<div>Login Page - Use SignIn Modal Instead</div>} />
                <Route path="/register" element={<div>Register Page - Use SignIn Modal Instead</div>} />

                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              </Routes>

              {/* Global Footer */}
              <Footer />
              <SmoothCursor />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </Provider>
  );
}

export default App;