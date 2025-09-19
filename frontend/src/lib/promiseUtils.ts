/**
 * High-performance Promise utilities for better async handling
 */

// Promise pool for concurrent execution with limits
export class PromisePool {
  private concurrency: number;
  private running: Set<Promise<any>> = new Set();

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  async add<T>(promiseFactory: () => Promise<T>): Promise<T> {
    if (this.running.size >= this.concurrency) {
      await Promise.race(this.running);
    }

    const promise = promiseFactory();
    this.running.add(promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.running.delete(promise);
    }
  }

  async all<T>(promiseFactories: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const factory of promiseFactories) {
      const result = await this.add(factory);
      results.push(result);
    }

    return results;
  }
}

// Retry mechanism with exponential backoff
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export async function retry<T>(
  promiseFactory: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = () => true
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await promiseFactory();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      await sleep(delay);
    }
  }

  throw lastError;
}

// Timeout wrapper for promises
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
}

// Debounced promise execution
export function debouncePromise<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number
): (...args: T) => Promise<R> {
  let timeoutId: NodeJS.Timeout;
  let lastPromise: Promise<R> | null = null;

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          if (lastPromise) {
            const result = await lastPromise;
            resolve(result);
          } else {
            lastPromise = fn(...args);
            const result = await lastPromise;
            lastPromise = null;
            resolve(result);
          }
        } catch (error) {
          lastPromise = null;
          reject(error);
        }
      }, delay);
    });
  };
}

// Throttled promise execution
export function throttlePromise<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  limit: number
): (...args: T) => Promise<R> {
  const queue: Array<{
    args: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  
  let running = 0;

  const processQueue = async () => {
    if (running >= limit || queue.length === 0) return;
    
    running++;
    const { args, resolve, reject } = queue.shift()!;
    
    try {
      const result = await fn(...args);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      running--;
      processQueue();
    }
  };

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      processQueue();
    });
  };
}

// Batch processing for arrays
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// Promise caching with TTL
export class PromiseCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  private ttl: number;

  constructor(ttlMs: number = 300000) { // 5 minutes default
    this.ttl = ttlMs;
  }

  async get(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    const value = await factory();
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    });

    return value;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Circuit breaker pattern
export class CircuitBreaker<T> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}

  async execute(promiseFactory: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await withTimeout(promiseFactory(), this.timeout);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Utility functions
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createResolvablePromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
} {
  let resolve: (value: T) => void;
  let reject: (error: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

// Promise.allSettled with better error handling
export async function allSettled<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: any }>> {
  return Promise.allSettled(promises);
}

// Sequential promise execution
export async function sequential<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i], i);
    results.push(result);
  }
  
  return results;
}

// Parallel promise execution with concurrency limit
export async function parallel<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const pool = new PromisePool(concurrency);
  return pool.all(items.map(item => () => processor(item)));
}
