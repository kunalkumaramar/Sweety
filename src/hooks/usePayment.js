// src/hooks/usePayment.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  initiatePayment,
  processRazorpayPayment,
  verifyPayment,
  getPaymentDetails,
  getPaymentByOrderId,
  resetPaymentState,
  clearPaymentErrors,
  setPaymentMethod,
  showPaymentModal,
  hidePaymentModal,
  showPaymentSuccessModal,
  hidePaymentSuccessModal,
  showPaymentFailureModal,
  hidePaymentFailureModal
} from '../Redux/slices/paymentSlice';
import { paymentService } from '../services/paymentApi';

export const usePayment = () => {
  const dispatch = useDispatch();
  
  const {
    currentPayment,
    paymentDetails,
    razorpayOrderId,
    payments,
    
    // Loading states
    loading,
    initiatingPayment,
    processingPayment,
    verifyingPayment,
    fetchingPaymentDetails,
    fetchingPaymentByOrder,
    handlingSuccess,
    handlingFailure,
    
    // Error states
    error,
    initiationError,
    processingError,
    verificationError,
    paymentDetailsError,
    paymentByOrderError,
    successHandlingError,
    failureHandlingError,
    
    // Payment status
    paymentStatus,
    paymentMethod,
    
    // Success/failure data
    successData,
    failureData,
    
    // Razorpay specific
    razorpayScriptLoaded,
    
    // UI states
    showPaymentModal: paymentModalVisible,
    showPaymentSuccess,
    showPaymentFailure
  } = useSelector(state => state.payment);

  // Initiate payment
  const initPayment = useCallback(async (orderId, method = 'razorpay') => {
    try {
      const result = await dispatch(initiatePayment({ orderId, method })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Process Razorpay payment with full checkout flow
  const processPayment = useCallback(async (paymentData) => {
    try {
      const result = await dispatch(processRazorpayPayment(paymentData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Verify payment
  const verifyPaymentData = useCallback(async (verificationData) => {
    try {
      const result = await dispatch(verifyPayment(verificationData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Get payment details
  const fetchPaymentDetails = useCallback(async (paymentId) => {
    try {
      const result = await dispatch(getPaymentDetails(paymentId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Get payment by order ID
  const fetchPaymentByOrderId = useCallback(async (orderId) => {
    try {
      const result = await dispatch(getPaymentByOrderId(orderId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Load Razorpay script
  const loadRazorpayScript = useCallback(async () => {
    try {
      const loaded = await paymentService.loadRazorpayScript();
      return { success: loaded };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Process complete payment flow (convenience method)
  const processCompletePayment = useCallback(async ({
    orderId,
    amount,
    currency = 'INR',
    customerDetails,
    orderDetails
  }) => {
    try {
      // Load Razorpay script if not already loaded
      if (!razorpayScriptLoaded) {
        const scriptResult = await loadRazorpayScript();
        if (!scriptResult.success) {
          throw new Error('Failed to load Razorpay script');
        }
      }

      // Process payment
      const paymentResult = await processPayment({
        orderId,
        amount,
        currency,
        customerDetails,
        orderDetails
      });

      return paymentResult;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [loadRazorpayScript, processPayment, razorpayScriptLoaded]);

  // Reset payment state
  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  // Clear payment errors
  const clearErrors = useCallback(() => {
    dispatch(clearPaymentErrors());
  }, [dispatch]);

  // Set payment method
  const setSelectedPaymentMethod = useCallback((method) => {
    dispatch(setPaymentMethod(method));
  }, [dispatch]);

  // Modal controls
  const showModal = useCallback(() => {
    dispatch(showPaymentModal());
  }, [dispatch]);

  const hideModal = useCallback(() => {
    dispatch(hidePaymentModal());
  }, [dispatch]);

  const showSuccessModal = useCallback(() => {
    dispatch(showPaymentSuccessModal());
  }, [dispatch]);

  const hideSuccessModal = useCallback(() => {
    dispatch(hidePaymentSuccessModal());
  }, [dispatch]);

  const showFailureModal = useCallback(() => {
    dispatch(showPaymentFailureModal());
  }, [dispatch]);

  const hideFailureModal = useCallback(() => {
    dispatch(hidePaymentFailureModal());
  }, [dispatch]);

  // Utility methods
  const formatAmount = useCallback((amount, currency = 'INR') => {
    return paymentService.formatAmount(amount, currency);
  }, []);

  const getPaymentStatusColor = useCallback((status) => {
    return paymentService.getPaymentStatusColor(status);
  }, []);

  const getPaymentMethodName = useCallback((method) => {
    return paymentService.getPaymentMethodName(method);
  }, []);

  // Memoize state flags for better performance
  const isPaymentInProgress = useMemo(() => {
    return initiatingPayment || processingPayment || verifyingPayment;
  }, [initiatingPayment, processingPayment, verifyingPayment]);

  // Memoize error checking
  const hasAnyError = useMemo(() => {
    return !!(error || initiationError || processingError || verificationError || 
              paymentDetailsError || paymentByOrderError || successHandlingError || failureHandlingError);
  }, [error, initiationError, processingError, verificationError, 
      paymentDetailsError, paymentByOrderError, successHandlingError, failureHandlingError]);

  // Memoize current error message
  const getCurrentError = useMemo(() => {
    return error || initiationError || processingError || verificationError || 
           paymentDetailsError || paymentByOrderError || successHandlingError || failureHandlingError;
  }, [error, initiationError, processingError, verificationError, 
      paymentDetailsError, paymentByOrderError, successHandlingError, failureHandlingError]);

  return {
    // State
    currentPayment,
    paymentDetails,
    razorpayOrderId,
    payments,
    paymentStatus,
    paymentMethod,
    successData,
    failureData,
    razorpayScriptLoaded,
    
    // Loading states
    loading,
    initiatingPayment,
    processingPayment,
    verifyingPayment,
    fetchingPaymentDetails,
    fetchingPaymentByOrder,
    handlingSuccess,
    handlingFailure,
    
    // Error states
    error,
    initiationError,
    processingError,
    verificationError,
    paymentDetailsError,
    paymentByOrderError,
    successHandlingError,
    failureHandlingError,
    
    // UI states
    paymentModalVisible,
    showPaymentSuccess,
    showPaymentFailure,
    
    // Actions
    initPayment,
    processPayment,
    verifyPaymentData,
    fetchPaymentDetails,
    fetchPaymentByOrderId,
    loadRazorpayScript,
    processCompletePayment,
    resetPayment,
    clearErrors,
    setSelectedPaymentMethod,
    
    // Modal controls
    showModal,
    hideModal,
    showSuccessModal,
    hideSuccessModal,
    showFailureModal,
    hideFailureModal,
    
    // Utility methods
    formatAmount,
    getPaymentStatusColor,
    getPaymentMethodName,
    isPaymentInProgress,
    hasAnyError,
    getCurrentError
  };
};