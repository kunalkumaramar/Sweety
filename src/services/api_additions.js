  // ========================================================================
  // CART APIs
  // ========================================================================
  export default class ApiService {
  async addToCart(productId, quantity = 1, size = 'M', color = {}, selectedImage = '') {
  try {
    const response = await this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        size,
        color,
        selectedImage
      }),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
    }
  }

  async moveWishlistItemToCart(productId, quantity = 1, size = 'M', color = {}, selectedImage = '') {
    try {
      // First add to cart
      const cartResponse = await this.addToCart(productId, quantity, size, color, selectedImage);
      
      if (cartResponse.success) {
        // Then remove from wishlist
        await this.removeFromWishlist(productId);
        return { success: true };
      } else {
        throw new Error(cartResponse.error || 'Failed to add item to cart');
      }
      } catch (error) {
        throw new Error(error.message || 'Failed to move item to cart');
      }
    }
  }