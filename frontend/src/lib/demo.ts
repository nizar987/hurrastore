/**
 * High Performance Utilities Demo
 * Demonstrates the usage of all high-performance utilities
 */

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { 
  promiseUtils, 
  reactiveUtils, 
  measurePerformance, 
  measureAsyncPerformance 
} from './utils';
import { 
  PromisePool, 
  retry, 
  withTimeout, 
  CircuitBreaker,
  PromiseCache 
} from './promiseUtils';
import { 
  StreamManager, 
  DataStreamer, 
  SearchStream,
  NotificationStream 
} from './streamUtils';
import { productApi, cartApi } from './highPerformanceApi';

// Demo 1: Promise Pool Performance
export async function demoPromisePool(): Promise<void> {
  console.log('🚀 Starting Promise Pool Demo...');
  
  const pool = new PromisePool(5); // 5 concurrent requests
  
  const requests = Array.from({ length: 10 }, (_, i) => () => 
    Promise.resolve({ id: i, data: `Request ${i}` })
  );

  const startTime = performance.now();
  const results = await pool.all(requests);
  const endTime = performance.now();
  
  console.log(`✅ Promise Pool completed: ${results.length} requests in ${(endTime - startTime).toFixed(2)}ms`);
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: 'Expensive operation result', timestamp: Date.now() };
  };

  const startTime = performance.now();
  
  // First call - should be slow
  const result1 = await cache.get('expensive-op', expensiveOperation);
  
  // Second call - should be fast (cached)
  const result2 = await cache.get('expensive-op', expensiveOperation);
  
  const endTime = performance.now();

  console.log(`✅ Cached operation completed in ${(endTime - startTime).toFixed(2)}ms`);
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
    await new Promise(resolve => setTimeout(resolve, 100));
    return { async: true, timestamp: Date.now() };
  };

  // Measure sync operation
  const syncResult = measurePerformance(expensiveSyncOperation, 'Sync Operation');
  
  // Measure async operation
  const asyncResult = await measureAsyncPerformance(expensiveAsyncOperation, 'Async Operation');
  
  console.log('✅ Performance measurements completed - check console for details');
}

// Demo 6: Reactive Streams
export function demoReactiveStreams(): void {
  console.log('📡 Starting Reactive Streams Demo...');
  
  const subject = reactiveUtils.createSubject<number>();
  const behaviorSubject = reactiveUtils.createBehaviorSubject(0);

  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    subject.next(counter);
    behaviorSubject.next(counter);
  }, 1000);

  // Subscribe to streams
  const sub1 = subject.subscribe(value => {
    console.log(`📤 Subject emitted: ${value}`);
  });

  const sub2 = behaviorSubject.subscribe(value => {
    console.log(`📤 BehaviorSubject emitted: ${value}`);
  });

  // Stop after 5 seconds
  setTimeout(() => {
    clearInterval(interval);
    sub1.unsubscribe();
    sub2.unsubscribe();
    subject.complete();
    behaviorSubject.complete();
    console.log('✅ Reactive streams demo completed');
  }, 5000);
}

// Demo 7: Data Streamer
export function demoDataStreamer(): void {
  console.log('📊 Starting Data Streamer Demo...');
  
  const fetchData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
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
    // Simulate search API call
    await new Promise(resolve => setTimeout(resolve, 300));
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

// Demo 9: Notification Stream
export function demoNotificationStream(): void {
  console.log('🔔 Starting Notification Stream Demo...');
  
  const notificationStream = new NotificationStream();
  
  const sub = notificationStream.notifications.subscribe(notification => {
    console.log(`🔔 Notification: ${notification.message} (${notification.type})`);
  });

  // Show different types of notifications
  notificationStream.show({
    type: 'success',
    message: 'Operation completed successfully!',
    duration: 3000
  });

  setTimeout(() => {
    notificationStream.show({
      type: 'error',
      message: 'Something went wrong',
      duration: 5000
    });
  }, 1000);

  setTimeout(() => {
    notificationStream.show({
      type: 'warning',
      message: 'Please check your input',
      duration: 4000
    });
  }, 2000);

  setTimeout(() => {
    notificationStream.show({
      type: 'info',
      message: 'Information message',
      duration: 3000
    });
  }, 3000);

  // Stop after 8 seconds
  setTimeout(() => {
    sub.unsubscribe();
    console.log('✅ Notification stream demo completed');
  }, 8000);
}

// Demo 10: Stream Manager
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

// Run all demos
export async function runAllDemos(): Promise<void> {
  console.log('🎯 Starting High Performance Utilities Demo Suite...\n');
  
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
    
    demoReactiveStreams();
    console.log('');
    
    demoDataStreamer();
    console.log('');
    
    demoSearchStream();
    console.log('');
    
    demoNotificationStream();
    console.log('');
    
    demoStreamManager();
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
  reactiveStreams: demoReactiveStreams,
  dataStreamer: demoDataStreamer,
  searchStream: demoSearchStream,
  notificationStream: demoNotificationStream,
  streamManager: demoStreamManager,
  runAll: runAllDemos
};
