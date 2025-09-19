/**
 * High-performance API service using promises and RxJS streams
 */

import { Observable, Subject, BehaviorSubject, from, throwError, of } from 'rxjs';
import { 
  switchMap, 
  catchError, 
  retry, 
  debounceTime, 
  distinctUntilChanged,
  shareReplay,
  finalize,
  tap,
  map,
  filter
} from 'rxjs/operators';
import { 
  PromiseCache, 
  retry as retryPromise, 
  withTimeout, 
  CircuitBreaker,
  PromisePool 
} from './promiseUtils';
import { StreamManager, DataStreamer, SearchStream } from './streamUtils';
import api from './api';

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// High-performance API service
export class HighPerformanceApiService {
  private cache = new PromiseCache<any>(300000); // 5 minutes
  private circuitBreaker = new CircuitBreaker(5, 10000, 30000);
  private promisePool = new PromisePool(10);
  private streamManager = new StreamManager();

  // Generic GET with caching and circuit breaker
  async get<T>(url: string, options?: any): Promise<T> {
    const cacheKey = `GET:${url}:${JSON.stringify(options)}`;
    
    return this.cache.get(cacheKey, () =>
      this.circuitBreaker.execute(() =>
        withTimeout(
          api.get(url, options).then(response => response.data),
          10000,
          'Request timeout'
        )
      )
    );
  }

  // Generic POST with retry logic
  async post<T>(url: string, data: any, options?: any): Promise<T> {
    return retryPromise(
      () => withTimeout(
        api.post(url, data, options).then(response => response.data),
        15000,
        'Request timeout'
      ),
      {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error) => error.response?.status >= 500
      }
    );
  }

  // Generic PUT with retry logic
  async put<T>(url: string, data: any, options?: any): Promise<T> {
    return retryPromise(
      () => withTimeout(
        api.put(url, data, options).then(response => response.data),
        15000,
        'Request timeout'
      ),
      {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error) => error.response?.status >= 500
      }
    );
  }

  // Generic DELETE
  async delete<T>(url: string, options?: any): Promise<T> {
    return withTimeout(
      api.delete(url, options).then(response => response.data),
      10000,
      'Request timeout'
    );
  }

  // Batch operations
  async batchGet<T>(requests: Array<{ url: string; options?: any }>): Promise<T[]> {
    return this.promisePool.all(
      requests.map(req => () => this.get<T>(req.url, req.options))
    );
  }

  // Stream-based data fetching
  createDataStream<T>(
    url: string,
    updateInterval: number = 5000,
    keyExtractor: (item: T) => string = (item: any) => item.id
  ): Observable<T[]> {
    const fetchData = () => this.get<T[]>(url);
    const streamer = new DataStreamer(fetchData, updateInterval, keyExtractor);
    
    return streamer.stream.pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Data stream error:', error);
        return of([]);
      })
    );
  }

  // Real-time search stream
  createSearchStream<T>(
    searchUrl: string,
    debounceMs: number = 300
  ): { search: (query: string) => void; results: Observable<T[]>; loading: Observable<boolean> } {
    const searchFunction = (query: string) => 
      this.get<T[]>(`${searchUrl}?search=${encodeURIComponent(query)}`);
    
    const searchStream = new SearchStream(searchFunction, debounceMs);
    
    return {
      search: (query: string) => searchStream.search(query),
      results: searchStream.results,
      loading: searchStream.loading
    };
  }

  // WebSocket-like real-time updates
  createRealtimeStream<T>(url: string): Observable<T> {
    const subject = this.streamManager.createStream<T>('realtime');
    
    // Polling-based real-time updates
    const pollInterval = setInterval(async () => {
      try {
        const data = await this.get<T>(url);
        subject.next(data);
      } catch (error) {
        console.error('Realtime stream error:', error);
      }
    }, 2000);

    // Cleanup on unsubscribe
    return subject.pipe(
      finalize(() => {
        clearInterval(pollInterval);
        this.streamManager.complete('realtime');
      })
    );
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern: string): void {
    // Simple pattern matching for cache invalidation
    // In a real implementation, you'd want more sophisticated pattern matching
    console.log(`Cache invalidation requested for pattern: ${pattern}`);
  }
}

