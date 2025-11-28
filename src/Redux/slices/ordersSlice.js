// src/Redux/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await apiService.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create order");
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "orders/getUserOrders",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserOrders(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
  }
);

export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrderById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch order details");
    }
  }
);

export const searchOrders = createAsyncThunk(
  "orders/searchOrders",
  async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiService.searchOrders(query, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search orders");
    }
  }
);

export const getOrderStats = createAsyncThunk(
  "orders/getOrderStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrderStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch order stats");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiService.cancelOrder(orderId, reason);
      return { orderId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to cancel order");
    }
  }
);

export const returnOrder = createAsyncThunk(
  "orders/returnOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiService.returnOrder(orderId, reason);
      return { orderId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to return order");
    }
  }
);

export const createGuestOrder = createAsyncThunk(
  "orders/createGuestOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await apiService.createGuestOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create guest order");
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  orderStats: [],
  searchResults: [],
  loading: false,
  orderLoading: false,
  searchLoading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
  orderError: null,
  searchError: null,
  statsError: null,
  actionError: null,
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  searchPagination: {
    total: 0,
    currentPage: 1,
    limit: 10,
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.orderError = null;
      state.searchError = null;
      state.statsError = null;
      state.actionError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.orderError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.searchPagination = {
        total: 0,
        currentPage: 1,
        limit: 10,
      };
    },
    resetOrdersState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderWithId = {
          ...action.payload,
          _id: action.payload.orderId || action.payload._id,
        };
        state.orders.unshift(orderWithId);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = {
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.meta.arg?.page || 1,
          limit: action.meta.arg?.limit || 10,
        };
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
      })

      // Get Order By ID
      .addCase(getOrderById.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload;
        state.currentOrder = null;
      })

      // Search Orders
      .addCase(searchOrders.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.orders || [];
        state.searchPagination = {
          total: action.payload.total || 0,
          currentPage: action.meta.arg?.page || 1,
          limit: action.meta.arg?.limit || 10,
        };
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
        state.searchResults = [];
      })

      // Get Order Stats
      .addCase(getOrderStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.orderStats = action.payload || [];
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
        state.orderStats = [];
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update order status in the orders list
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = "cancelled";
        }
        // Update current order if it matches
        if (
          state.currentOrder &&
          state.currentOrder._id === action.payload.orderId
        ) {
          state.currentOrder.status = "cancelled";
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Create Guest Order
      .addCase(createGuestOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderWithId = {
          ...action.payload,
          id: action.payload.orderId || action.payload._id,
        };
        state.orders.unshift(orderWithId);
      })
      .addCase(createGuestOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Return Order
      .addCase(returnOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update order status in the orders list
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = "return_requested";
        }
        // Update current order if it matches
        if (
          state.currentOrder &&
          state.currentOrder._id === action.payload.orderId
        ) {
          state.currentOrder.status = "return_requested";
        }
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  clearOrderError,
  clearCurrentOrder,
  clearSearchResults,
  resetOrdersState,
} = ordersSlice.actions;

export default ordersSlice.reducer;
