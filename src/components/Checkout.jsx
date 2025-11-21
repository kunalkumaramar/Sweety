// src/components/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { 
  initiatePayment, 
  verifyPayment, 
  handlePaymentSuccess, 
  handlePaymentFailure,
  clearPaymentError
} from '../Redux/slices/paymentSlice';
import { createOrder } from '../Redux/slices/ordersSlice';
import { validateDiscountAsync, applyDiscountAsync, removeDiscountAsync } from '../Redux/slices/cartSlice';

// CouponSection Component
const CouponSection = ({ onApplyDiscount, onRemoveDiscount, hasDiscount, appliedDiscount, loading }) => {
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }
    
    setError('');
    const result = await onApplyDiscount(couponCode.trim());
    if (result.success) {
      setCouponCode('');
      setShowCouponInput(false);
    } else {
      setError(result.error || 'Failed to apply coupon');
    }
  };

  const handleRemoveDiscount = async () => {
    setError('');
    const result = await onRemoveDiscount();
    if (!result.success) {
      setError(result.error || 'Failed to remove discount');
    }
  };

  if (hasDiscount && appliedDiscount) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <div className="flex flex-col">
          <span className="text-green-600 text-sm font-medium">✓ Discount Applied</span>
          <span className="text-green-700 text-xs">
            {appliedDiscount.code} - ₹{(appliedDiscount.discountAmount || 0).toLocaleString()} off
          </span>
        </div>
        <button
          onClick={handleRemoveDiscount}
          disabled={loading}
          className="text-red-600 text-xs hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {error && (
        <div className="text-red-500 text-xs mb-2 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      {!showCouponInput ? (
        <button
          onClick={() => {
            setShowCouponInput(true);
            setError('');
          }}
          className="w-full bg-white border border-pink-300 text-pink-600 py-3 rounded-3xl text-sm font-semibold hover:bg-pink-50 transition-colors"
        >
          Add Coupon
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setError('');
            }}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border border-pink-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || loading}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
          <button
            onClick={() => {
              setShowCouponInput(false);
              setCouponCode('');
              setError('');
            }}
            className="text-gray-500 px-2 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items: cartItems, totals, clearCartItems, hasDiscount, appliedDiscount, applyingDiscount, removingDiscount } = useCart();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loading: paymentLoading, error: paymentError } = useSelector(state => state.payment);

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: user.phone || ''
      }));

      if (user.addresses && user.addresses.length > 0) {
        const firstAddress = user.addresses[0];
        setShippingAddress(prev => ({
          ...prev,
          ...firstAddress
        }));
      }
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Handle input changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
    if (!shippingAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    if (!/^\d{6}$/.test(shippingAddress.pinCode)) newErrors.pinCode = 'Invalid PIN code';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^\d{10}$/.test(shippingAddress.phone)) newErrors.phone = 'Invalid phone number';

    if (!useSameAddress) {
      if (!billingAddress.name.trim()) newErrors.billingName = 'Billing name is required';
      if (!billingAddress.addressLine1.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!billingAddress.city.trim()) newErrors.billingCity = 'Billing city is required';
      if (!billingAddress.state.trim()) newErrors.billingState = 'Billing state is required';
      if (!billingAddress.pinCode.trim()) newErrors.billingPinCode = 'Billing PIN code is required';
      if (!/^\d{6}$/.test(billingAddress.pinCode)) newErrors.billingPinCode = 'Invalid billing PIN code';
      if (!billingAddress.phone.trim()) newErrors.billingPhone = 'Billing phone is required';
      if (!/^\d{10}$/.test(billingAddress.phone)) newErrors.billingPhone = 'Invalid billing phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle coupon actions
  const handleApplyDiscount = async (code) => {
    if (!code.trim()) {
      showNotification('Please enter a discount code', 'error');
      return { success: false, error: 'Please enter a discount code' };
    }

    try {
      const productIds = cartItems.map(item => item.product?._id || item.productId);
      
      const validationResult = await dispatch(
        validateDiscountAsync({ 
          code: code.trim(), 
          productIds 
        })
      ).unwrap();

      if (!validationResult?.data?.canUse) {
        const errorMessage = validationResult?.data?.message || 'Invalid discount code';
        throw new Error(errorMessage);
      }

      const result = await dispatch(
        applyDiscountAsync({ 
          code: code.trim(), 
          type: 'coupon' 
        })
      ).unwrap();
      
      const discountAmount = result.appliedCoupon?.discountAmount || 
                           result.appliedVoucher?.discountAmount || 
                           0;
      
      showNotification(
        `Discount applied successfully! You saved ₹${discountAmount}`, 
        'success'
      );
      return { success: true, result };
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || '';
      
      if (errorMessage.toLowerCase().includes('already used')) {
        showNotification('You have already used this discount code', 'error');
      } else if (errorMessage.toLowerCase().includes('expired')) {
        showNotification('This discount code has expired', 'error');
      } else if (errorMessage.toLowerCase().includes('not found') || 
                 errorMessage.toLowerCase().includes('invalid')) {
        showNotification('Invalid discount code', 'error');
      } else {
        showNotification(errorMessage || 'Failed to apply discount', 'error');
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await dispatch(removeDiscountAsync()).unwrap();
      showNotification('Discount removed successfully', 'info');
      return { success: true };
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || '';
      showNotification('Failed to remove discount', 'error');
      return { success: false, error: errorMessage };
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = (orderId, razorpayOrderId, razorpayKey) => {
    const options = {
      key: razorpayKey,
      amount: totals.total * 100,
      currency: 'INR',
      name: 'Sweety Intimate',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          setIsProcessing(true);
          
          try {
            await dispatch(verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })).unwrap();
          } catch (verifyError) {
            console.warn('Payment verification had issues (non-fatal):', verifyError);
          }

          try {
            await dispatch(handlePaymentSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })).unwrap();
          } catch (successError) {
            console.warn('Payment success handler had issues (non-fatal):', successError);
          }

          try {
            await clearCartItems();
          } catch (clearError) {
            console.warn('Failed to clear cart immediately (non-fatal):', clearError);
          }

          navigate(`/order-success/${orderId}`);
        } catch (error) {
          console.error('Unexpected payment processing error:', error);
          alert('Payment was processed, but there was an issue finalizing. Please check your orders or contact support.');
          try {
            await clearCartItems();
          } catch {}
          navigate(`/order-success/${orderId}`);
        } finally {
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: async function () {
          try {
            await dispatch(handlePaymentFailure({
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: '',
              failureReason: 'Payment cancelled by user'
            })).unwrap();
          } catch (error) {
            console.error('Error handling payment dismissal:', error);
          }
          setIsProcessing(false);
        }
      },
      prefill: {
        name: shippingAddress.name,
        email: user?.email || '',
        contact: shippingAddress.phone
      },
      theme: {
        color: '#EC4899'
      }
    };

    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', async function (response) {
      try {
        await dispatch(handlePaymentFailure({
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: response.error.metadata.payment_id,
          failureReason: response.error.description
        })).unwrap();
        alert(`Payment failed: ${response.error.description}`);
      } catch (error) {
        console.error('Error handling payment failure:', error);
      } finally {
        setIsProcessing(false);
      }
    });

    razorpay.open();
  };

  // Handle place order
