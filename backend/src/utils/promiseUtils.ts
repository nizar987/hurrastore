/**
 * High-performance Promise utilities for Node.js backend
 */

import { performance } from 'perf_hooks';

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

  getRunningCount(): number {
    return this.running.size;
  }

  getConcurrency(): number {
    return this.concurrency;
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

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    });
  }

  getSync(key: string): T | undefined {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    return undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, value] of entries) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
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

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

// Database connection pool
export class DatabasePool {
  private pool: PromisePool;
  private cache: PromiseCache<any>;

  constructor(concurrency: number = 10, cacheTtl: number = 300000) {
    this.pool = new PromisePool(concurrency);
    this.cache = new PromiseCache(cacheTtl);
  }

  async execute<T>(
    query: string,
    params?: any[],
    useCache: boolean = true
  ): Promise<T> {
    const cacheKey = useCache ? `${query}:${JSON.stringify(params)}` : null;
    
    if (cacheKey) {
      const cached = this.cache.getSync(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return this.pool.add(async () => {
      // This would be replaced with actual database query
      const result = await this.executeQuery(query, params);
      
      if (cacheKey) {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    });
  }

  async query<T>(
    query: string,
    params?: any[],
    useCache: boolean = true
  ): Promise<T> {
    return this.execute(query, params, useCache);
  }

  private async executeQuery(query: string, params?: any[]): Promise<any> {
    // Placeholder for actual database execution
    // In real implementation, this would use your database client
    return { query, params, result: 'executed' };
  }

  async all<T>(promiseFactories: (() => Promise<T>)[]): Promise<T[]> {
    return this.pool.all(promiseFactories);
  }

  getPoolStats() {
    return {
      running: this.pool.getRunningCount(),
      concurrency: this.pool.getConcurrency(),
      cacheSize: this.cache.size()
    };
  }
}

// Rate limiter
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.checkLimit())) {
      await sleep(100);
    }
  }

  getStats() {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return {
      currentRequests: recentRequests.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      remainingRequests: Math.max(0, this.maxRequests - recentRequests.length)
    };
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

// Performance monitoring
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string = 'Async Operation'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label} took ${end - start} milliseconds`);
  return result;
}

export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Operation'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label} took ${end - start} milliseconds`);
  return result;
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

// Memory-efficient array operations
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Error handling utilities
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCounts = new Map<string, number>();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: any, context?: string): void {
    const errorKey = `${error.name}:${context || 'unknown'}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    console.error(`Error ${errorKey} (count: ${count + 1}):`, error.message);
  }

  getErrorStats(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  resetErrorStats(): void {
    this.errorCounts.clear();
  }
}
