/**
 * Enhanced Promise utilities for backend
 */

import { 
  PromisePool, 
  retry, 
  withTimeout, 
  PromiseCache, 
  CircuitBreaker,
  DatabasePool,
  RateLimiter,
  ErrorHandler,
  measureAsyncPerformance,
  measurePerformance,
  batchProcess,
  sequential,
  parallel,
  chunkArray,
  uniqueBy,
  sleep,
  createResolvablePromise
} from './promiseUtils';

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
  streamUtils,
  globalStreamManager
} from './streamUtils';

// Re-export all utilities for easy access
export {
  // Promise utilities
  PromisePool,
  retry,
  withTimeout,
  PromiseCache,
  CircuitBreaker,
  DatabasePool,
  RateLimiter,
  ErrorHandler,
  measureAsyncPerformance,
  measurePerformance,
  batchProcess,
  sequential,
  parallel,
  chunkArray,
  uniqueBy,
  sleep,
  createResolvablePromise,
  
  // Stream utilities
  StreamManager,
  DataStreamer,
  DatabaseChangeStream,
  ServerSentEventStream,
  SearchStream,
  LogStream,
  NotificationStream,
  MetricsStream,
  HealthCheckStream,
  streamUtils,
  globalStreamManager
};

// Performance monitoring utilities
export const performanceUtils = {
  measure: measurePerformance,
  measureAsync: measureAsyncPerformance,
  
  // Memory usage monitoring
  getMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100
    };
  },

  // CPU usage monitoring
  getCpuUsage: () => {
    const usage = process.cpuUsage();
    return {
      user: usage.user,
      system: usage.system
    };
  }
};

// Database utilities
export const databaseUtils = {
  // Create a database pool
  createPool: (concurrency: number = 10, cacheTtl: number = 300000) => {
    return new DatabasePool(concurrency, cacheTtl);
  },

  // Batch database operations
  batchExecute: async <T>(
    queries: Array<{ query: string; params?: any[] }>,
    concurrency: number = 5
  ): Promise<T[]> => {
    const pool = new DatabasePool(concurrency);
    return pool.all(queries.map(({ query, params }) => 
      () => pool.query(query, params)
    ));
  }
};

// API utilities
export const apiUtils = {
  // Create a rate limiter
  createRateLimiter: (maxRequests: number = 100, windowMs: number = 60000) => {
    return new RateLimiter(maxRequests, windowMs);
  },

  // Create a circuit breaker
  createCircuitBreaker: (threshold: number = 5, timeout: number = 60000, resetTimeout: number = 30000) => {
    return new CircuitBreaker(threshold, timeout, resetTimeout);
  },

  // Create a promise cache
  createCache: (ttlMs: number = 300000) => {
    return new PromiseCache(ttlMs);
  }
};

// Logging utilities
export const loggingUtils = {
  // Create a log stream
  createLogStream: () => {
    return new LogStream();
  },

  // Create a metrics stream
  createMetricsStream: () => {
    return new MetricsStream();
  }
};

// Health check utilities
export const healthUtils = {
  // Create a health check stream
  createHealthCheckStream: (checkIntervalMs: number = 30000) => {
    return new HealthCheckStream(checkIntervalMs);
  },

  // Add common health checks
  addCommonHealthChecks: (healthStream: HealthCheckStream) => {
    // Database health check
    healthStream.addHealthCheck('database', async () => {
      try {
        // Add your database health check here
        return true;
      } catch (error) {
        return false;
      }
    });

    // Memory health check
    healthStream.addHealthCheck('memory', async () => {
      const memoryUsage = performanceUtils.getMemoryUsage();
      return memoryUsage.heapUsed < 1000; // Less than 1GB
    });

    // CPU health check
    healthStream.addHealthCheck('cpu', async () => {
      const cpuUsage = performanceUtils.getCpuUsage();
      return cpuUsage.user < 1000000; // Arbitrary threshold
    });
  }
};

// Default instances for global use
export const defaultInstances = {
  streamManager: globalStreamManager,
  logStream: new LogStream(),
  metricsStream: new MetricsStream(),
  notificationStream: new NotificationStream(),
  healthStream: new HealthCheckStream(),
  errorHandler: ErrorHandler.getInstance()
};

// Initialize default health checks
healthUtils.addCommonHealthChecks(defaultInstances.healthStream);