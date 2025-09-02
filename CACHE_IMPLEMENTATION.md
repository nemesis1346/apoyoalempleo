# Cache Implementation Documentation

## Overview

This document describes the edge caching implementation for the Apoyo al Empleo platform, designed for optimal performance across LATAM markets.

## Architecture

### Edge Caching Layer
- **Technology**: Cloudflare Cache API
- **Coverage**: 275+ global edge locations
- **LATAM Presence**: São Paulo, Mexico City, Buenos Aires, Santiago, Lima, Bogotá

### Cache Strategy

| Endpoint Type | Browser Cache | Edge Cache | Stale While Revalidate |
|---------------|---------------|------------|------------------------|
| Public Companies | 15 min | 30 min | 1 hour |
| Admin Jobs | 3 min | 10 min | 20 min |
| Admin Companies | 5 min | 15 min | 30 min |
| Admin Contacts | 4 min | 12 min | 24 min |

## Features

### 1. CORS-Aware Caching
- All cached responses preserve CORS headers
- Cross-origin requests work seamlessly
- Automatic CORS enforcement on cache hits

### 2. Role-Based Cache Keys
- User role included in cache keys for security
- Company-specific caching for `company_admin` users
- Isolated cache entries prevent data leakage

### 3. Smart Cache Invalidation
- Automatic invalidation on data updates
- Cross-entity invalidation (e.g., company updates invalidate related jobs)
- Graceful fallback if invalidation fails

### 4. Performance Monitoring
- Cache hit/miss tracking via `X-Cache-Status` header
- Geographic region identification via `X-Cache-Region`
- Cache timestamp tracking for debugging

## Implementation Details

### Cache Utility (`functions/utils/cloudflare-cache.js`)
- `CloudflareCache` class for consistent caching
- ETag generation for cache validation
- Configurable TTL settings per endpoint type

### CORS Integration (`functions/utils/cors.js`)
- Standardized CORS headers for all responses
- Automatic header preservation in cached content
- Preflight request handling

### API Integration
- Transparent caching in admin endpoints
- No changes required in frontend code
- Backward compatibility maintained

## Performance Benefits

### Expected Improvements
- **80-95% faster** response times for cached content
- **Sub-100ms** responses from LATAM edge locations
- **60-80% reduction** in database calls
- **Improved mobile performance** across all LATAM countries

### Monitoring
```javascript
// Check cache performance in browser console
console.log('Cache Status:', response.headers.get('X-Cache-Status'));
console.log('Cache Region:', response.headers.get('X-Cache-Region'));
```

## Security Considerations

### Private Data Protection
- Admin endpoints use private caching (`Cache-Control: private`)
- User context included in cache keys
- No public caching of sensitive data

### Cache Isolation
- Different cache keys for different user roles
- Company-specific data isolation
- Cross-tenant data protection

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure all responses include CORS headers
2. **Stale Data**: Check cache invalidation logic
3. **Cache Misses**: Verify cache key generation

### Debug Headers
- `X-Cache-Status`: HIT/MISS status
- `X-Cache-Date`: When content was cached
- `X-Cache-Region`: Which edge location served the request

## Future Enhancements

### Planned Features
- KV-based application caching (Step 2)
- Real-time cache warming
- Advanced cache analytics
- Geographic cache optimization

---

**Version**: 1.0.0  
**Last Updated**: Step 1 Implementation Complete  
**Author**: Apoyo al Empleo Platform Team
