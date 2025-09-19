/**
 * High-Performance Service for backend operations
 */

import { Request, Response, NextFunction } from 'express';
import { Observable, Subject } from 'rxjs';
import { 
  PromisePool, 
  retry, 
  withTimeout, 
  PromiseCache, 
  CircuitBreaker,
  RateLimiter,
  ErrorHandler,
  measureAsyncPerformance,
  batchProcess,
  sequential,
  parallel,
  sleep
} from '../utils/promiseUtils';

import {
  StreamManager,
  DataStreamer,
  DatabaseChangeStream,
  ServerSentEventStream,
  SearchStream,
  LogStream,
  NotificationStream,
  MetricsStream,
  HealthCheckStream,
  globalStreamManager
} from '../utils/streamUtils';

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId: string;
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

// High-performance service base class
export class HighPerformanceService {
  protected cache: PromiseCache<any>;
  protected circuitBreaker: CircuitBreaker<any>;
  protected rateLimiter: RateLimiter;
  protected errorHandler: ErrorHandler;
  protected metricsStream: MetricsStream;
  protected logStream: LogStream;

  constructor(
    cacheTtl: number = 300000,
    circuitBreakerThreshold: number = 5,
    rateLimitMaxRequests: number = 100,
    rateLimitWindowMs: number = 60000
  ) {
    this.cache = new PromiseCache(cacheTtl);
    this.circuitBreaker = new CircuitBreaker(circuitBreakerThreshold);
    this.rateLimiter = new RateLimiter(rateLimitMaxRequests, rateLimitWindowMs);
    this.errorHandler = ErrorHandler.getInstance();
    this.metricsStream = new MetricsStream();
    this.logStream = new LogStream();
  }

  // Generic cached operation
  async executeCached<T>(
    key: string,
    operation: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    if (!useCache) {
      return this.circuitBreaker.execute(() => operation());
    }

    return this.cache.get(key, () => 
      this.circuitBreaker.execute(() => operation())
    );
  }

  // Rate-limited operation
  async executeRateLimited<T>(operation: () => Promise<T>): Promise<T> {
    await this.rateLimiter.waitForSlot();
    return operation();
  }

  // Timed operation with metrics
  async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.metricsStream.recordMetric('operation_duration', duration, {
        operation: operationName,
        status: 'success'
      });
      
      this.logStream.info(`Operation ${operationName} completed`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.metricsStream.recordMetric('operation_duration', duration, {
        operation: operationName,
        status: 'error'
      });
      
      this.errorHandler.handleError(error, operationName);
      throw error;
    }
  }

  // Batch operations
  async executeBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    concurrency: number = 5
  ): Promise<R[]> {
    return batchProcess(items, processor, batchSize);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; metrics: any }> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      status: 'healthy',
      metrics: {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100
        },
        cpu: cpuUsage,
        cache: {
          size: this.cache.size()
        },
        rateLimiter: this.rateLimiter.getStats(),
        circuitBreaker: {
          state: this.circuitBreaker.getState(),
          failureCount: this.circuitBreaker.getFailureCount()
        }
      }
    };
  }
}

// Product service with high-performance features
export class ProductService extends HighPerformanceService {
  private productStream: DataStreamer<any>;
  private productSearchStream: SearchStream<any>;

  constructor() {
    super(600000, 3, 200, 60000); // 10min cache, 3 failures, 200 req/min
    
    // Initialize product data stream
    this.productStream = new DataStreamer(
      () => this.fetchAllProducts(),
      30000, // Update every 30 seconds
      (product: any) => product.id
    );

    // Initialize product search stream
    this.productSearchStream = new SearchStream(
      (query: string) => this.searchProducts(query),
      300, // 300ms debounce
      2 // minimum 2 characters
    );
  }

