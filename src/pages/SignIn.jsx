import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearAuthErrors } from "../Redux/slices/authSlice";
import { mergeCartAsync } from "../Redux/slices/cartSlice";
const SignIn = ({ isOpen, onClose, initialMode = "login" }) => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    // Login fields
    email: "",
    password: "",
    // Signup fields
    firstName: "",
    lastName: "",
    phone: "",
    homeAddress: "",
    officeAddress: "",
  });

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Close modal if authentication is successful
  useEffect(() => {
    if (isAuthenticated) {
      handleClose();
    }
  }, [isAuthenticated]);

  // Modal animation
  useEffect(() => {
    if (isOpen) {
      gsap.set(modalRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(overlayRef.current, { opacity: 0 });

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(modalRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch(clearAuthErrors());
    gsap.to(modalRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLoginForm = () => {
    if (!formData.email.includes("@")) return "Valid email is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const validateSignupForm = () => {
    if (!formData.firstName.trim()) return "First name is required.";
    if (!formData.lastName.trim()) return "Last name is required.";
    if (!formData.email.includes("@")) return "Valid email is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.phone.length < 10) return "Valid phone number is required.";
    return "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const validationError = mode === 'login' ? validateLoginForm() : validateSignupForm();
  if (validationError) {
    return;
  }

  if (mode === 'login') {
    const resultAction = await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
    
    // Merge cart after successful login
    if (loginUser.fulfilled.match(resultAction)) {
      const sessionId = localStorage.getItem('guestSessionId');
      if (sessionId) {
        try {
          await dispatch(mergeCartAsync(sessionId)).unwrap();
          //console.log('✅ Cart merged successfully after login');
        } catch (error) {
          console.error('❌ Failed to merge cart:', error);
        }
      }
    }
    
  } else {
    const resultAction = await dispatch(registerUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      addresses: [
        ...(formData.homeAddress ? [{ 
          name: "Home", 
          addressLine1: formData.homeAddress,
          city: "",
          state: "",
          pinCode: ""
        }] : []),
        ...(formData.officeAddress ? [{ 
          name: "Office", 
          addressLine1: formData.officeAddress,
          city: "",
          state: "",
          pinCode: ""
        }] : [])
      ]
    }));
    
    // Merge cart after successful registration
    if (registerUser.fulfilled.match(resultAction)) {
      const sessionId = localStorage.getItem('guestSessionId');
      if (sessionId) {
        try {
          await dispatch(mergeCartAsync(sessionId)).unwrap();
          //console.log('✅ Cart merged successfully after registration');
        } catch (error) {
          console.error('❌ Failed to merge cart:', error);
        }
      }
    }
  }
};

  const handleGoogleLogin = async () => {
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&access_type=offline`;
    window.location.href = googleAuthUrl;
  };

  const handleContinueAsGuest = () => {
    //console.log("Continue as guest clicked");
    handleClose();
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      homeAddress: "",
      officeAddress: "",
    });
    dispatch(clearAuthErrors());
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-pink-300  bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl ${mode === 'signup' ? 'max-w-4xl' : 'max-w-md'} w-full max-h-[90vh] overflow-y-auto relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
        >
          ×
        </button>

        {mode === 'login' ? (
          // Login Form
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-pink-500 text-white rounded-md font-medium hover:bg-pink-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* OR Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="border-t border-gray-300 flex-1"></div>
                <span className="mx-4 text-gray-500 font-medium">OR</span>
                <div className="border-t border-gray-300 flex-1"></div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>

                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="w-full py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                >
                  Continue as Guest
                </button>
              </div>

              {/* Switch to Signup */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          // Signup Form - Responsive Layout
          <div className="lg:flex">
            {/* Left Section - Account Details */}
            <div className="flex-1 p-8 lg:border-r border-gray-200">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Create Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                )}

                {/* First Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Last Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9696969696"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Address Fields - Show on small screens */}
                <div className="lg:hidden space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
                    Saved Address (Optional)
                  </h3>
                  
                  {/* Home Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Address
                    </label>
                    <textarea
                      name="homeAddress"
                      value={formData.homeAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your home address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Office Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Office Address
                    </label>
                    <textarea
                      name="officeAddress"
                      value={formData.officeAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your office address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* OR Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="border-t border-gray-300 flex-1"></div>
                  <span className="mx-4 text-gray-500 font-medium">OR</span>
                  <div className="border-t border-gray-300 flex-1"></div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="w-full py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    Continue as Guest
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </button>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-pink-500 text-white rounded-md font-medium hover:bg-pink-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>

                {/* Switch to Login */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-pink-500 hover:text-pink-600 font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Right Section - Saved Address (Only visible on large screens) */}
            <div className="hidden lg:block flex-1 p-8">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Saved Address (Optional)
              </h2>

              <div className="space-y-6">
                {/* Home Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address
                  </label>
                  <textarea
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your home address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Office Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Address
                  </label>
                  <textarea
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your office address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;