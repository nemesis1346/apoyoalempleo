import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

export async function handleChipTemplatesRequest(
  method,
  templateId,
  request,
  env,
  user,
) {
  const cache = new CloudflareCache(env);

  // Handle caching for GET requests
  if (method === "GET") {
    // Generate cache key that includes user context for security
    const url = new URL(request.url);
    const cacheKey = `${
      url.pathname
    }?${url.searchParams.toString()}&user_role=${user.role}`;

    // Try cache first for GET requests
    // const cached = await cache.get(request, cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get fresh data
    let response;
    if (templateId) {
      response = await getChipTemplate(templateId, env, user);
    } else {
      response = await getChipTemplates(env, user, url);
    }

    // Cache successful responses with longer TTL for templates
    if (response.status === 200) {
      const cacheSettings = {
        maxAge: 600, // 10 minutes browser cache
        sMaxAge: 3600, // 1 hour edge cache
        staleWhileRevalidate: 7200, // 2 hours stale allowed
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
      response = await createChipTemplate(request, env, user);
      if (response.status === 200 || response.status === 201) {
        await invalidateChipTemplatesCache(cache, user, env);
      }
      break;
    case "PUT":
      response = await updateChipTemplate(templateId, request, env, user);
      if (response.status === 200) {
        await invalidateChipTemplatesCache(cache, user, env, templateId);
      }
      break;
    case "DELETE":
      response = await deleteChipTemplate(templateId, env, user);
      if (response.status === 200) {
        await invalidateChipTemplatesCache(cache, user, env, templateId);
      }
      break;
    default:
      return createResponse({ error: "Method not allowed" }, 405);
  }

  return response;
}

// Chip Templates CRUD implementations
async function getChipTemplates(env, user, url) {
  try {
    const params = new URLSearchParams(url?.search || "");
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "50");
    const search = params.get("search") || "";
    const category = params.get("category") || "";

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Search filtering
    if (search) {
      const searchUnits = search
        .split(/\s*,\s*/)
        .map((term) => term.trim())
        .filter((term) => term.length > 0);
      if (searchUnits.length > 0) {
        const searchConditions = searchUnits.map(
          () => "(chip_key LIKE ? OR chip_label LIKE ? OR description LIKE ?)",
        );
        whereConditions.push(`(${searchConditions.join(" OR ")})`);

        // Add parameters for each search term
        searchUnits.forEach((term) => {
          const searchTerm = `%${term}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        });
      }
    }

    // Category filtering
    if (category) {
      whereConditions.push("category = ?");
      queryParams.push(category);
    }

    // Only active templates
    whereConditions.push("is_active = ?");
    queryParams.push(true);

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM chip_templates
      ${whereClause}
    `);
    const { total } = await countStmt.bind(...queryParams).first();

    // Get paginated results
    const stmt = env.DB.prepare(`
      SELECT *
      FROM chip_templates
      ${whereClause}
      ORDER BY category, chip_label
      LIMIT ? OFFSET ?
    `);

    const { results } = await stmt.bind(...queryParams, limit, offset).all();

    const totalPages = Math.ceil(total / limit);

    return createResponse({
      success: true,
      data: results,
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
    console.error("Get chip templates error:", error);
    return createResponse({ error: "Failed to fetch chip templates" }, 500);
  }
}

async function createChipTemplate(request, env, user) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.chip_key || !data.chip_label) {
      return createResponse(
        {
          error: "Chip key and chip label are required",
        },
        400,
      );
    }

    // Validate chip_key format (alphanumeric and underscore only)
    if (!/^[a-z0-9_]+$/.test(data.chip_key)) {
      return createResponse(
        {
          error:
            "Chip key must contain only lowercase letters, numbers, and underscores",
        },
        400,
      );
    }

    // Check for duplicate chip_key
    const duplicateStmt = env.DB.prepare(`
      SELECT id FROM chip_templates WHERE chip_key = ?
    `);
    const duplicate = await duplicateStmt.bind(data.chip_key).first();

    if (duplicate) {
      return createResponse(
        {
          error: "A chip template with this key already exists",
        },
        400,
      );
    }

    // Validate category if provided
    if (data.category) {
      const validCategories = [
        "availability",
        "skills",
        "certifications",
        "location",
        "experience",
        "other",
      ];
      if (!validCategories.includes(data.category)) {
        return createResponse(
          {
            error: `Invalid category. Valid options are: ${validCategories.join(
              ", ",
            )}`,
          },
          400,
        );
      }
    }

    const stmt = env.DB.prepare(`
      INSERT INTO chip_templates (chip_key, chip_label, category, description)
      VALUES (?, ?, ?, ?)
    `);

    const result = await stmt
      .bind(
        data.chip_key,
        data.chip_label,
        data.category || "other",
        data.description || null,
      )
      .run();

    return createResponse(
      {
        success: true,
        data: {
          id: result.meta.last_row_id,
          ...data,
          category: data.category || "other",
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create chip template error:", error);
    return createResponse(
      {
        error: "Failed to create chip template",
        details: error.message,
      },
      500,
    );
  }
}

async function getChipTemplate(templateId, env, user) {
  try {
    const stmt = env.DB.prepare(`
      SELECT * FROM chip_templates WHERE id = ?
    `);

    const template = await stmt.bind(templateId).first();

    if (!template) {
      return createResponse({ error: "Chip template not found" }, 404);
    }

    return createResponse({ success: true, data: template });
  } catch (error) {
    console.error("Get chip template error:", error);
    return createResponse({ error: "Failed to fetch chip template" }, 500);
  }
}

async function updateChipTemplate(templateId, request, env, user) {
  try {
    const data = await request.json();

    // Check if template exists
    const existingTemplate = await env.DB.prepare(
      "SELECT * FROM chip_templates WHERE id = ?",
    )
      .bind(templateId)
      .first();

    if (!existingTemplate) {
      return createResponse({ error: "Chip template not found" }, 404);
    }

    // Validate required fields
    if (!data.chip_key || !data.chip_label) {
      return createResponse(
        {
          error: "Chip key and chip label are required",
        },
        400,
      );
    }

    // Validate chip_key format (alphanumeric and underscore only)
    if (!/^[a-z0-9_]+$/.test(data.chip_key)) {
      return createResponse(
        {
          error:
            "Chip key must contain only lowercase letters, numbers, and underscores",
        },
        400,
      );
    }

    // Check for duplicate chip_key (excluding current template)
    const duplicateStmt = env.DB.prepare(`
      SELECT id FROM chip_templates WHERE chip_key = ? AND id != ?
    `);
    const duplicate = await duplicateStmt
      .bind(data.chip_key, templateId)
      .first();

    if (duplicate) {
      return createResponse(
        {
          error: "A chip template with this key already exists",
        },
        400,
      );
    }

    // Validate category if provided
    if (data.category) {
      const validCategories = [
        "availability",
        "skills",
        "certifications",
        "location",
        "experience",
        "other",
      ];
      if (!validCategories.includes(data.category)) {
        return createResponse(
          {
            error: `Invalid category. Valid options are: ${validCategories.join(
              ", ",
            )}`,
          },
          400,
        );
      }
    }

    const stmt = env.DB.prepare(`
      UPDATE chip_templates 
      SET chip_key = ?, chip_label = ?, category = ?, description = ?, 
          is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = await stmt
      .bind(
        data.chip_key,
        data.chip_label,
        data.category || "other",
        data.description || null,
        data.is_active !== undefined ? data.is_active : true,
        templateId,
      )
      .run();

    if (result.changes === 0) {
      return createResponse({ error: "Chip template not found" }, 404);
    }

    return createResponse({
      success: true,
      data: {
        id: templateId,
        ...data,
      },
    });
  } catch (error) {
    console.error("Update chip template error:", error);
    return createResponse(
      {
        error: "Failed to update chip template",
        details: error.message,
      },
      500,
    );
  }
}

async function deleteChipTemplate(templateId, env, user) {
  try {
    // Check if template exists
    const existingTemplate = await env.DB.prepare(
      "SELECT * FROM chip_templates WHERE id = ?",
    )
      .bind(templateId)
      .first();

    if (!existingTemplate) {
      return createResponse({ error: "Chip template not found" }, 404);
    }

    // Check if template is being used in any jobs
    const usageStmt = env.DB.prepare(`
      SELECT COUNT(*) as usage_count 
      FROM job_offer_chips 
      WHERE chip_key = ?
    `);
    const { usage_count } = await usageStmt
      .bind(existingTemplate.chip_key)
      .first();

    if (usage_count > 0) {
      return createResponse(
        {
          error: `Cannot delete chip template. It is currently being used in ${usage_count} job(s). Please remove it from all jobs first or deactivate the template instead.`,
        },
        400,
      );
    }

    const stmt = env.DB.prepare("DELETE FROM chip_templates WHERE id = ?");
    const result = await stmt.bind(templateId).run();

    if (result.changes === 0) {
      return createResponse({ error: "Chip template not found" }, 404);
    }

    return createResponse({
      success: true,
      message: "Chip template deleted successfully",
    });
  } catch (error) {
    console.error("Delete chip template error:", error);
    return createResponse(
      {
        error: "Failed to delete chip template",
        details: error.message,
      },
      500,
    );
  }
}

// Get chip templates by category (public endpoint for forms)
export async function getChipTemplatesByCategory(env) {
  try {
    const stmt = env.DB.prepare(`
      SELECT * FROM chip_templates 
      WHERE is_active = 1 
      ORDER BY category, chip_label
    `);

    const { results } = await stmt.all();

    // Group by category
    const grouped = results.reduce((acc, template) => {
      const category = template.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});

    return createResponse({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("Get chip templates by category error:", error);
    return createResponse({ error: "Failed to fetch chip templates" }, 500);
  }
}

// Cache invalidation helper for chip templates
async function invalidateChipTemplatesCache(
  cache,
  user,
  env,
  templateId = null,
) {
  try {
    // Patterns to invalidate
    const patterns = [
      `/api/admin/chip-templates`, // Chip templates list
      `/api/admin/chip-templates/${templateId}`, // Specific chip template
      `/api/chip-templates/categories`, // Public categories endpoint
      `/api/admin/jobs`, // Job forms that use chip templates
    ];

    // Delete cache entries
    for (const pattern of patterns) {
      const testUrl = new URL(`https://example.com${pattern}`);
      const testRequest = new Request(testUrl.toString());
      await cache.delete(testRequest);
    }

    // Cache invalidation completed
  } catch (error) {
    console.error("Cache invalidation error for chip templates:", error);
    // Don't fail the main operation if cache invalidation fails
  }
}
