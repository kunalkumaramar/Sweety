// src/Redux/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks
export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async ({ orderId, method }, { rejectWithValue }) => {
    try {
      const response = await apiService.initiatePayment(orderId, method);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (razorpayData, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyPayment(razorpayData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Payment verification failed');
    }
  }
);

export const handlePaymentSuccess = createAsyncThunk(
  'payment/success',
  async (razorpayData, { rejectWithValue }) => {
    try {
      const response = await apiService.handlePaymentSuccess(razorpayData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process payment success');
    }
  }
);

export const handlePaymentFailure = createAsyncThunk(
  'payment/failure',
  async ({ razorpayOrderId, razorpayPaymentId, failureReason }, { rejectWithValue }) => {
    try {
      const response = await apiService.handlePaymentFailure(
        razorpayOrderId,
        razorpayPaymentId,
        failureReason
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process payment failure');
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'payment/getDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaymentDetails(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment details');
    }
  }
);

export const getPaymentByOrderId = createAsyncThunk(
  'payment/getByOrderId',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaymentByOrderId(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment by order ID');
    }
  }
);

export const initiateGuestPayment = createAsyncThunk(
  'payment/initiateGuest',
  async ({ orderId, method, guestEmail }, { rejectWithValue }) => {
    try {
      const response = await apiService.initiateGuestPayment(orderId, method, guestEmail);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to initiate guest payment');
    }
  }
);

const initialState = {
  currentPayment: null,
  paymentDetails: null,
  razorpayOrderId: null,
  razorpayKey: null,
  loading: false,
  verifying: false,
  processing: false,
  error: null,
  successMessage: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.razorpayOrderId = null;
      state.razorpayKey = null;
    },
    setRazorpayData: (state, action) => {
      state.razorpayOrderId = action.payload.razorpayOrderId;
      state.razorpayKey = action.payload.razorpayKey;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In paymentSlice.js, initiatePayment fulfilled case (around line 42)
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        // Extract razorpay order ID from the nested structure
        state.razorpayOrderId = action.payload.order?.id || action.payload.razorpayOrderId;
        state.razorpayKey = action.payload.key || action.payload.razorpayKey;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifying = false;
        state.paymentDetails = action.payload;
        state.successMessage = 'Payment verified successfully';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload;
      })

      // Handle Payment Success
      .addCase(handlePaymentSuccess.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(handlePaymentSuccess.fulfilled, (state, action) => {
        state.processing = false;
        state.paymentDetails = action.payload;
        state.successMessage = 'Payment completed successfully';
      })
      .addCase(handlePaymentSuccess.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // Handle Payment Failure
      .addCase(handlePaymentFailure.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(handlePaymentFailure.fulfilled, (state, action) => {
        state.processing = false;
        state.error = 'Payment failed. Please try again.';
      })
      .addCase(handlePaymentFailure.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // Get Payment Details
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Initiate Guest Payment
      .addCase(initiateGuestPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateGuestPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.razorpayOrderId = action.payload.order?.id || action.payload.razorpayOrderId;
        state.razorpayKey = action.payload.key || action.payload.razorpayKey;
      })
      .addCase(initiateGuestPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Payment By Order ID
      .addCase(getPaymentByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(getPaymentByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearPaymentSuccess,
  clearCurrentPayment,
  setRazorpayData,
} = paymentSlice.actions;

export default paymentSlice.reducer;