// src/utils/queryCache.js
// ✅ PHASE 3: Query Caching Layer for Data Loading Optimization
// In-memory cache với TTL (Time To Live) để giảm redundant queries

class QueryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.maxSize = 100; // Maximum cache entries
  }

  /**
   * Generate cache key from query parameters
   */
  generateKey(operation, params) {
    const paramsStr = JSON.stringify(params || {});
    return `${operation}:${paramsStr}`;
  }

  /**
   * Get cached result if available and not expired
   */
  get(operation, params) {
    const key = this.generateKey(operation, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Return cached data
    return entry.data;
  }

  /**
   * Set cache entry with TTL
   */
  set(operation, params, data, ttl = null) {
    const key = this.generateKey(operation, params);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
  }

  /**
   * Invalidate cache for specific operation
   */
  invalidate(operation, params = null) {
    if (params) {
      // Invalidate specific entry
      const key = this.generateKey(operation, params);
      this.cache.delete(key);
    } else {
      // Invalidate all entries for this operation
      const keysToDelete = [];
      for (const [key] of this.cache) {
        if (key.startsWith(`${operation}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(k => this.cache.delete(k));
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(k => this.cache.delete(k));
    return keysToDelete.length;
  }
}

// Singleton instance
const queryCache = new QueryCache();

// Auto-clean expired entries every minute
setInterval(() => {
  queryCache.cleanExpired();
}, 60 * 1000);

export default queryCache;
