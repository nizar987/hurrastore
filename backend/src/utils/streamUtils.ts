/**
 * RxJS streaming utilities for Node.js backend real-time event handling
 */

import {
  Observable,
  Subject,
  BehaviorSubject,
  ReplaySubject,
  AsyncSubject,
  interval,
  timer,
  merge,
  combineLatest,
  zip,
  forkJoin,
  of,
  throwError,
  EMPTY,
  NEVER,
  defer,
  from,
  range,
  generate,
  iif,
  race,
  concat,
  switchMap,
  mergeMap,
  exhaustMap,
  concatMap,
  map,
  filter,
  tap,
  catchError,
  retry,
  retryWhen,
  delay,
  debounceTime,
  throttleTime,
  distinctUntilChanged,
  take,
  takeUntil,
  takeWhile,
  skip,
  skipUntil,
  skipWhile,
  buffer,
  bufferTime,
  bufferCount,
  bufferWhen,
  window,
  windowTime,
  windowCount,
  share,
  shareReplay,
  publish,
  multicast,
  refCount,
  finalize,
  startWith,
  endWith,
  scan,
  reduce,
  groupBy,
  partition,
  auditTime,
  sampleTime,
  timeout,
  timeoutWith,
  delayWhen,
  repeat,
  repeatWhen,
  expand,
  exhaust,
  mergeAll,
  concatAll,
  switchAll,
  combineAll,
  withLatestFrom,
  pairwise,
  pluck,
  mapTo,
  ignoreElements,
  elementAt,
  first,
  last,
  single,
  find,
  findIndex,
  isEmpty,
  defaultIfEmpty,
  every,
  count,
  max,
  min,
  reduce as reduceOperator,
  toArray
} from 'rxjs';
import { EventEmitter } from 'events';

// Event stream types
export interface StreamEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
  source?: string;
}

export interface StreamError {
  type: 'error';
  error: any;
  timestamp: number;
  id: string;
  source?: string;
}

// Stream manager for handling multiple event streams
export class StreamManager {
  private streams = new Map<string, Subject<any>>();
  private globalSubject = new Subject<StreamEvent>();
  private eventEmitter = new EventEmitter();

  createStream<T>(name: string): Subject<T> {
    if (this.streams.has(name)) {
      return this.streams.get(name)!;
    }

    const subject = new Subject<T>();
    this.streams.set(name, subject);

    // Subscribe to stream and forward to global subject
    subject.subscribe({
      next: (value) => {
        this.globalSubject.next({
          type: name,
          payload: value,
          timestamp: Date.now(),
          id: this.generateId(),
          source: 'stream'
        });
      },
      error: (error) => {
        this.globalSubject.next({
          type: 'error',
          payload: {
            stream: name,
            error,
            timestamp: Date.now(),
            id: this.generateId(),
            source: 'stream'
          },
          timestamp: Date.now(),
          id: this.generateId(),
          source: 'stream'
        });
      }
    });

    return subject;
  }

  getStream<T>(name: string): Observable<T> | undefined {
    return this.streams.get(name);
  }

  getGlobalStream(): Observable<StreamEvent> {
    return this.globalSubject.asObservable();
  }

  emit<T>(streamName: string, value: T): void {
    const stream = this.streams.get(streamName);
    if (stream) {
      stream.next(value);
    }
  }

  emitEvent(eventName: string, data: any): void {
    this.eventEmitter.emit(eventName, data);
    this.globalSubject.next({
      type: eventName,
      payload: data,
      timestamp: Date.now(),
      id: this.generateId(),
      source: 'event'
    });
  }

  onEvent(eventName: string): Observable<any> {
    return new Observable(subscriber => {
      const handler = (data: any) => subscriber.next(data);
      this.eventEmitter.on(eventName, handler);
      
      return () => {
        this.eventEmitter.off(eventName, handler);
      };
    });
  }

