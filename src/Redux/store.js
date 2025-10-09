//src/Redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categorySlice';
import subcategoriesReducer from './slices/subcategorySlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/WishlistSlice';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';
import paymentReducer from './slices/paymentSlice';
import blogsReducer from "./slices/blogsSlice";
import bannerReducer from './slices/bannerSlice';
export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    subcategories: subcategoriesReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    orders: ordersReducer,
    payment: paymentReducer,
    blogs: blogsReducer,
    banners: bannerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