// Product-specific high-performance API
export class ProductApiService extends HighPerformanceApiService {
  // Get products with streaming updates
  getProductsStream(updateInterval: number = 10000): Observable<any[]> {
    return this.createDataStream('/products', updateInterval);
  }

  // Search products with debounced input
  createProductSearchStream() {
    return this.createSearchStream('/products');
  }

  // Get product with caching
  async getProduct(id: string): Promise<any> {
    return this.get(`/products/${id}`);
  }

  // Get products with pagination
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    return this.get('/products', { params });
  }

  // Get featured products
  async getFeaturedProducts(): Promise<any[]> {
    return this.get('/products/featured');
  }

  // Get bestseller products
  async getBestsellerProducts(): Promise<any[]> {
    return this.get('/products/bestsellers');
  }

  // Get new arrival products
  async getNewArrivalProducts(): Promise<any[]> {
    return this.get('/products/new-arrivals');
  }

  // Create product (admin only)
  async createProduct(productData: any): Promise<any> {
    return this.post('/products', productData);
  }

  // Update product (admin only)
  async updateProduct(id: string, productData: any): Promise<any> {
    return this.put(`/products/${id}`, productData);
  }

  // Delete product (admin only)
  async deleteProduct(id: string): Promise<void> {
    return this.delete(`/products/${id}`);
  }

  // Batch operations
  async batchUpdateProducts(updates: Array<{ id: string; data: any }>): Promise<any[]> {
    const requests = updates.map(update => ({
      url: `/products/${update.id}`,
      options: { data: update.data }
    }));
    return this.batchGet(requests);
  }
}

// Cart-specific high-performance API
export class CartApiService extends HighPerformanceApiService {
  // Get cart with real-time updates
  getCartStream(): Observable<any> {
    return this.createRealtimeStream('/cart');
  }

  // Get cart
  async getCart(): Promise<any> {
    return this.get('/cart');
  }

  // Add to cart
  async addToCart(data: { productId: string; quantity: number }): Promise<any> {
    return this.post('/cart/add', data);
  }

  // Update cart item
  async updateCartItem(itemId: string, quantity: number): Promise<any> {
    return this.put(`/cart/update/${itemId}`, { quantity });
  }

  // Remove from cart
  async removeFromCart(itemId: string): Promise<void> {
    return this.delete(`/cart/remove/${itemId}`);
  }

  // Clear cart
  async clearCart(): Promise<void> {
    return this.delete('/cart/clear');
  }
}

// Order-specific high-performance API
export class OrderApiService extends HighPerformanceApiService {
  // Get orders with streaming updates
  getOrdersStream(): Observable<any[]> {
    return this.createDataStream('/orders');
  }

  // Get orders
  async getOrders(): Promise<any[]> {
    return this.get('/orders');
  }

  // Get order
  async getOrder(id: string): Promise<any> {
    return this.get(`/orders/${id}`);
  }

  // Create order
  async createOrder(orderData: any): Promise<any> {
    return this.post('/orders/create', orderData);
  }

  // Cancel order
  async cancelOrder(id: string): Promise<void> {
    return this.put(`/orders/${id}/cancel`, {});
  }
}

// Auth-specific high-performance API
export class AuthApiService extends HighPerformanceApiService {
  // Login
  async login(credentials: { email: string; password: string }): Promise<any> {
    return this.post('/auth/login', credentials);
  }

  // Register
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<any> {
    return this.post('/auth/register', userData);
  }

  // Get current user
  async getCurrentUser(): Promise<any> {
    return this.get('/auth/me');
  }
}

// Global API service instances
export const productApi = new ProductApiService();
export const cartApi = new CartApiService();
export const orderApi = new OrderApiService();
export const authApi = new AuthApiService();

// Export the base service for custom implementations
// HighPerformanceApiService is already exported above