  complete(streamName: string): void {
    const stream = this.streams.get(streamName);
    if (stream) {
      stream.complete();
      this.streams.delete(streamName);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getStreamCount(): number {
    return this.streams.size;
  }

  getStreamNames(): string[] {
    return Array.from(this.streams.keys());
  }
}

// Real-time data streaming utilities
export class DataStreamer<T> {
  private subject = new BehaviorSubject<T[]>([]);
  private cache = new Map<string, T>();
  private updateInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    private fetchData: () => Promise<T[]>,
    private updateIntervalMs: number = 5000,
    private keyExtractor: (item: T) => string = (item: any) => item.id
  ) {
    this.startPolling();
  }

  get stream(): Observable<T[]> {
    return this.subject.asObservable();
  }

  get currentData(): T[] {
    return this.subject.value;
  }

  async refresh(): Promise<void> {
    try {
      const newData = await this.fetchData();
      this.updateCache(newData);
      this.subject.next(Array.from(this.cache.values()));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }

  addItem(item: T): void {
    const key = this.keyExtractor(item);
    this.cache.set(key, item);
    this.subject.next(Array.from(this.cache.values()));
  }

  updateItem(key: string, updates: Partial<T>): void {
    const existing = this.cache.get(key);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.cache.set(key, updated);
      this.subject.next(Array.from(this.cache.values()));
    }
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    this.subject.next(Array.from(this.cache.values()));
  }

  private startPolling(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.refresh();
    }, this.updateIntervalMs);
  }

  private updateCache(newData: T[]): void {
    newData.forEach(item => {
      const key = this.keyExtractor(item);
      this.cache.set(key, item);
    });
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
    this.isRunning = false;
  }

  destroy(): void {
    this.stop();
    this.subject.complete();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Database change stream
export class DatabaseChangeStream<T> {
  private changeSubject = new Subject<T>();
  private isRunning = false;
  private pollInterval?: NodeJS.Timeout;

  constructor(
    private fetchChanges: () => Promise<T[]>,
    private pollIntervalMs: number = 1000
  ) {}

  get changes(): Observable<T> {
    return this.changeSubject.asObservable();
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.pollInterval = setInterval(async () => {
      try {
        const changes = await this.fetchChanges();
        changes.forEach(change => this.changeSubject.next(change));
      } catch (error) {
        console.error('Database change stream error:', error);
      }
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    this.isRunning = false;
  }

  destroy(): void {
    this.stop();
    this.changeSubject.complete();
  }
}

// WebSocket-like real-time updates for server-sent events
export class ServerSentEventStream {
  private connections = new Map<string, Subject<any>>();
  private globalSubject = new Subject<any>();

  createConnection(connectionId: string): Subject<any> {
    const subject = new Subject<any>();
    this.connections.set(connectionId, subject);
    
    // Subscribe to global events
    const globalSub = this.globalSubject.subscribe(data => {
      subject.next(data);
    });

    // Cleanup on connection close
    subject.subscribe({
      complete: () => {
        globalSub.unsubscribe();
        this.connections.delete(connectionId);
      }
    });

    return subject;
  }

  broadcast(data: any): void {
    this.globalSubject.next(data);
  }

  sendToConnection(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.next(data);
    }
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }
}

// Search stream with debouncing
export class SearchStream<T> {
  private searchSubject = new Subject<string>();
  private resultsSubject = new BehaviorSubject<T[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private searchFunction: (query: string) => Promise<T[]>,
    private debounceMs: number = 300,
    private minQueryLength: number = 2
  ) {
    this.setupSearchPipeline();
  }

  search(query: string): void {
    this.searchSubject.next(query);
  }

  get results(): Observable<T[]> {
    return this.resultsSubject.asObservable();
  }

  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      filter(query => query.length >= this.minQueryLength),
      tap(() => this.loadingSubject.next(true)),
      switchMap(query => 
        from(this.searchFunction(query)).pipe(
          catchError(error => {
            console.error('Search error:', error);
            return of([]);
          }),
          finalize(() => this.loadingSubject.next(false))
        )
      )
    ).subscribe(results => {
      this.resultsSubject.next(results);
    });
  }
}

