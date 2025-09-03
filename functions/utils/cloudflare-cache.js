/**
 * Cloudflare Cache API utility for edge caching
 *
 * This utility provides global edge caching across Cloudflare's 275+ locations,
 * optimized for LATAM performance with smart cache headers and CORS support.
 *
 * Features:
 * - Edge caching with configurable TTL
 * - CORS header preservation and enforcement
 * - ETag generation for cache validation
 * - Geographic region tracking
 * - Stale-while-revalidate support
 *
 * @author Apoyo al Empleo Platform
 * @version 1.0.0
 */

export class CloudflareCache {
  constructor(env) {
    this.env = env;
    this.cache = caches.default;
  }

  /**
   * Generate a cache key for consistent caching
   */
  generateCacheKey(request, customKey = null) {
    if (customKey) {
      const url = new URL(request.url);
      url.pathname = customKey;
      return new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
      });
    }
    return new Request(request.url, request);
  }

  /**
   * Get cached response
   */
  async get(request, customKey = null) {
    try {
      const cacheKey = this.generateCacheKey(request, customKey);
      const cached = await this.cache.match(cacheKey);

      if (cached) {
        // Preserve all existing headers (including CORS)
        const existingHeaders = {};
        for (const [key, value] of cached.headers.entries()) {
          existingHeaders[key] = value;
        }

        // Create response with all headers preserved
        const response = new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: {
            ...existingHeaders,
            "X-Cache-Status": "HIT",
            "X-Cache-Date":
              cached.headers.get("X-Cache-Date") || new Date().toISOString(),
          },
        });

        return response;
      }

      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Store response in cache with proper headers
   */
  async put(request, response, options = {}) {
    try {
      const cacheKey = this.generateCacheKey(request, options.customKey);

      // Default cache settings optimized for LATAM
      const defaultOptions = {
        maxAge: 300, // 5 minutes browser cache
        sMaxAge: 1800, // 30 minutes edge cache
        staleWhileRevalidate: 3600, // 1 hour stale content allowed
        publicCache: true,
      };

      const settings = { ...defaultOptions, ...options };

      // Preserve all existing headers (including CORS)
      const existingHeaders = {};
      for (const [key, value] of response.headers.entries()) {
        existingHeaders[key] = value;
      }

      // Clone response and add proper cache headers
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          // Keep all existing headers (including CORS from createResponse)
          ...existingHeaders,
          // Add/override cache headers
          "Cache-Control": this.buildCacheControl(settings),
          "CDN-Cache-Control": `max-age=${settings.sMaxAge}`,
          "X-Cache-Status": "MISS",
          "X-Cache-Date": new Date().toISOString(),
          "X-Cache-Region": request.cf?.colo || "unknown",
          ETag: `"${this.generateETag(response)}"`,
          "Last-Modified": new Date().toUTCString(),
        },
      });

      // Store in Cloudflare's edge cache
      await this.cache.put(cacheKey, cachedResponse.clone());

      return cachedResponse;
    } catch (error) {
      console.error("Cache put error:", error);
      return response; // Return original response if caching fails
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(request, customKey = null) {
    try {
      const cacheKey = this.generateCacheKey(request, customKey);
      return await this.cache.delete(cacheKey);
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  /**
   * Build cache control header
   */
  buildCacheControl(options) {
    const parts = [];

    if (options.publicCache) {
      parts.push("public");
    } else {
      parts.push("private");
    }

    if (options.maxAge) {
      parts.push(`max-age=${options.maxAge}`);
    }

    if (options.sMaxAge) {
      parts.push(`s-maxage=${options.sMaxAge}`);
    }

    if (options.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    if (options.noStore) {
      parts.push("no-store");
    }

    if (options.noCache) {
      parts.push("no-cache");
    }

    return parts.join(", ");
  }

  /**
   * Generate ETag for cache validation
   */
  generateETag(response) {
    const content =
      typeof response.body === "string"
        ? response.body
        : JSON.stringify(response.body);
    const hash = this.simpleHash(content);
    return `cf-${hash}`;
  }

  /**
   * Simple hash function for ETag generation
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request/response should be cached
   */
  shouldCache(request, response) {
    // Only cache GET requests
    if (request.method !== "GET") return false;

    // Only cache successful responses
    if (response.status < 200 || response.status >= 300) return false;

    // Don't cache if response has no-cache header
    const cacheControl = response.headers.get("cache-control");
    if (cacheControl && cacheControl.includes("no-cache")) return false;

    return true;
  }

  /**
   * Get cache settings for different endpoint types
   */
  getCacheSettings(endpoint) {
    const settings = {
      // Public data - cache aggressively
      companies: { maxAge: 900, sMaxAge: 3600, staleWhileRevalidate: 7200 },
      "companies/slugs": {
        maxAge: 1800,
        sMaxAge: 7200,
        staleWhileRevalidate: 14400,
      },

      // Semi-static data
      jobs: { maxAge: 300, sMaxAge: 1800, staleWhileRevalidate: 3600 },
      contacts: { maxAge: 600, sMaxAge: 1800, staleWhileRevalidate: 3600 },

      // Search results - shorter cache
      search: { maxAge: 180, sMaxAge: 900, staleWhileRevalidate: 1800 },

      // Default settings
      default: { maxAge: 300, sMaxAge: 1800, staleWhileRevalidate: 3600 },
    };

    return settings[endpoint] || settings["default"];
  }
}
