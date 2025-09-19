/**
 * High Performance Backend Utilities Demo
 * Demonstrates the usage of all high-performance utilities
 */

import { 
  PromisePool, 
  retry, 
  withTimeout, 
  PromiseCache, 
  CircuitBreaker,
  RateLimiter,
  ErrorHandler,
  measureAsyncPerformance,
  measurePerformance,
  batchProcess,
  sequential,
  parallel,
  sleep
} from './utils/promiseUtils';

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
} from './utils/streamUtils';

import {
  productService,
  cartService,
  orderService,
  highPerformanceMiddleware
} from './services/HighPerformanceService';

// Demo 1: Promise Pool Performance
export async function demoPromisePool(): Promise<void> {
  console.log('🚀 Starting Promise Pool Demo...');
  
  const pool = new PromisePool(5); // 5 concurrent requests
  
  const requests = Array.from({ length: 20 }, (_, i) => () => 
    Promise.resolve({ id: i, data: `Request ${i}` })
  );

  const startTime = Date.now();
  const results = await pool.all(requests);
  const endTime = Date.now();
  
  console.log(`✅ Promise Pool completed: ${results.length} requests in ${endTime - startTime}ms`);
}

// Demo 2: Circuit Breaker
export async function demoCircuitBreaker(): Promise<void> {
  console.log('🔒 Starting Circuit Breaker Demo...');
  
  const circuitBreaker = new CircuitBreaker(3, 5000, 10000);
  
  const failingRequest = () => 
    Promise.reject(new Error('Simulated failure'));
  
  const successRequest = () => 
    Promise.resolve({ success: true });

  try {
    // Try failing requests to open circuit
    for (let i = 0; i < 5; i++) {
      try {
        await circuitBreaker.execute(failingRequest);
      } catch (error) {
        console.log(`❌ Request ${i + 1} failed as expected`);
      }
    }

    // Circuit should be open now
    try {
      await circuitBreaker.execute(successRequest);
    } catch (error) {
      console.log('✅ Circuit breaker opened successfully - requests blocked');
    }
  } catch (error) {
    console.error('❌ Circuit breaker demo error:', error);
  }
}

// Demo 3: Promise Cache
export async function demoPromiseCache(): Promise<void> {
  console.log('💾 Starting Promise Cache Demo...');
  
  const cache = new PromiseCache(10000); // 10 second TTL
  
  const expensiveOperation = async () => {
    await sleep(1000);
    return { data: 'Expensive operation result', timestamp: Date.now() };
  };

  const startTime = Date.now();
  
  // First call - should be slow
  const result1 = await cache.get('expensive-op', expensiveOperation);
  
  // Second call - should be fast (cached)
  const result2 = await cache.get('expensive-op', expensiveOperation);
  
  const endTime = Date.now();

  console.log(`✅ Cached operation completed in ${endTime - startTime}ms`);
  console.log(`📊 Cache hit: ${result1 === result2}`);
}

// Demo 4: Retry with Exponential Backoff
export async function demoRetry(): Promise<void> {
  console.log('🔄 Starting Retry Demo...');
  
  let attemptCount = 0;
  
  const flakyOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error(`Attempt ${attemptCount} failed`);
    }
    return { success: true, attempts: attemptCount };
  };

  try {
    const result = await retry(flakyOperation, {
      maxAttempts: 5,
      baseDelay: 500,
      backoffFactor: 2
    });

    console.log(`✅ Operation succeeded after ${result.attempts} attempts`);
  } catch (error) {
    console.error('❌ Retry demo failed:', error);
  }
}

// Demo 5: Performance Measurement
export async function demoPerformanceMeasurement(): Promise<void> {
  console.log('⏱️ Starting Performance Measurement Demo...');
  
  const expensiveSyncOperation = () => {
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  };

  const expensiveAsyncOperation = async () => {
    await sleep(100);
    return { async: true, timestamp: Date.now() };
  };

  // Measure sync operation
  const syncResult = measurePerformance(expensiveSyncOperation, 'Sync Operation');
  
  // Measure async operation
  const asyncResult = await measureAsyncPerformance(expensiveAsyncOperation, 'Async Operation');
  
  console.log('✅ Performance measurements completed - check console for details');
}

