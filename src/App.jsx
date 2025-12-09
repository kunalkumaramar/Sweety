import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";

// ✅ CRITICAL: Only import Home (LCP) - keeps initial bundle small
import Home from "./pages/Home";

// ✅ LAZY LOAD: All other pages to reduce initial bundle size
const Products = React.lazy(() => import("./components/Products"));
const ProductDetail = React.lazy(() => import("./components/ProductDetail"));
const Wishlist = React.lazy(() => import("./components/Wishlist"));
const Cart = React.lazy(() => import("./components/cart"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const Blogs = React.lazy(() => import("./pages/Blogs"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const SweetyFAQ = React.lazy(() => import("./pages/FAQ"));
const ReturnRefundPolicy = React.lazy(() => import("./pages/ReturnandRefundPolicy"));
const ShippingPolicy = React.lazy(() => import("./pages/ShippingPolicy"));
const TermsCondition = React.lazy(() => import("./pages/Terms&Conditions"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Components
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ✅ LAZY LOAD: Heavy components that might block rendering
const Checkout = React.lazy(() => import("./components/Checkout"));
const GoogleCallback = React.lazy(() => import("./components/GoogleCallback"));
const SmoothCursor = React.lazy(() => import("./components/SmoothCursor").then(m => ({ default: m.SmoothCursor })));

// Context Providers
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import "./App.css";

// ✅ OPTIMIZED: Loading fallback - minimal component to reduce TBT
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-gray-400 text-sm">Loading...</div>
  </div>
);

// Layout wrapper for pages with Navbar and Footer
const DefaultLayout = ({ children }) => (
  <div className="font-sans">
    <ScrollToTop />
    <Navbar />
    <React.Suspense fallback={<LoadingFallback />}>
      {children}
    </React.Suspense>
    <Footer />
    <React.Suspense fallback={null}>
      <SmoothCursor />
    </React.Suspense>
  </div>
);

// Layout wrapper for NotFound page (no Navbar or Footer)
const NotFoundLayout = ({ children }) => (
  <div className="font-sans">
    <ScrollToTop />
    <React.Suspense fallback={<LoadingFallback />}>
      {children}
    </React.Suspense>
    <React.Suspense fallback={null}>
      <SmoothCursor />
    </React.Suspense>
  </div>
);

// Helper Layout Wrapper
const AppContent = () => {
  return (
    <Routes>
      {/* Home - CRITICAL (not lazy loaded) */}
      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />

      {/* Static Pages - LAZY LOADED */}
      <Route path="/about" element={<DefaultLayout><AboutUs /></DefaultLayout>} />
      <Route path="/faq" element={<DefaultLayout><SweetyFAQ /></DefaultLayout>} />
      <Route path="/contact" element={<DefaultLayout><ContactUs /></DefaultLayout>} />
      <Route path="/return-refund-policy" element={<DefaultLayout><ReturnRefundPolicy /></DefaultLayout>} />
      <Route path="/shipping-policy" element={<DefaultLayout><ShippingPolicy /></DefaultLayout>} />
      <Route path="/terms-and-conditions" element={<DefaultLayout><TermsCondition /></DefaultLayout>} />
      <Route path="/privacy-policy" element={<DefaultLayout><PrivacyPolicy /></DefaultLayout>} />

      {/* Product Routes - LAZY LOADED */}
      <Route path="/products" element={<DefaultLayout><Products /></DefaultLayout>} />
      <Route path="/products/:category" element={<DefaultLayout><Products /></DefaultLayout>} />
      <Route path="/products/:category/:subcategory" element={<DefaultLayout><Products /></DefaultLayout>} />

      {/* Product Details - LAZY LOADED */}
      <Route path="/product/:productId" element={<DefaultLayout><ProductDetail /></DefaultLayout>} />

      {/* Cart & Wishlist - LAZY LOADED */}
      <Route path="/cart" element={<DefaultLayout><Cart /></DefaultLayout>} />
      <Route path="/wishlist" element={<DefaultLayout><Wishlist /></DefaultLayout>} />

      {/* User Profile - LAZY LOADED */}
      <Route path="/profile" element={<DefaultLayout><UserProfile /></DefaultLayout>} />

      {/* Blogs - LAZY LOADED */}
      <Route path="/blogs" element={<DefaultLayout><Blogs /></DefaultLayout>} />

      {/* Auth Routes - LAZY LOADED */}
      <Route path="/auth/google/callback" element={<DefaultLayout><GoogleCallback /></DefaultLayout>} />
      <Route path="/login" element={<DefaultLayout><div>Login Page - Use SignIn Modal Instead</div></DefaultLayout>} />
      <Route path="/register" element={<DefaultLayout><div>Register Page - Use SignIn Modal Instead</div></DefaultLayout>} />

      {/* Checkout - LAZY LOADED */}
      <Route path="/checkout" element={<DefaultLayout><Checkout /></DefaultLayout>} />
      <Route path="/order-success/:orderId" element={<DefaultLayout><OrderSuccess /></DefaultLayout>} />

      {/* Catch-all 404 route - LAZY LOADED */}
      <Route path="*" element={<NotFoundLayout><NotFound /></NotFoundLayout>} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppContent />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </Provider>
  );
}

export default App;