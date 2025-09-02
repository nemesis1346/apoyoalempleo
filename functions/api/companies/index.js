import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

export async function handleCompaniesRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const cache = new CloudflareCache(env);

  // Extract resource info
  const resource = pathParts[2]; // /api/companies/{resource}
  const resourceId = pathParts[3]; // /api/companies/{resource}/{id}

  // Try cache first for GET requests
  if (method === "GET") {
    const cached = await cache.get(request);
    if (cached) {
      return cached; // Already has cache headers set
    }
  }

  try {
    let response;

    switch (resource) {
      case "slugs":
        response = await getCompaniesSlugs(env);
        break;
      default:
        return createResponse({ error: "Resource not found" }, 404);
    }

    // Cache successful GET responses
    if (method === "GET" && response.status === 200) {
      const cacheSettings = cache.getCacheSettings("companies/slugs");
      response = await cache.put(request, response, cacheSettings);
    }

    return response;
  } catch (error) {
    console.error("Companies API error:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}

async function getCompaniesSlugs(env) {
  try {
    const stmt = env.DB.prepare(`
      SELECT name FROM companies
    `);
    const { results } = await stmt.all();
    const slugs = results.map((result) =>
      result.name.toLowerCase().replace(/ /g, "-"),
    );
    return createResponse({ success: true, data: slugs });
  } catch (error) {
    return createResponse({ error: "Internal server error" }, 500);
  }
}