// Demo 6: Rate Limiter
export async function demoRateLimiter(): Promise<void> {
  console.log('🚦 Starting Rate Limiter Demo...');
  
  const rateLimiter = new RateLimiter(5, 10000); // 5 requests per 10 seconds
  
  const makeRequest = async (requestId: number) => {
    const allowed = await rateLimiter.checkLimit();
    if (allowed) {
      console.log(`✅ Request ${requestId} allowed`);
    } else {
      console.log(`❌ Request ${requestId} rate limited`);
    }
  };

  // Make multiple requests quickly
  const requests = Array.from({ length: 10 }, (_, i) => makeRequest(i + 1));
  await Promise.all(requests);

  const stats = rateLimiter.getStats();
  console.log('📊 Rate limiter stats:', stats);
}

// Demo 7: Data Streamer
export function demoDataStreamer(): void {
  console.log('📊 Starting Data Streamer Demo...');
  
  const fetchData = async () => {
    await sleep(500);
    return [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
      { id: 3, name: 'Product 3' }
    ];
  };

  const streamer = new DataStreamer(fetchData, 2000); // Update every 2 seconds
  
  const subscription = streamer.stream.subscribe(data => {
    console.log(`📊 Data streamer received ${data.length} items`);
  });

  // Stop after 10 seconds
  setTimeout(() => {
    subscription.unsubscribe();
    streamer.destroy();
    console.log('✅ Data streamer demo completed');
  }, 10000);
}

// Demo 8: Search Stream
export function demoSearchStream(): void {
  console.log('🔍 Starting Search Stream Demo...');
  
  const searchFunction = async (query: string) => {
    await sleep(300);
    return [
      { id: 1, name: `Search result for "${query}"` },
      { id: 2, name: `Another result for "${query}"` }
    ];
  };

  const searchStream = new SearchStream(searchFunction, 300, 2);
  
  const resultsSub = searchStream.results.subscribe(results => {
    console.log(`🔍 Search results: ${results.length} items`);
  });

  const loadingSub = searchStream.loading.subscribe(loading => {
    console.log(`⏳ Search loading: ${loading}`);
  });

  // Simulate search queries
  setTimeout(() => searchStream.search('laptop'), 1000);
  setTimeout(() => searchStream.search('phone'), 2000);
  setTimeout(() => searchStream.search('tablet'), 3000);

  // Stop after 5 seconds
  setTimeout(() => {
    resultsSub.unsubscribe();
    loadingSub.unsubscribe();
    console.log('✅ Search stream demo completed');
  }, 5000);
}

// Demo 9: Log Stream
export function demoLogStream(): void {
  console.log('📝 Starting Log Stream Demo...');
  
  const logStream = new LogStream();
  
  const sub = logStream.logs.subscribe(log => {
    console.log(`📝 Log: [${log.level.toUpperCase()}] ${log.message}`);
  });

  // Generate different types of logs
  logStream.debug('Debug message', { data: 'debug data' });
  logStream.info('Info message', { data: 'info data' });
  logStream.warn('Warning message', { data: 'warning data' });
  logStream.error('Error message', { error: 'error data' });

  // Stop after 2 seconds
  setTimeout(() => {
    sub.unsubscribe();
    console.log('✅ Log stream demo completed');
  }, 2000);
}

// Demo 10: Metrics Stream
export function demoMetricsStream(): void {
  console.log('📈 Starting Metrics Stream Demo...');
  
  const metricsStream = new MetricsStream();
  
  const sub = metricsStream.metrics.subscribe(metric => {
    console.log(`📈 Metric: ${metric.type} = ${metric.value}`, metric.tags);
  });

  // Record various metrics
  metricsStream.recordMetric('request_count', 1, { endpoint: '/api/products' });
  metricsStream.recordMetric('response_time', 150, { endpoint: '/api/products' });
  metricsStream.recordMetric('memory_usage', 512, { unit: 'MB' });
  metricsStream.recordMetric('cpu_usage', 25, { unit: 'percent' });

  // Stop after 2 seconds
  setTimeout(() => {
    sub.unsubscribe();
    console.log('✅ Metrics stream demo completed');
  }, 2000);
}

// Demo 11: Health Check Stream
export function demoHealthCheckStream(): void {
  console.log('🏥 Starting Health Check Stream Demo...');
  
  const healthStream = new HealthCheckStream(5000); // Check every 5 seconds
  
  // Add some health checks
  healthStream.addHealthCheck('database', async () => {
    // Simulate database check
    await sleep(100);
    return Math.random() > 0.2; // 80% success rate
  });

  healthStream.addHealthCheck('memory', async () => {
    const memoryUsage = process.memoryUsage();
    return memoryUsage.heapUsed < 1000 * 1024 * 1024; // Less than 1GB
  });

  const sub = healthStream.health.subscribe(health => {
    console.log(`🏥 Health status: ${health.status}`, health.checks);
  });

  // Stop after 15 seconds
  setTimeout(() => {
    sub.unsubscribe();
    healthStream.stop();
    console.log('✅ Health check stream demo completed');
  }, 15000);
}

