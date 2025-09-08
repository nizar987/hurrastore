import api from './api';
import { Product } from './products';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const ordersAPI = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: {
    shippingAddress: string;
  }): Promise<{ order: Order; message: string }> => {
    const response = await api.post('/orders/create', data);
    return response.data;
  },

  cancelOrder: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin only
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<{ order: Order; message: string }> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};
