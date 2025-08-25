"use client";

import { useState, useEffect, useCallback } from 'react';

// Advanced Cache Management for better performance

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
  version?: string;
  size?: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string;
  maxSize?: number; // Maximum number of items
  compression?: boolean;
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private memoryThreshold = 50 * 1024 * 1024; // 50MB
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
    this.setupMemoryMonitoring();
  }

  // Set item in cache
  set<T>(key: string, data: T, options: CacheOptions = {}): boolean {
    try {
      const now = Date.now();
      const item: CacheItem<T> = {
        data,
        timestamp: now,
        expiry: options.ttl ? now + options.ttl : undefined,
        version: options.version,
        size: this.calculateSize(data),
      };

      // Check memory limits
      if (this.shouldEvict(item.size || 0)) {
        this.evictLRU();
      }

      this.cache.set(key, item);
      return true;
    } catch (error) {
      console.error('[Cache] Failed to set item:', key, error);
      return false;
    }
  }

  // Get item from cache
  get<T>(key: string, options: { version?: string } = {}): T | null {
    try {
      const item = this.cache.get(key);
      if (!item) return null;

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      // Check version
      if (options.version && item.version !== options.version) {
        this.cache.delete(key);
        return null;
      }

      // Update timestamp for LRU
      item.timestamp = Date.now();
      return item.data as T;
    } catch (error) {
      console.error('[Cache] Failed to get item:', key, error);
      return null;
    }
  }

  // Remove item from cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const items = Array.from(this.cache.values());
    const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
    const expiredCount = items.filter(item => 
      item.expiry && Date.now() > item.expiry
    ).length;

    return {
      itemCount: this.cache.size,
      totalSize,
      expiredCount,
      hitRate: this.getHitRate(),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  // Cache with fallback function
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    try {
      // Execute fallback function
      const data = await fallbackFn();
      
      // Store in cache
      this.set(key, data, options);
      
      return data;
    } catch (error) {
      console.error('[Cache] Fallback function failed:', key, error);
      throw error;
    }
  }

  // Batch operations
  setMany<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): boolean[] {
    return items.map(({ key, data, options }) => this.set(key, data, options));
  }

  getMany<T>(keys: string[], options: { version?: string } = {}): Array<T | null> {
    return keys.map(key => this.get<T>(key, options));
  }

  // Private methods
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Default size estimate
    }
  }

  private shouldEvict(newItemSize: number): boolean {
    const currentSize = this.getTotalCacheSize();
    return currentSize + newItemSize > this.memoryThreshold;
  }

  private getTotalCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, item) => sum + (item.size || 0), 0);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('[Cache] Evicted LRU item:', oldestKey);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[Cache] Cleaned up ${cleanedCount} expired items`);
    }
  }

  private getHitRate(): number {
    // This would need to be tracked with counters
    return 0.85; // Placeholder
  }

  private getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return 0;
  }

  private setupMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor memory pressure
    const checkMemoryPressure = () => {
      const stats = this.getStats();
      if (stats.totalSize > this.memoryThreshold * 0.8) {
        console.warn('[Cache] High memory usage, triggering cleanup');
        this.evictLRU();
      }
    };

    setInterval(checkMemoryPressure, 30000); // Check every 30 seconds
  }

  // Destroy cache manager
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// IndexedDB cache for larger data
class IndexedDBCache {
  private dbName = 'monopol-stone-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create stores
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiry', 'expiry');
        }
      };
    });
  }

  async set(key: string, data: any, ttl?: number): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const item = {
        key,
        data,
        timestamp: Date.now(),
        expiry: ttl ? Date.now() + ttl : null,
      };

      const request = store.put(item);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        if (!item) {
          resolve(null);
          return;
        }

        // Check expiry
        if (item.expiry && Date.now() > item.expiry) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(item.data);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instances
export const memoryCache = new CacheManager();
export const persistentCache = new IndexedDBCache();

// Utility functions
export const createCacheKey = (...parts: string[]): string => {
  return parts.join(':');
};

export const getCacheVersion = (): string => {
  return '1.0.0'; // This should match your app version
};

// Cache decorators for functions
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    version?: string;
  } = {}
): T {
  const cache = memoryCache;
  
  return ((...args: Parameters<T>) => {
    const key = options.keyGenerator 
      ? options.keyGenerator(...args)
      : `${fn.name}:${JSON.stringify(args)}`;

    return cache.getOrSet(key, () => fn(...args), {
      ttl: options.ttl,
      version: options.version,
    });
  }) as T;
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await memoryCache.getOrSet(key, fetcher, options);
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, fetcher, options]);

  const refetch = useCallback(() => {
    memoryCache.delete(key);
    // Trigger re-fetch by updating the key
  }, [key]);

  return { data, loading, error, refetch };
}

export default { memoryCache, persistentCache, withCache, useCachedData };