// Demo 12: High-Performance Service
export async function demoHighPerformanceService(): Promise<void> {
  console.log('⚡ Starting High-Performance Service Demo...');
  
  try {
    // Test product service
    const products = await productService.getProducts({ page: 1, limit: 5 });
    console.log(`📦 Retrieved ${products.data.length} products`);

    // Test caching
    const startTime = Date.now();
    const cachedProducts = await productService.getProducts({ page: 1, limit: 5 });
    const endTime = Date.now();
    console.log(`💾 Cached products retrieved in ${endTime - startTime}ms`);

    // Test cart service
    const cart = await cartService.getCart('user123');
    console.log(`🛒 Cart has ${cart.items.length} items`);

    // Test order service
    const orders = await cartService.getCart('user123');
    console.log(`📋 Retrieved orders for user`);

    // Test health check
    const health = await productService.healthCheck();
    console.log(`🏥 Service health: ${health.status}`);

    console.log('✅ High-performance service demo completed');
  } catch (error) {
    console.error('❌ High-performance service demo failed:', error);
  }
}

// Demo 13: Stream Manager
export function demoStreamManager(): void {
  console.log('🎛️ Starting Stream Manager Demo...');
  
  const streamManager = new StreamManager();
  
  // Create streams
  const userStream = streamManager.createStream('user-updates');
  const orderStream = streamManager.createStream('order-updates');
  
  // Subscribe to global events
  const globalSub = streamManager.getGlobalStream().subscribe(event => {
    console.log(`🎛️ Global event: ${event.type} - ${JSON.stringify(event.payload)}`);
  });
  
  // Emit events
  userStream.next({ userId: 123, action: 'login' });
  orderStream.next({ orderId: 456, status: 'completed' });
  userStream.next({ userId: 123, action: 'logout' });
  
  // Stop after 3 seconds
  setTimeout(() => {
    globalSub.unsubscribe();
    streamManager.complete('user-updates');
    streamManager.complete('order-updates');
    console.log('✅ Stream manager demo completed');
  }, 3000);
}

// Demo 14: Batch Processing
export async function demoBatchProcessing(): Promise<void> {
  console.log('📦 Starting Batch Processing Demo...');
  
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
  
  const processor = async (item: any) => {
    await sleep(100); // Simulate processing
    return { ...item, processed: true, timestamp: Date.now() };
  };

  const startTime = Date.now();
  const results = await batchProcess(items, processor, 5); // Process 5 at a time
  const endTime = Date.now();

  console.log(`✅ Batch processed ${results.length} items in ${endTime - startTime}ms`);
}

// Run all demos
export async function runAllDemos(): Promise<void> {
  console.log('🎯 Starting High Performance Backend Utilities Demo Suite...\n');
  
  try {
    await demoPromisePool();
    console.log('');
    
    await demoCircuitBreaker();
    console.log('');
    
    await demoPromiseCache();
    console.log('');
    
    await demoRetry();
    console.log('');
    
    await demoPerformanceMeasurement();
    console.log('');
    
    await demoRateLimiter();
    console.log('');
    
    demoDataStreamer();
    console.log('');
    
    demoSearchStream();
    console.log('');
    
    demoLogStream();
    console.log('');
    
    demoMetricsStream();
    console.log('');
    
    demoHealthCheckStream();
    console.log('');
    
    await demoHighPerformanceService();
    console.log('');
    
    demoStreamManager();
    console.log('');
    
    await demoBatchProcessing();
    console.log('');
    
    console.log('🎉 All demos completed! Check the console output for results.');
  } catch (error) {
    console.error('❌ Demo suite failed:', error);
  }
}

// Export individual demos for selective testing
export const demos = {
  promisePool: demoPromisePool,
  circuitBreaker: demoCircuitBreaker,
  promiseCache: demoPromiseCache,
  retry: demoRetry,
  performanceMeasurement: demoPerformanceMeasurement,
  rateLimiter: demoRateLimiter,
  dataStreamer: demoDataStreamer,
  searchStream: demoSearchStream,
  logStream: demoLogStream,
  metricsStream: demoMetricsStream,
  healthCheckStream: demoHealthCheckStream,
  highPerformanceService: demoHighPerformanceService,
  streamManager: demoStreamManager,
  batchProcessing: demoBatchProcessing,
  runAll: runAllDemos
};

