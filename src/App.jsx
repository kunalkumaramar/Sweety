import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";

// Pages
import Home from "./pages/Home";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

// Components
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Checkout from "./components/Checkout";
import GoogleCallback from "./components/GoogleCallback";

// Lazy load SmoothCursor to prevent framer-motion from blocking initial render
const SmoothCursor = React.lazy(() => import("./components/SmoothCursor").then(m => ({ default: m.SmoothCursor })));

// Context Providers
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import "./App.css";

// Layout wrapper for pages with Navbar and Footer
const DefaultLayout = ({ children }) => (
  <div className="font-sans">
    <ScrollToTop />
    <Navbar />
    {children}
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
    {children}
    <React.Suspense fallback={null}>
      <SmoothCursor />
    </React.Suspense>
  </div>
);

// Helper Layout Wrapper
const AppContent = () => {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />

      {/* Static Pages */}
      <Route path="/about" element={<DefaultLayout><AboutUs /></DefaultLayout>} />
      <Route path="/faq" element={<DefaultLayout><SweetyFAQ /></DefaultLayout>} />
      <Route path="/contact" element={<DefaultLayout><ContactUs /></DefaultLayout>} />
      <Route path="/return-refund-policy" element={<DefaultLayout><ReturnRefundPolicy /></DefaultLayout>} />
      <Route path="/shipping-policy" element={<DefaultLayout><ShippingPolicy /></DefaultLayout>} />
      <Route path="/terms-and-conditions" element={<DefaultLayout><TermsCondition /></DefaultLayout>} />
      <Route path="/privacy-policy" element={<DefaultLayout><PrivacyPolicy /></DefaultLayout>} />

      {/* Product Routes */}
      <Route path="/products" element={<DefaultLayout><Products /></DefaultLayout>} />
      <Route path="/products/:category" element={<DefaultLayout><Products /></DefaultLayout>} />
      <Route path="/products/:category/:subcategory" element={<DefaultLayout><Products /></DefaultLayout>} />

      {/* Product Details */}
      <Route path="/product/:productId" element={<DefaultLayout><ProductDetail /></DefaultLayout>} />

      {/* Cart & Wishlist */}
      <Route path="/cart" element={<DefaultLayout><Cart /></DefaultLayout>} />
      <Route path="/wishlist" element={<DefaultLayout><Wishlist /></DefaultLayout>} />


      {/* User Profile */}
      <Route path="/profile" element={<DefaultLayout><UserProfile /></DefaultLayout>} />

      {/* Blogs */}
      <Route path="/blogs" element={<DefaultLayout><Blogs /></DefaultLayout>} />

      {/* Auth Routes */}
      <Route path="/auth/google/callback" element={<DefaultLayout><GoogleCallback /></DefaultLayout>} />
      <Route path="/login" element={<DefaultLayout><div>Login Page - Use SignIn Modal Instead</div></DefaultLayout>} />
      <Route path="/register" element={<DefaultLayout><div>Register Page - Use SignIn Modal Instead</div></DefaultLayout>} />

      {/* Checkout */}
      <Route path="/checkout" element={<DefaultLayout><Checkout /></DefaultLayout>} />
      <Route path="/order-success/:orderId" element={<DefaultLayout><OrderSuccess /></DefaultLayout>} />

      {/* Catch-all 404 route */}
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