import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

export async function handleJobsRequest(method, jobId, request, env, user) {
  const cache = new CloudflareCache(env);

  // Handle caching for GET requests
  if (method === "GET") {
    // Generate cache key that includes user context for security
    const url = new URL(request.url);
    const cacheKey = `${
      url.pathname
    }?${url.searchParams.toString()}&user_role=${user.role}&company_id=${
      user.company_id || "all"
    }`;

    // Try cache first for GET requests
    const cached = await cache.get(request, cacheKey);
    if (cached) {
      return cached;
    }

    // Get fresh data
    let response;
    if (jobId) {
      response = await getJob(jobId, env, user);
    } else {
      response = await getJobs(env, user, url);
    }

    // Cache successful responses with shorter TTL for admin data
    if (response.status === 200) {
      const cacheSettings = {
        maxAge: 180, // 3 minutes browser cache
        sMaxAge: 600, // 10 minutes edge cache
        staleWhileRevalidate: 1200, // 20 minutes stale allowed
        publicCache: false, // Private cache for admin data
      };
      response = await cache.put(request, response, {
        ...cacheSettings,
        customKey: cacheKey,
      });
    }

    return response;
  }

  // Handle non-GET requests (with cache invalidation)
  let response;
  switch (method) {
    case "POST":
      response = await createJob(request, env, user);
      if (response.status === 200 || response.status === 201) {
        await invalidateJobsCache(cache, user, env);
      }
      break;
    case "PUT":
      response = await updateJob(jobId, request, env, user);
      if (response.status === 200) {
        await invalidateJobsCache(cache, user, env, jobId);
      }
      break;
    case "DELETE":
      response = await deleteJob(jobId, env, user);
      if (response.status === 200) {
        await invalidateJobsCache(cache, user, env, jobId);
      }
      break;
    default:
      return createResponse({ error: "Method not allowed" }, 405);
  }

  return response;
}

