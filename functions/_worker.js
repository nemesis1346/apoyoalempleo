/**
 * Main Cloudflare Workers entry point
 *
 * This worker handles all API requests with intelligent routing,
 * edge caching, and CORS support for the Apoyo al Empleo platform.
 *
 * Features:
 * - API request routing and authentication
 * - Edge caching for public endpoints
 * - Private caching for admin endpoints
 * - CORS handling for cross-origin requests
 * - JWT-based authentication and authorization
 *
 * @author Apoyo al Empleo Platform
 * @version 1.0.0
 */

// API route handlers
import { handleAuth } from "./api/auth.js";
import { handleAdminRequest } from "./api/admin/index.js";
import { handleCompaniesRequest } from "./api/companies/index.js";
import { handleUploadRequest } from "./api/upload.js";
import { handleContactsRequest } from "./api/contacts/index.js";

// Utilities
import { handleCORS, createResponse } from "./utils/cors.js";
import { verifyJWT } from "./utils/jwt.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // API routes
    if (path.startsWith("/api/")) {
      try {
        let response;

        // Authentication routes (public - cacheable for some endpoints)
        if (path.startsWith("/api/auth")) {
          response = await handleAuth(request, env);

          // Don't cache auth responses (sensitive data)
          return response;
        }

        // Admin routes (require authentication and admin role - some are cacheable)
        if (path.startsWith("/api/admin")) {
          response = await handleAdminRequest(request, env);

          // Ensure CORS headers are present on admin responses
          return response;
        }

        // Companies routes (public - highly cacheable)
        if (path.startsWith("/api/companies")) {
          // Cache logic is handled inside handleCompaniesRequest
          return await handleCompaniesRequest(request, env);
        }

        // Protected routes - require authentication
        const authResult = await verifyJWT(request, env);
        if (!authResult.valid) {
          return createResponse({ error: "Unauthorized" }, 401);
        }

        // Contacts routes (require authentication - some are cacheable)
        if (path.startsWith("/api/contacts")) {
          return await handleContactsRequest(request, env, authResult.payload);
        }

        // Upload routes (require authentication - not cacheable)
        if (path.startsWith("/api/upload")) {
          return await handleUploadRequest(
            request.method,
            request,
            env,
            authResult.payload,
          );
        }

        return createResponse({ error: "API endpoint not found" }, 404);
      } catch (error) {
        console.error("Worker error:", error);
        return createResponse(
          {
            error: "Internal server error",
            timestamp: new Date().toISOString(),
          },
          500,
        );
      }
    }

    // For non-API routes, let Next.js handle them
    return createResponse({ error: "Not found" }, 404);
  },
};

// Durable Objects removed for initial deployment
// Session management will use KV storage instead
