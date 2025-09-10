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
    // const cached = await cache.get(request, cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get fresh data
    let response;
    if (jobId) {
      response = await getJob(jobId, env, user);
    } else {
      response = await getJobs(env, user, url);
    }

    return response;

    // // Cache successful responses with shorter TTL for admin data
    // if (response.status === 200) {
    //   const cacheSettings = {
    //     maxAge: 180, // 3 minutes browser cache
    //     sMaxAge: 600, // 10 minutes edge cache
    //     staleWhileRevalidate: 1200, // 20 minutes stale allowed
    //     publicCache: false, // Private cache for admin data
    //   };
    //   response = await cache.put(request, response, {
    //     ...cacheSettings,
    //     customKey: cacheKey,
    //   });
    // }

    // return response;
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

    // Get chip templates for each job
    const jobIds = results.map(job => job.id);
    let chipTemplates = {};
    
    if (jobIds.length > 0) {
      // Debug: Check what tables exist
      try {
        const tablesStmt = env.DB.prepare(`
          SELECT name FROM sqlite_master WHERE type='table' AND (name='job_chip_templates' OR name='job_offer_chips')
        `);
        const { results: tables } = await tablesStmt.all();
        console.log("Available tables:", tables.map(t => t.name));
      } catch (e) {
        console.log("Error checking tables:", e.message);
      }

      // Try to get chip templates - check if new table exists first
      let chipResults = [];
      try {
        const chipStmt = env.DB.prepare(`
          SELECT 
            jct.job_id,
            ct.id,
            ct.chip_key,
            ct.chip_label,
            ct.category,
            jct.display_order
          FROM job_chip_templates jct
          INNER JOIN chip_templates ct ON jct.chip_template_id = ct.id
          WHERE jct.job_id IN (${jobIds.map(() => '?').join(',')})
          ORDER BY jct.job_id, jct.display_order
        `);
        
        const result = await chipStmt.bind(...jobIds).all();
        chipResults = result.results || [];
        console.log(`Found ${chipResults.length} chip templates from new table for jobs:`, jobIds);
      } catch (error) {
        console.log("New job_chip_templates table not available, trying old table:", error.message);
        
        // Fallback to old job_offer_chips table
        try {
          const oldChipStmt = env.DB.prepare(`
            SELECT 
              joc.job_id,
              joc.chip_key,
              joc.chip_label,
              joc.display_order,
              ct.id,
              ct.category
            FROM job_offer_chips joc
            LEFT JOIN chip_templates ct ON joc.chip_key = ct.chip_key
            WHERE joc.job_id IN (${jobIds.map(() => '?').join(',')}) AND joc.is_active = 1
            ORDER BY joc.job_id, joc.display_order
          `);
          
          const result = await oldChipStmt.bind(...jobIds).all();
          chipResults = (result.results || []).map(chip => ({
            job_id: chip.job_id,
            id: chip.id || null,
            chip_key: chip.chip_key,
            chip_label: chip.chip_label,
            category: chip.category || 'other',
            display_order: chip.display_order
          }));
          console.log(`Found ${chipResults.length} chip templates from old table for jobs:`, jobIds);
        } catch (fallbackError) {
          console.error("Error fetching from old table:", fallbackError.message);
        }
      }
      
      // Process results
      chipResults.forEach(chip => {
        if (!chipTemplates[chip.job_id]) {
          chipTemplates[chip.job_id] = [];
        }
        chipTemplates[chip.job_id].push({
          id: chip.id,
          chip_key: chip.chip_key,
          chip_label: chip.chip_label,
          category: chip.category,
          display_order: chip.display_order
        });
      });
      
      console.log("Final chipTemplates object:", chipTemplates);
    }

    // Parse location JSON arrays in results and add chip templates
    const jobs = results.map((job) => {
      const { company_logo_url, company_color, company_name, ...jobItem } = job;
      return {
        ...jobItem,
        location: job.location ? JSON.parse(job.location) : [],
        chip_templates: chipTemplates[job.id] || [],
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

    // Validate chip template IDs if provided
    if (data.chip_template_ids && Array.isArray(data.chip_template_ids)) {
      if (data.chip_template_ids.length > 0) {
        const chipTemplateStmt = env.DB.prepare(`
          SELECT COUNT(*) as count FROM chip_templates 
          WHERE id IN (${data.chip_template_ids.map(() => '?').join(',')}) AND is_active = 1
        `);
        const { count } = await chipTemplateStmt.bind(...data.chip_template_ids).first();
        
        if (count !== data.chip_template_ids.length) {
          return createResponse({ error: "One or more chip templates are invalid or inactive" }, 400);
        }
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

    const jobId = result.meta.last_row_id;

    // Handle chip templates
    if (data.chip_template_ids && Array.isArray(data.chip_template_ids) && data.chip_template_ids.length > 0) {
      await updateJobChipTemplates(env, jobId, data.chip_template_ids);
    }

    return createResponse(
      {
        success: true,
        data: {
          id: jobId,
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

    // Get chip templates for this job
    let chipResults = [];
    try {
      const chipStmt = env.DB.prepare(`
        SELECT 
          ct.id,
          ct.chip_key,
          ct.chip_label,
          ct.category,
          jct.display_order
        FROM job_chip_templates jct
        INNER JOIN chip_templates ct ON jct.chip_template_id = ct.id
        WHERE jct.job_id = ?
        ORDER BY jct.display_order
      `);
      
      const result = await chipStmt.bind(jobId).all();
      chipResults = result.results || [];
      console.log(`Found ${chipResults.length} chip templates from new table for job ${jobId}`);
    } catch (error) {
      console.log("New job_chip_templates table not available, trying old table:", error.message);
      
      // Fallback to old job_offer_chips table
      try {
        const oldChipStmt = env.DB.prepare(`
          SELECT 
            joc.chip_key,
            joc.chip_label,
            joc.display_order,
            ct.id,
            ct.category
          FROM job_offer_chips joc
          LEFT JOIN chip_templates ct ON joc.chip_key = ct.chip_key
          WHERE joc.job_id = ? AND joc.is_active = 1
          ORDER BY joc.display_order
        `);
        
        const result = await oldChipStmt.bind(jobId).all();
        chipResults = (result.results || []).map(chip => ({
          id: chip.id || null,
          chip_key: chip.chip_key,
          chip_label: chip.chip_label,
          category: chip.category || 'other',
          display_order: chip.display_order
        }));
        console.log(`Found ${chipResults.length} chip templates from old table for job ${jobId}`);
      } catch (fallbackError) {
        console.error("Error fetching from old table:", fallbackError.message);
        chipResults = [];
      }
    }

    // Parse location JSON array
    const { company_logo_url, company_color, company_name, ...jobItem } = job;
    job.location = job.location ? JSON.parse(job.location) : [];
    job.chip_templates = chipResults || [];
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

    // Validate chip template IDs if provided
    if (data.chip_template_ids && Array.isArray(data.chip_template_ids)) {
      if (data.chip_template_ids.length > 0) {
        const chipTemplateStmt = env.DB.prepare(`
          SELECT COUNT(*) as count FROM chip_templates 
          WHERE id IN (${data.chip_template_ids.map(() => '?').join(',')})
        `);
        const { count } = await chipTemplateStmt.bind(...data.chip_template_ids).first();
        
        if (count !== data.chip_template_ids.length) {
          return createResponse({ error: "One or more chip templates are invalid or inactive" }, 400);
        }
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

    // Handle chip templates update
    if (data.chip_template_ids !== undefined) {
      await updateJobChipTemplates(env, jobId, data.chip_template_ids || []);
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

// Helper function to update job chip templates
async function updateJobChipTemplates(env, jobId, chipTemplateIds) {
  try {
    // Remove existing chip templates for this job
    const deleteStmt = env.DB.prepare(`
      DELETE FROM job_chip_templates WHERE job_id = ?
    `);
    await deleteStmt.bind(jobId).run();

    // Add new chip templates if any
    if (chipTemplateIds && chipTemplateIds.length > 0) {
      const insertStmt = env.DB.prepare(`
        INSERT INTO job_chip_templates (job_id, chip_template_id, display_order)
        VALUES (?, ?, ?)
      `);

      // Insert each chip template with display order
      for (let i = 0; i < chipTemplateIds.length; i++) {
        await insertStmt.bind(jobId, chipTemplateIds[i], i).run();
      }
    }
  } catch (error) {
    console.error("Update job chip templates error:", error);
    throw error;
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
