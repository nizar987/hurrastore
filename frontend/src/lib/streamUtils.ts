/**
 * RxJS streaming utilities for real-time event handling
 */

import {
  Observable,
  Subject,
  BehaviorSubject,
  ReplaySubject,
  AsyncSubject,
  fromEvent,
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
import { ajax } from 'rxjs/ajax';

// Event stream types
export interface StreamEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
}

export interface StreamError {
  type: 'error';
  error: any;
  timestamp: number;
  id: string;
}

// Stream manager for handling multiple event streams
export class StreamManager {
  private streams = new Map<string, Subject<any>>();
  private globalSubject = new Subject<StreamEvent>();

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
          id: this.generateId()
        });
      },
      error: (error) => {
        this.globalSubject.next({
          type: 'error',
          payload: {
            stream: name,
            error,
            timestamp: Date.now(),
            id: this.generateId()
          },
          timestamp: Date.now(),
          id: this.generateId()
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
}

// Real-time data streaming utilities
export class DataStreamer<T> {
  private subject = new BehaviorSubject<T[]>([]);
  private cache = new Map<string, T>();
  private updateInterval?: NodeJS.Timeout;

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

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.subject.complete();
  }
}

// WebSocket streaming utility
export class WebSocketStream {
  private socket?: WebSocket;
  private messageSubject = new Subject<any>();
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private url: string,
    private protocols?: string | string[]
  ) {}

  connect(): Observable<any> {
    return new Observable(observer => {
      try {
        this.socket = new WebSocket(this.url, this.protocols);

        this.socket.onopen = () => {
          this.connectionSubject.next(true);
          this.reconnectAttempts = 0;
          observer.next({ type: 'connected' });
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageSubject.next(data);
            observer.next({ type: 'message', data });
          } catch (error) {
            observer.next({ type: 'message', data: event.data });
          }
        };

        this.socket.onclose = (event) => {
          this.connectionSubject.next(false);
          observer.next({ type: 'disconnected', code: event.code });
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          observer.error(error);
        };

      } catch (error) {
        observer.error(error);
      }

      return () => {
        this.disconnect();
      };
    });
  }

  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  get messages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  get connectionStatus(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect().subscribe();
    }, delay);
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

// Form validation stream
export class FormValidationStream {
  private validationSubject = new Subject<{ field: string; value: any }>();
  private errorsSubject = new BehaviorSubject<Record<string, string>>({});
  private validSubject = new BehaviorSubject<boolean>(true);

  constructor(
    private validators: Record<string, (value: any) => string | null>
  ) {
    this.setupValidationPipeline();
  }

  validate(field: string, value: any): void {
    this.validationSubject.next({ field, value });
  }

  get errors(): Observable<Record<string, string>> {
    return this.errorsSubject.asObservable();
  }

  get isValid(): Observable<boolean> {
    return this.validSubject.asObservable();
  }

  private setupValidationPipeline(): void {
    this.validationSubject.pipe(
      debounceTime(300),
      map(({ field, value }) => {
        const validator = this.validators[field];
        const error = validator ? validator(value) : null;
        return { field, error };
      }),
      scan((errors, { field, error }) => {
        if (error) {
          return { ...errors, [field]: error };
        } else {
          const { [field]: _, ...rest } = errors;
          return rest;
        }
      }, {} as Record<string, string>)
    ).subscribe(errors => {
      this.errorsSubject.next(errors);
      this.validSubject.next(Object.keys(errors).length === 0);
    });
  }
}

// Notification stream
export class NotificationStream {
  private notificationSubject = new Subject<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>();

  show(notification: Omit<Parameters<typeof this.notificationSubject.next>[0], 'id'>): void {
    this.notificationSubject.next({
      ...notification,
      id: this.generateId()
    });
  }

  get notifications(): Observable<Parameters<typeof this.notificationSubject.next>[0]> {
    return this.notificationSubject.asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Utility functions for common stream operations
export const streamUtils = {
  // Create a stream from an API endpoint
  fromApi: <T>(url: string, options?: any) => {
    return ajax.getJSON<T>(url, options).pipe(
      catchError(error => throwError(error))
    );
  },

  // Create a stream from a promise
  fromPromise: <T>(promise: Promise<T>) => {
    return from(promise);
  },

  // Create a stream from an event
  fromEvent: <T>(target: EventTarget, eventName: string) => {
    return fromEvent(target, eventName) as Observable<T>;
  },

  // Create a stream from an interval
  fromInterval: (period: number) => {
    return interval(period);
  },

  // Create a stream from a timer
  fromTimer: (dueTime: number, period?: number) => {
    return timer(dueTime, period);
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
