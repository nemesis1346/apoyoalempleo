import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";
import { findBestAISnapshot } from "../admin/ai-snapshots.js";

export async function handleJobsRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const cache = new CloudflareCache(env);

  // Extract job ID from path: /api/jobs/{jobId}
  const jobId = pathParts[2];

  // Only GET requests allowed for public API
  if (method !== "GET") {
    return createResponse({ error: "Method not allowed" }, 405);
  }

  // Handle caching for GET requests
  const cacheKey = `${url.pathname}?${url.searchParams.toString()}`;

  // Try cache first for GET requests
  const cached = await cache.get(request, cacheKey);
  if (cached) {
    return cached;
  }

  // Get fresh data
  let response;
  if (jobId) {
    response = await getPublicJob(jobId, env);
  } else {
    response = await getPublicJobs(env, url);
  }

  // Cache successful responses with longer TTL for public data
  if (response.status === 200) {
    const cacheSettings = {
      maxAge: 600, // 10 minutes browser cache
      sMaxAge: 1800, // 30 minutes edge cache
      staleWhileRevalidate: 3600, // 1 hour stale allowed
      publicCache: true, // Public cache for job listings
    };
    response = await cache.put(request, response, {
      ...cacheSettings,
      customKey: cacheKey,
    });
  }

  return response;
}

// Public Jobs implementations
async function getPublicJobs(env, url) {
  try {
    const params = new URLSearchParams(url?.search || "");
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "20");
    const search = params.get("search") || "";
    const location = params.get("location") || "";
    const employment_type = params.get("employment_type") || "";
    const company = params.get("company") || "";

    const offset = (page - 1) * limit;

    // Build WHERE clause for public jobs (only active jobs from active companies)
    let whereConditions = ["j.id IS NOT NULL", "c.is_active = ?"];
    let queryParams = [true];

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

    // Location filtering (JSON array contains)
    if (location) {
      whereConditions.push("j.location LIKE ?");
      queryParams.push(`%"${location}"%`);
    }

    // Employment type filtering
    if (employment_type) {
      whereConditions.push("j.employment_type = ?");
      queryParams.push(employment_type);
    }

    // Company filtering
    if (company) {
      whereConditions.push("c.name LIKE ?");
      queryParams.push(`%${company}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

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
      SELECT 
        j.id, j.title, j.employment_type, j.location, j.description, j.created_at,
        c.name as company_name, c.logo_url as company_logo_url, c.color as company_color
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const { results } = await stmt.bind(...queryParams, limit, offset).all();

    // Parse location JSON arrays and format results
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
    console.error("Get public jobs error:", error);
    return createResponse({ error: "Failed to fetch jobs" }, 500);
  }
}

async function getPublicJob(jobId, env) {
  try {
    // Get main job details
    const jobStmt = env.DB.prepare(`
      SELECT 
        j.id, j.title, j.employment_type, j.location, j.description, j.created_at,
        c.id as company_id, c.name as company_name, c.logo_url as company_logo_url, 
        c.color as company_color, c.short_description as company_description
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = ? AND c.is_active = ?
    `);

    const job = await jobStmt.bind(jobId, true).first();

    if (!job) {
      return createResponse({ error: "Job not found" }, 404);
    }

    // Get child jobs (external job listings)
    const childJobsStmt = env.DB.prepare(`
      SELECT id, title, city, country, link, source, created_at
      FROM child_jobs 
      WHERE parent_job_id = ? AND is_active = ?
      ORDER BY created_at DESC
    `);
    const { results: childJobsResults } = await childJobsStmt
      .bind(jobId, true)
      .all();

    // Get job offer chips
    const chipsStmt = env.DB.prepare(`
      SELECT joc.chip_key, joc.chip_label, joc.display_order
      FROM job_offer_chips joc
      WHERE joc.job_id = ? AND joc.is_active = ?
      ORDER BY joc.display_order, joc.chip_label
    `);
    const { results: chipsResults } = await chipsStmt.bind(jobId, true).all();

    // Find best matching AI snapshot
    const aiSnapshot = await findBestAISnapshot(env, {
      title: job.title,
      city: job.location ? JSON.parse(job.location)[0] : null,
      country: job.location ? JSON.parse(job.location)[0] : null, // Simplified for now
      employment_type: job.employment_type,
    });

    // Format job data
    const {
      company_logo_url,
      company_color,
      company_name,
      company_description,
      company_id,
      ...jobItem
    } = job;

    const formattedJob = {
      ...jobItem,
      location: job.location ? JSON.parse(job.location) : [],
      company: {
        id: company_id,
        name: company_name,
        logo_url: company_logo_url,
        color: company_color,
        description: company_description,
      },
    };

    // Format child jobs for Live Listings section
    const childJobs = childJobsResults.map((child) => ({
      id: child.id,
      title: child.title,
      source: child.source,
      url: child.link,
      city: child.city,
      country: child.country,
      ageHours: Math.floor(
        (Date.now() - new Date(child.created_at)) / (1000 * 60 * 60),
      ),
    }));

    // Format chips for What Can You Offer section
    const offerChips = chipsResults.reduce((acc, chip) => {
      acc[chip.chip_key] = chip.chip_label;
      return acc;
    }, {});

    return createResponse({
      success: true,
      data: {
        job: formattedJob,
        childJobs: childJobs,
        offerChips: offerChips,
        aiSnapshot: aiSnapshot,
      },
    });
  } catch (error) {
    console.error("Get public job error:", error);
    return createResponse({ error: "Failed to fetch job" }, 500);
  }
}