  // Get products with caching and streaming
  async getProducts(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const cacheKey = `products:${JSON.stringify(options)}`;
    
    return this.executeCached(cacheKey, async () => {
      return this.executeWithMetrics(async () => {
        // Simulate database query
        await sleep(100);
        
        const products = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: Math.random() * 1000,
          category: ['Electronics', 'Clothing', 'Books'][i % 3],
          description: `Description for product ${i + 1}`
        }));

        // Apply filters
        let filteredProducts = products;
        if (options.category) {
          filteredProducts = filteredProducts.filter(p => p.category === options.category);
        }
        if (options.search) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(options.search!.toLowerCase())
          );
        }

        // Pagination
        const page = options.page || 1;
        const limit = options.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return {
          data: paginatedProducts,
          pagination: {
            page,
            limit,
            total: filteredProducts.length,
            pages: Math.ceil(filteredProducts.length / limit),
            hasNext: endIndex < filteredProducts.length,
            hasPrev: page > 1
          }
        };
      }, 'getProducts');
    });
  }

  // Get product by ID with caching
  async getProduct(id: string): Promise<any> {
    const cacheKey = `product:${id}`;
    
    return this.executeCached(cacheKey, async () => {
      return this.executeWithMetrics(async () => {
        await sleep(50);
        return {
          id,
          name: `Product ${id}`,
          price: Math.random() * 1000,
          category: 'Electronics',
          description: `Description for product ${id}`
        };
      }, 'getProduct');
    });
  }

  // Get product stream for real-time updates
  getProductStream(): Observable<any[]> {
    return this.productStream.stream;
  }

  // Search products with debouncing
  async searchProducts(query: string): Promise<any[]> {
    return this.performSearch(query);
  }

  // Get search results stream
  getSearchResults(): Observable<any[]> {
    return this.productSearchStream.results;
  }

  // Get search loading state
  getSearchLoading(): Observable<boolean> {
    return this.productSearchStream.loading;
  }

  // Create product (admin only)
  async createProduct(productData: any): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(200);
      return {
        id: Date.now(),
        ...productData,
        createdAt: new Date()
      };
    }, 'createProduct');
  }

  // Update product (admin only)
  async updateProduct(id: string, productData: any): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(150);
      return {
        id,
        ...productData,
        updatedAt: new Date()
      };
    }, 'updateProduct');
  }

  // Delete product (admin only)
  async deleteProduct(id: string): Promise<void> {
    return this.executeWithMetrics(async () => {
      await sleep(100);
      // Simulate deletion
    }, 'deleteProduct');
  }

  // Batch operations
  async batchUpdateProducts(updates: Array<{ id: string; data: any }>): Promise<any[]> {
    return this.executeBatch(updates, async ({ id, data }) => {
      return this.updateProduct(id, data);
    }, 5, 3);
  }

  private async fetchAllProducts(): Promise<any[]> {
    // Simulate fetching all products from database
    await sleep(500);
    return Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: Math.random() * 1000,
      category: ['Electronics', 'Clothing', 'Books'][i % 3]
    }));
  }

  async performSearch(query: string): Promise<any[]> {
    // Simulate search operation
    await sleep(200);
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Search result ${i + 1} for "${query}"`,
      price: Math.random() * 1000
    }));
  }
}

// Cart service with high-performance features
export class CartService extends HighPerformanceService {
  private cartStream: DataStreamer<any>;

  constructor() {
    super(300000, 5, 300, 60000); // 5min cache, 5 failures, 300 req/min
    
    this.cartStream = new DataStreamer(
      () => this.fetchCart(),
      10000, // Update every 10 seconds
      (item: any) => item.id
    );
  }

  // Get cart with caching
  async getCart(userId: string): Promise<any> {
    const cacheKey = `cart:${userId}`;
    
    return this.executeCached(cacheKey, async () => {
      return this.executeWithMetrics(async () => {
        await sleep(50);
        return {
          userId,
          items: [
            { id: 1, productId: 1, quantity: 2, price: 100 },
            { id: 2, productId: 2, quantity: 1, price: 200 }
          ],
          total: 400
        };
      }, 'getCart');
    });
  }

  // Get cart stream for real-time updates
  getCartStream(): Observable<any[]> {
    return this.cartStream.stream;
  }

  // Add to cart
  async addToCart(userId: string, productId: string, quantity: number): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(100);
      return {
        userId,
        productId,
        quantity,
        addedAt: new Date()
      };
    }, 'addToCart');
  }

  // Update cart item
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(80);
      return {
        userId,
        itemId,
        quantity,
        updatedAt: new Date()
      };
    }, 'updateCartItem');
  }

  // Remove from cart
  async removeFromCart(userId: string, itemId: string): Promise<void> {
    return this.executeWithMetrics(async () => {
      await sleep(60);
      // Simulate removal
    }, 'removeFromCart');
  }

  private async fetchCart(): Promise<any[]> {
    await sleep(100);
    return [
      { id: 1, productId: 1, quantity: 2, price: 100 },
      { id: 2, productId: 2, quantity: 1, price: 200 }
    ];
  }
}

// Order service with high-performance features
export class OrderService extends HighPerformanceService {
  private orderStream: DataStreamer<any>;

  constructor() {
    super(600000, 3, 100, 60000); // 10min cache, 3 failures, 100 req/min
    
    this.orderStream = new DataStreamer(
      () => this.fetchOrders(),
      60000, // Update every minute
      (order: any) => order.id
    );
  }

  // Get orders with caching
  async getOrders(userId: string): Promise<any[]> {
    const cacheKey = `orders:${userId}`;
    
    return this.executeCached(cacheKey, async () => {
      return this.executeWithMetrics(async () => {
        await sleep(150);
        return [
          { id: 1, userId, status: 'completed', total: 400, createdAt: new Date() },
          { id: 2, userId, status: 'pending', total: 200, createdAt: new Date() }
        ];
      }, 'getOrders');
    });
  }

  // Get order stream for real-time updates
  getOrderStream(): Observable<any[]> {
    return this.orderStream.stream;
  }

  // Create order
  async createOrder(userId: string, orderData: any): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(300);
      return {
        id: Date.now(),
        userId,
        ...orderData,
        status: 'pending',
        createdAt: new Date()
      };
    }, 'createOrder');
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    return this.executeWithMetrics(async () => {
      await sleep(100);
      return {
        id: orderId,
        status,
        updatedAt: new Date()
      };
    }, 'updateOrderStatus');
  }

  private async fetchOrders(): Promise<any[]> {
    await sleep(200);
    return [
      { id: 1, status: 'completed', total: 400 },
      { id: 2, status: 'pending', total: 200 }
    ];
  }
}

// Express middleware for high-performance features
export class HighPerformanceMiddleware {
  private rateLimiter: RateLimiter;
  private metricsStream: MetricsStream;

  constructor() {
    this.rateLimiter = new RateLimiter(1000, 60000); // 1000 requests per minute
    this.metricsStream = new MetricsStream();
  }

  // Rate limiting middleware
  rateLimit() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (!(await this.rateLimiter.checkLimit())) {
        this.metricsStream.recordMetric('rate_limit_exceeded', 1, { clientId });
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          timestamp: Date.now()
        });
      }

      next();
    };
  }

  // Performance monitoring middleware
  performanceMonitoring() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substr(2, 9);

      // Add request ID to request object
      (req as any).requestId = requestId;

      // Override res.json to capture response time
      const originalJson = res.json;
      res.json = function(data: any) {
        const duration = Date.now() - startTime;
        
        // Record metrics
        const metricsStream = new MetricsStream();
        metricsStream.recordMetric('request_duration', duration, {
          method: req.method,
          path: req.path,
          status: res.statusCode.toString()
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }

  // Error handling middleware
  errorHandling() {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(error, req.path);

      const requestId = (req as any).requestId || 'unknown';
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId,
        timestamp: Date.now()
      });
    };
  }
}

// Service instances
export const productService = new ProductService();
export const cartService = new CartService();
export const orderService = new OrderService();
export const highPerformanceMiddleware = new HighPerformanceMiddleware();