// Log streaming utility
export class LogStream {
  private logSubject = new Subject<LogEntry>();
  private logLevels = ['debug', 'info', 'warn', 'error'];

  constructor(private maxLogs: number = 1000) {}

  get logs(): Observable<LogEntry> {
    return this.logSubject.asObservable();
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  private log(level: string, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      id: this.generateId()
    };

    this.logSubject.next(logEntry);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export interface LogEntry {
  level: string;
  message: string;
  data?: any;
  timestamp: Date;
  id: string;
}

// Notification stream
export class NotificationStream {
  private notificationSubject = new Subject<Notification>();

  show(notification: Omit<Notification, 'id'>): void {
    this.notificationSubject.next({
      ...notification,
      id: this.generateId()
    });
  }

  get notifications(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  data?: any;
}

// Metrics streaming utility
export class MetricsStream {
  private metricsSubject = new Subject<Metric>();
  private metricsCache = new Map<string, Metric[]>();

  constructor(private maxMetricsPerType: number = 100) {}

  recordMetric(type: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      type,
      value,
      tags,
      timestamp: Date.now(),
      id: this.generateId()
    };

    this.metricsSubject.next(metric);

    // Cache metrics
    if (!this.metricsCache.has(type)) {
      this.metricsCache.set(type, []);
    }
    
    const metrics = this.metricsCache.get(type)!;
    metrics.push(metric);
    
    if (metrics.length > this.maxMetricsPerType) {
      metrics.shift();
    }
  }

  get metrics(): Observable<Metric> {
    return this.metricsSubject.asObservable();
  }

  getMetricsByType(type: string): Metric[] {
    return this.metricsCache.get(type) || [];
  }

  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metricsCache);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export interface Metric {
  type: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
  id: string;
}

// Health check stream
export class HealthCheckStream {
  private healthSubject = new BehaviorSubject<HealthStatus>({
    status: 'unknown',
    timestamp: Date.now(),
    checks: {}
  });

  constructor(private checkIntervalMs: number = 30000) {
    this.startHealthChecks();
  }

  get health(): Observable<HealthStatus> {
    return this.healthSubject.asObservable();
  }

  addHealthCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.healthChecks.set(name, checkFn);
  }

  private healthChecks = new Map<string, () => Promise<boolean>>();
  private interval?: NodeJS.Timeout;

  private startHealthChecks(): void {
    this.interval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.checkIntervalMs);
  }

  private async performHealthChecks(): Promise<void> {
    const checks: Record<string, boolean> = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    const entries = Array.from(this.healthChecks.entries());
    for (const [name, checkFn] of entries) {
      try {
        const result = await checkFn();
        checks[name] = result;
        if (!result) {
          overallStatus = 'unhealthy';
        }
      } catch (error) {
        checks[name] = false;
        overallStatus = 'unhealthy';
      }
    }

    this.healthSubject.next({
      status: overallStatus,
      timestamp: Date.now(),
      checks
    });
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  timestamp: number;
  checks: Record<string, boolean>;
}

// Utility functions for common stream operations
export const streamUtils = {
  // Create a stream from a promise
  fromPromise: <T>(promise: Promise<T>) => {
    return from(promise);
  },

  // Create a stream from an interval
  fromInterval: (period: number) => {
    return interval(period);
  },

  // Create a stream from a timer
  fromTimer: (dueTime: number, period?: number) => {
    return period ? timer(dueTime, period) : timer(dueTime);
  },

  // Merge multiple streams
  merge: <T>(...streams: Observable<T>[]) => {
    return merge(...streams);
  },

  // Combine latest values from multiple streams
  combineLatest: <T>(...streams: Observable<T>[]) => {
    return combineLatest(streams);
  },

  // Zip multiple streams
  zip: <T>(...streams: Observable<T>[]) => {
    return zip(...streams);
  },

  // Fork join (wait for all streams to complete)
  forkJoin: <T>(...streams: Observable<T>[]) => {
    return forkJoin(streams);
  }
};

// Global stream manager instance
export const globalStreamManager = new StreamManager();