// Job CRUD implementations
async function getJobs(env, user, url) {
  try {
    const params = new URLSearchParams(url?.search || "");
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "20");
    const search = params.get("search") || "";
    const company_id = params.get("company_id") || "";
    const employment_type = params.get("employment_type") || "";

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (user.role === "company_admin") {
      whereConditions.push("j.company_id = ?");
      queryParams.push(user.company_id);
    }

    // Search filtering
    if (search) {
      const searchUnits = search
        .split(/\s*,\s*/)
        .map((term) => term.trim())
        .filter((term) => term.length > 0);
      if (searchUnits.length > 0) {
        const searchConditions = searchUnits.map(
          () => "(j.title LIKE ? OR j.employment_type LIKE ? OR c.name LIKE ?)",
        );
        whereConditions.push(`(${searchConditions.join(" OR ")})`);

        // Add parameters for each search term
        searchUnits.forEach((term) => {
          const searchTerm = `%${term}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        });
      }
    }

    // Company filtering (for super admin)
    if (company_id && user.role === "super_admin") {
      whereConditions.push("j.company_id = ?");
      queryParams.push(company_id);
    }

    // Employment type filtering
    if (employment_type) {
      whereConditions.push("j.employment_type = ?");
      queryParams.push(employment_type);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
    `);
    const { total } = await countStmt.bind(...queryParams).first();

    // Get paginated results
    const stmt = env.DB.prepare(`
      SELECT j.*, c.name as company_name, c.logo_url as company_logo_url, c.color as company_color
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const { results } = await stmt.bind(...queryParams, limit, offset).all();

    // Parse location JSON arrays in results
    const jobs = results.map((job) => {
      const { company_logo_url, company_color, company_name, ...jobItem } = job;
      return {
        ...jobItem,
        location: job.location ? JSON.parse(job.location) : [],
        company: {
          name: company_name,
          logo_url: company_logo_url,
          color: company_color,
        },
      };
    });

    const totalPages = Math.ceil(total / limit);

    return createResponse({
      success: true,
      data: jobs,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return createResponse({ error: "Failed to fetch jobs" }, 500);
  }
}

async function createJob(request, env, user) {
  try {
    const data = await request.json();

    // Company admin can only create jobs for their company
    if (user.role === "company_admin" && data.company_id != user.company_id) {
      return createResponse({ error: "Access denied" }, 403);
    }

    // Validate required fields
    if (!data.company_id || !data.title) {
      return createResponse({ error: "Company and title are required" }, 400);
    }

    // Validate location array
    let locationJson = "[]";
    if (data.location) {
      if (Array.isArray(data.location)) {
        // Validate each location value
        const validLocations = [
          "Mexico",
          "Peru",
          "Argentina",
          "Chile",
          "Colombia",
          "Ecuador",
          "Uruguay",
        ];
        const invalidLocations = data.location.filter(
          (loc) => !validLocations.includes(loc),
        );
        if (invalidLocations.length > 0) {
          return createResponse(
            {
              error: `Invalid locations: ${invalidLocations.join(
                ", ",
              )}. Valid options are: ${validLocations.join(", ")}`,
            },
            400,
          );
        }
        locationJson = JSON.stringify(data.location);
      } else {
        return createResponse({ error: "Location must be an array" }, 400);
      }
    }

    const stmt = env.DB.prepare(`
      INSERT INTO jobs (company_id, title, employment_type, location, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = await stmt
      .bind(
        data.company_id,
        data.title,
        data.employment_type || null,
        locationJson,
        data.description || null,
      )
      .run();

    return createResponse(
      {
        success: true,
        data: {
          id: result.meta.last_row_id,
          ...data,
          location: data.location || [],
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create job error:", error);
    return createResponse(
      {
        error: "Failed to create job",
        details: error.message,
      },
      500,
    );
  }
}

async function getJob(jobId, env, user) {
  try {
    const stmt = env.DB.prepare(`
      SELECT j.*, c.name as company_name, c.logo_url as company_logo_url, c.color as company_color
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
    `);

    const job = await stmt.bind(jobId).first();

    if (!job) {
      return createResponse({ error: "Job not found" }, 404);
    }

    // Company admin can only view their company's jobs
    if (user.role === "company_admin" && job.company_id !== user.company_id) {
      return createResponse({ error: "Access denied" }, 403);
    }

    // Parse location JSON array
    const { company_logo_url, company_color, company_name, ...jobItem } = job;
    job.location = job.location ? JSON.parse(job.location) : [];
    job.company = {
      name: company_name,
      logo_url: company_logo_url,
      color: company_color,
    };
    delete job.company_logo_url;
    delete job.company_color;
    delete job.company_name;

    return createResponse({ success: true, data: job });
  } catch (error) {
    console.error("Get job error:", error);
    return createResponse({ error: "Failed to fetch job" }, 500);
  }
}

async function updateJob(jobId, request, env, user) {
  try {
    const data = await request.json();

    // Check if job exists and user has permission
    const existingJob = await env.DB.prepare(
      "SELECT company_id FROM jobs WHERE id = ?",
    )
      .bind(jobId)
      .first();

    if (!existingJob) {
      return createResponse({ error: "Job not found" }, 404);
    }

    // Company admin can only update their company's jobs
    if (
      user.role === "company_admin" &&
      existingJob.company_id !== user.company_id
    ) {
      return createResponse({ error: "Access denied" }, 403);
    }

    // Validate required fields
    if (!data.title) {
      return createResponse({ error: "Title is required" }, 400);
    }

    // Validate location array
    let locationJson = "[]";
    if (data.location) {
      if (Array.isArray(data.location)) {
        // Validate each location value
        const validLocations = [
          "Mexico",
          "Peru",
          "Argentina",
          "Chile",
          "Colombia",
          "Ecuador",
          "Uruguay",
        ];
        const invalidLocations = data.location.filter(
          (loc) => !validLocations.includes(loc),
        );
        if (invalidLocations.length > 0) {
          return createResponse(
            {
              error: `Invalid locations: ${invalidLocations.join(
                ", ",
              )}. Valid options are: ${validLocations.join(", ")}`,
            },
            400,
          );
        }
        locationJson = JSON.stringify(data.location);
      } else {
        return createResponse({ error: "Location must be an array" }, 400);
      }
    }

    const stmt = env.DB.prepare(`
      UPDATE jobs 
      SET title = ?, employment_type = ?, location = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = await stmt
      .bind(
        data.title,
        data.employment_type || null,
        locationJson,
        data.description || null,
        jobId,
      )
      .run();

    if (result.changes === 0) {
      return createResponse({ error: "Job not found" }, 404);
    }

    return createResponse({
      success: true,
      data: {
        id: jobId,
        ...data,
        location: data.location || [],
      },
    });
  } catch (error) {
    console.error("Update job error:", error);
    return createResponse(
      {
        error: "Failed to update job",
        details: error.message,
      },
      500,
    );
  }
}

async function deleteJob(jobId, env, user) {
  try {
    // Check if job exists and user has permission
    const existingJob = await env.DB.prepare(
      "SELECT company_id FROM jobs WHERE id = ?",
    )
      .bind(jobId)
      .first();

    if (!existingJob) {
      return createResponse({ error: "Job not found" }, 404);
    }

    // Company admin can only delete their company's jobs
    if (
      user.role === "company_admin" &&
      existingJob.company_id !== user.company_id
    ) {
      return createResponse({ error: "Access denied" }, 403);
    }

    const stmt = env.DB.prepare("DELETE FROM jobs WHERE id = ?");
    const result = await stmt.bind(jobId).run();

    if (result.changes === 0) {
      return createResponse({ error: "Job not found" }, 404);
    }

    return createResponse({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return createResponse(
      {
        error: "Failed to delete job",
        details: error.message,
      },
      500,
    );
  }
}

// Cache invalidation helper for jobs
async function invalidateJobsCache(cache, user, env, jobId = null) {
  try {
    // Get job details if jobId provided to invalidate related caches
    let companyId = null;
    if (jobId) {
      const job = await env.DB.prepare(
        "SELECT company_id FROM jobs WHERE id = ?",
      )
        .bind(jobId)
        .first();
      companyId = job?.company_id;
    }

    // Patterns to invalidate
    const patterns = [
      `/api/admin/jobs`, // Jobs list
      `/api/admin/jobs/${jobId}`, // Specific job
      `/api/companies/slugs`, // Public companies (might include job counts)
    ];

    // Add company-specific patterns if we have a company ID
    if (companyId) {
      patterns.push(`/api/admin/jobs?company_id=${companyId}`);
    }

    // Add user-role specific patterns
    if (user.role === "company_admin" && user.company_id) {
      patterns.push(`/api/admin/jobs?company_id=${user.company_id}`);
    }

    // Delete cache entries (simple approach - in practice you'd use cache tags)
    for (const pattern of patterns) {
      const testUrl = new URL(`https://example.com${pattern}`);
      const testRequest = new Request(testUrl.toString());
      await cache.delete(testRequest);
    }

    // Cache invalidation completed
  } catch (error) {
    console.error("Cache invalidation error for jobs:", error);
    // Don't fail the main operation if cache invalidation fails
  }
}
