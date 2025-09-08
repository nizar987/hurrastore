import api from './api';
import { Product } from './products';

export interface CartItem {
  id: string;
  quantity: number;
  userId: string;
  productId: string;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  total: string;
}

export const cartAPI = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (data: {
    productId: string;
    quantity: number;
  }): Promise<{ item: CartItem; message: string }> => {
    const response = await api.post('/cart/add', data);
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<{ item: CartItem; message: string }> => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};
