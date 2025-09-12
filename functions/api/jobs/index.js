import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

export async function handleJobsRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const cache = new CloudflareCache(env);

  // Extract job ID from path: /api/jobs/{jobId}
  const jobId = pathParts[2];
  console.log("Job ID: ", jobId);

  // Only GET requests allowed for public API
  if (method !== "GET") {
    return createResponse({ error: "Method not allowed" }, 405);
  }

  // // Handle caching for GET requests
  // const cacheKey = `${url.pathname}?${url.searchParams.toString()}`;

  // // Try cache first for GET requests
  // const cached = await cache.get(request, cacheKey);
  // if (cached) {
  //   return cached;
  // }

  // Get fresh data
  let response;
  if (jobId) {
    response = await getJob(jobId, env);
  } else {
    response = await getJobs(env, url);
  }

  return response;

  // // Cache successful responses with longer TTL for public data
  // if (response.status === 200) {
  //   const cacheSettings = {
  //     maxAge: 600, // 10 minutes browser cache
  //     sMaxAge: 1800, // 30 minutes edge cache
  //     staleWhileRevalidate: 3600, // 1 hour stale allowed
  //     publicCache: true, // Public cache for job listings
  //   };
  //   response = await cache.put(request, response, {
  //     ...cacheSettings,
  //     customKey: cacheKey,
  //   });
  // }

  // return response;
}

// Public Jobs implementations
async function getJobs(env, url) {
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

async function getJob(jobId, env) {
  try {
    // Get main job details
    const jobStmt = env.DB.prepare(`
      SELECT * FROM jobs j WHERE j.id = ?
    `);

    const job = await jobStmt.bind(jobId).first();

    if (!job) {
      return createResponse({ error: "Job not found" }, 404);
    }

    // Get company details
    const companyStmt = env.DB.prepare(`
      SELECT * FROM companies WHERE id = ?
    `);
    const company = await companyStmt.bind(job.company_id).first();

    if (!company) {
      console.warn(
        `Company not found for job ${jobId}, company_id: ${job.company_id}`,
      );
    }

    // Get child jobs (external job listings)
    const childJobsStmt = env.DB.prepare(`
      SELECT * FROM child_jobs WHERE parent_job_id = ? ORDER BY created_at DESC
    `);
    const { results: childJobsResults } = await childJobsStmt.bind(jobId).all();

    const childJobs = childJobsResults.map((childJob) => {
      return {
        ...childJob,
        ageHours: Math.floor(
          (Date.now() - new Date(childJob.created_at)) / 1000 / 60 / 60,
        ),
      };
    });

    // Get AI snapshot
    const aiSnapshotStmt = env.DB.prepare(`
      SELECT * FROM ai_snapshots WHERE parent_job_id = ?
    `);
    const aiSnapshot = await aiSnapshotStmt.bind(jobId).first();

    return createResponse({
      success: true,
      data: {
        job: { ...job, location: job.location ? JSON.parse(job.location) : [] },
        company,
        childJobs,
        aiSnapshot: {
          ...aiSnapshot,
          market_insights: aiSnapshot.market_insights
            ? JSON.parse(aiSnapshot.market_insights)
            : null,
          salary_range: aiSnapshot.salary_range
            ? JSON.parse(aiSnapshot.salary_range)
            : null,
          required_skills: aiSnapshot.required_skills
            ? JSON.parse(aiSnapshot.required_skills)
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Get public job error:", error);
    return createResponse({ error: "Failed to fetch job" }, 500);
  }
}
