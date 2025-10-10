// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ========================================================================
  // CORE REQUEST HANDLER
  // ========================================================================
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ========================================================================
  // UTILITIES
  // ========================================================================
  getSessionId() {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.floor(Date.now() / 1000).toString() + 
                 Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestSessionId', sessionId);
      console.log('Created new guest session:', sessionId);
    } else {
      console.log('Using existing guest session:', sessionId);
    }
    return sessionId;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // ========================================================================
  // AUTH APIs
  // ========================================================================
  async googleAuth(googleData) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile() {
    return this.request('/auth/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // ========================================================================
  // CATEGORY & SUBCATEGORY APIs
  // ========================================================================
  async getCategories() {
    return this.request('/category');
  }

  async getCategoryById(categoryId) {
    return this.request(`/category/${categoryId}`);
  }

  async getSubcategoriesByCategory(categoryId) {
    return this.request(`/subcategory/category/${categoryId}`);
  }

  async getSubcategoryById(subcategoryId) {
    return this.request(`/subcategory/${subcategoryId}`);
  }

  // ========================================================================
  // PRODUCT APIs
  // ========================================================================
  async getAllProducts(page = 1, limit = 12) {
    return this.request(`/product/products?page=${page}&limit=${limit}`);
  }

  async searchProducts(query, page = 1, limit = 12) {
    return this.request(`/product/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getProductById(productId) {
    return this.request(`/product/${productId}`);
  }

  async getProductsByCategory(categoryId, page = 1, limit = 12) {
    return this.request(`/product/category/${categoryId}?page=${page}&limit=${limit}`);
  }

  async getProductsBySubcategory(subcategoryId, page = 1, limit = 12, isActive = true) {
    return this.request(`/product/subcategory/${subcategoryId}?page=${page}&limit=${limit}&isActive=${isActive}`);
  }

  // ========================================================================
  // CART APIs (AUTHENTICATED)
  // ========================================================================
  async addToCart(productId, quantity = 1, size = 'M', color = {}, selectedImage = '') {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product: productId, quantity, size: size.toLowerCase(), color, selectedImage }),
    });
  }

  async getUserCart() {
    return this.request('/cart');
  }

  async getCartDetails() {
    return this.request('/cart/details');
  }

  async updateCartItem(itemId, quantity, size, color = {}, selectedImage = '') {
    return this.request(`/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, size: size.toLowerCase(), color, selectedImage }),
    });
  }

  async removeFromCart(productId, size = '', colorName = '') {
    const params = new URLSearchParams();
    if (size) params.append('size', size.toLowerCase());
    if (colorName) params.append('colorName', colorName);

    return this.request(`/cart/product/${productId}${params.toString() ? `?${params}` : ''}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart/clear', { method: 'DELETE' });
  }

  async validateCart() {
    return this.request('/cart/validate', { method: 'POST' });
  }

  // ========================================================================
  // GUEST CART APIs
  // ========================================================================
  async addToGuestCart(sessionId, productId, quantity = 1, size = 'M', color = {}, selectedImage = '') {
    return this.request(`/cart/guest/${sessionId}/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity, size: size.toLowerCase(), color, selectedImage }),
    });
  }

  async updateGuestCartItem(sessionId, itemId, quantity, size, color = {}, selectedImage = '') {
    return this.request(`/cart/guest/${sessionId}/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, size: size.toLowerCase(), color, selectedImage }),
    });
  }

  async removeFromGuestCart(sessionId, productId, size = '', colorName = '') {
    const params = new URLSearchParams();
    if (size) params.append('size', size.toLowerCase());
    if (colorName) params.append('colorName', colorName);

    return this.request(`/cart/guest/${sessionId}/product/${productId}${params.toString() ? `?${params}` : ''}`, {
      method: 'DELETE',
    });
  }

  async getGuestCart(sessionId) {
    return this.request(`/cart/guest/${sessionId}`);
  }

  async getGuestCartDetails(sessionId) {
    return this.request(`/cart/guest/${sessionId}/details`);
  }

  async mergeCart(sessionId) {
    return this.request('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ========================================================================
  // WISHLIST TO CART
  // ========================================================================
  async moveWishlistItemToCart(productId, quantity = 1, size = '', color = {}, selectedImage = '') {
    return this.request(`/wishlist/move-to-cart/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity, size, color, selectedImage }),
    });
  }

  // ========================================================================
  // SMART CART (AUTO HANDLING AUTH / GUEST)
  // ========================================================================
  async smartAddToCart(productId, quantity = 1, size = 'M', color = {}, selectedImage = '') {
    return this.isAuthenticated()
      ? this.addToCart(productId, quantity, size, color, selectedImage)
      : this.addToGuestCart(this.getSessionId(), productId, quantity, size, color, selectedImage);
  }

  async smartGetCartDetails() {
    return this.isAuthenticated() ? this.getCartDetails() : this.getGuestCartDetails(this.getSessionId());
  }

  async smartUpdateCartItem(itemId, quantity, size, color = {}, selectedImage = '') {
    return this.isAuthenticated()
      ? this.updateCartItem(itemId, quantity, size, color, selectedImage)
      : this.updateGuestCartItem(this.getSessionId(), itemId, quantity, size, color, selectedImage);
  }

  async smartRemoveFromCart(productId, size = '', colorName = '') {
    return this.isAuthenticated()
      ? this.removeFromCart(productId, size, colorName)
      : this.removeFromGuestCart(this.getSessionId(), productId, size, colorName);
  }

  async smartClearCart() {
    if (this.isAuthenticated()) return this.clearCart();
    localStorage.removeItem('guestSessionId');
    return { data: { items: [] } };
  }

  // ========================================================================
  // DISCOUNT APIs
  // ========================================================================
  async applyDiscount(code, type = 'coupon') {
    return this.request('/cart/apply-discount', {
      method: 'POST',
      body: JSON.stringify({ code, type }),
    });
  }

  async removeDiscount(type = 'all') {
    return this.request('/cart/remove-discount', {
      method: 'DELETE',
      body: JSON.stringify({ type }),
    });
  }

  async getDiscountByCode(code) {
    return this.request(`/discount/code/${code}`);
  }

  // ========================================================================
  // WISHLIST APIs
  // ========================================================================
  async createWishlist(name = 'My Wishlist', isPublic = false) {
    return this.request('/wishlist/create', {
      method: 'POST',
      body: JSON.stringify({ name, isPublic }),
    });
  }

  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId, priceWhenAdded) {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId, priceWhenAdded }),
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlist/remove/${productId}`, { method: 'DELETE' });
  }

  async toggleWishlistItem(productId, priceWhenAdded) {
    return this.request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId, priceWhenAdded }),
    });
  }

  async getWishlistCount() {
    return this.request('/wishlist/count');
  }

  async moveWishlistItemToCart(productId, quantity = 1, size = 'M', colorName = '', colorHex = '#000000', selectedImage = '') {
    return this.request(`/wishlist/move-to-cart/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity, size: size.toLowerCase(), colorName, colorHex, selectedImage }),
    });
  }

  async clearWishlist() {
    return this.request('/wishlist/clear', { method: 'DELETE' });
  }

  async checkWishlistItem(productId) {
    try {
      const response = await this.getWishlist();
      const exists = response.data?.items?.some(item => item.product === productId) || false;
      return { data: { exists } };
    } catch {
      return { data: { exists: false } };
    }
  }

  // ========================================================================
  // PAYMENT APIs
  // ========================================================================
  async initiatePayment(orderId, method = 'razorpay') {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, method }),
    });
  }

  async handlePaymentSuccess(razorpayData) {
    return this.request('/payments/success', {
      method: 'POST',
      body: JSON.stringify(razorpayData),
    });
  }

  async handlePaymentFailure(razorpayOrderId, razorpayPaymentId, failureReason) {
    return this.request('/payments/failure', {
      method: 'POST',
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, failureReason }),
    });
  }

  async verifyPayment(razorpayData) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(razorpayData),
    });
  }

  async getPaymentDetails(paymentId) {
    return this.request(`/payments/details/${paymentId}`);
  }

  async getPaymentByOrderId(orderId) {
    return this.request(`/payments/order/${orderId}`);
  }

  // ========================================================================
  // ORDER APIs
  // ========================================================================
  async createOrder(orderData) {
    return this.request('/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(page = 1, limit = 10) {
    return this.request(`/order?page=${page}&limit=${limit}`);
  }

  async getOrderById(orderId) {
    return this.request(`/order/${orderId}`);
  }

  async searchOrders(query, page = 1, limit = 10) {
    return this.request(`/order/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getOrderStats() {
    return this.request('/order/stats');
  }

  async cancelOrder(orderId, reason) {
    return this.request(`/order/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async returnOrder(orderId, reason) {
    return this.request(`/order/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ========================================================================
  // BLOG APIs
  // ========================================================================
  /**
   * Get all blogs
   * @returns {Promise} Promise with all blogs data
   */
  async getAllBlogs() {
    return this.request('/blog');
  }

  /**
   * Get a single blog by ID
   * @param {string} blogId - The ID of the blog to fetch
   * @returns {Promise} Promise with blog data
   */
  async getBlogById(blogId) {
    return this.request(`/blog/${blogId}`);
  }
  // ========================================================================
  // BANNER APIs
  // ========================================================================
  
  /**
   * Get all banners
   * @returns {Promise} Promise with all banners data
   */
  async getBanners() {
    return this.request('/banner');
  }
}

export const apiService = new ApiService();