// Handle place order
const handlePlaceOrder = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    alert('Please fill all required fields correctly');
    return;
  }

  if (!isAuthenticated) {
    alert('Please login to place an order');
    navigate('/login');
    return;
  }

  try {
    setIsProcessing(true);
    dispatch(clearPaymentError());

    // ⭐ Pixel Event — AddPaymentInfo
    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "AddPaymentInfo", {
        value: grandTotal,
        currency: "INR",
        num_items: cartItems.length,
        contents: cartItems.map(item => ({
          id: item.product?._id || item.productId,
          quantity: item.quantity
        }))
      });
    }

    const orderData = {
      items: cartItems.map(item => ({
        product: item.product?._id || item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product?.price || item.price,
        color: item.color,
        size: item.size,
        productImage: item.selectedImage || item.product?.images?.[0] || item.image,
        productName: item.product?.name || item.name
      })),
      shippingAddress: useSameAddress ? shippingAddress : shippingAddress,
      billingAddress: useSameAddress ? shippingAddress : billingAddress,
      paymentMethod,
      notes: notes.trim(),
      subtotal: totals.subtotal,
      totalDiscountAmount: totals.discountAmount || 0,
      shippingCharge: 0,
      total: grandTotal
    };

    const orderResult = await dispatch(createOrder(orderData)).unwrap();
    const orderId = orderResult.orderId || orderResult._id;
    
    if (!orderId) {
      throw new Error('Order created but ID not found. Please contact support.');
    }

    const paymentResult = await dispatch(initiatePayment({
      orderId,
      method: paymentMethod
    })).unwrap();

    const razorpayOrderId = paymentResult.order?.id;
    const razorpayKey = paymentResult.key;

    if (paymentMethod === 'razorpay' && razorpayOrderId && razorpayKey) {
      handleRazorpayPayment(
        orderId,
        razorpayOrderId,
        razorpayKey
      );
    } else {
      throw new Error('Payment initialization incomplete');
    }
  } catch (error) {
    console.error('Order placement failed:', error);
    alert(error.message || 'Failed to place order. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};


  // Calculate totals
  const subtotalAfterDiscount = totals.subtotal - (totals.discountAmount || 0);
  const grandTotal = subtotalAfterDiscount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {paymentError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {paymentError}
          </div>
        )}

        {notification && (
          <div className={`border rounded mb-6 p-4 ${
            notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
            notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
            'bg-blue-100 border-blue-400 text-blue-700'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleShippingChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleShippingChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={shippingAddress.pinCode}
                    onChange={handleShippingChange}
                    maxLength="6"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.pinCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    maxLength="10"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={(e) => setUseSameAddress(e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as shipping</span>
                </label>
              </div>

              {!useSameAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={billingAddress.name}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingName && <p className="text-red-500 text-xs mt-1">{errors.billingName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={billingAddress.addressLine1}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={billingAddress.addressLine2}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={billingAddress.city}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={billingAddress.state}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingState ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingState && <p className="text-red-500 text-xs mt-1">{errors.billingState}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={billingAddress.pinCode}
                      onChange={handleBillingChange}
                      maxLength="6"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingPinCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingPinCode && <p className="text-red-500 text-xs mt-1">{errors.billingPinCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingAddress.phone}
                      onChange={handleBillingChange}
                      maxLength="10"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.billingPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.billingPhone && <p className="text-red-500 text-xs mt-1">{errors.billingPhone}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-pink-500">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-pink-600"
                  />
                  <span className="ml-3 text-gray-900 font-medium">Razorpay (Cards, UPI, Net Banking)</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img 
                      src={item.selectedImage || item.product?.images?.[0]} 
                      alt={item.product?.name || item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product?.name || item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × ₹{(item.product?.price || item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal.toLocaleString()}</span>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{totals.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-pink-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <CouponSection 
                onApplyDiscount={handleApplyDiscount}
                onRemoveDiscount={handleRemoveDiscount}
                hasDiscount={hasDiscount}
                appliedDiscount={appliedDiscount}
                loading={applyingDiscount || removingDiscount}
              />

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || paymentLoading}
                className="w-full mt-6 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing || paymentLoading ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;