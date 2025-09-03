import { verifyJWT } from "../../utils/jwt.js";
import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

export async function handleContactsRequest(request, env, user) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const cache = new CloudflareCache(env);

  // Extract resource
  const resourceOrContactId = pathParts[2]; // /api/contacts/{contactId}

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
    if (resourceOrContactId && !isNaN(Number(resourceOrContactId))) {
      return await getContact(resourceOrContactId, env, user);
    } else if (String(resourceOrContactId).startsWith("status")) {
      return await handleContactStatusRequest(request, env, user);
    } else {
      return await getContacts(env, user, url);
    }

    // Cache successful responses with shorter TTL for contacts data
    if (response.status === 200) {
      const cacheSettings = {
        maxAge: 240, // 4 minutes browser cache
        sMaxAge: 720, // 12 minutes edge cache
        staleWhileRevalidate: 1440, // 24 minutes stale allowed
        publicCache: false, // Private cache for admin data
      };
      response = await cache.put(request, response, {
        ...cacheSettings,
        customKey: cacheKey,
      });
    }

    return response;
  }

  switch (method) {
    case "POST":
      if (pathParts[2] === "unlock") {
        return await handleContactUnlockRequest(request, env, user);
      }
      break;
    default:
      return createResponse({ error: "Method not allowed" }, 405);
  }

  return createResponse({ error: "Endpoint not found" }, 404);
}

async function getContact(contactId, env, user) {
  try {
    let stmt;
    let contactItem;

    if (user.role === "user") {
      // For regular users, check unlock status
      stmt = env.DB.prepare(`
        SELECT c.*, 
               co.id as company_id_data, 
               co.name as company_name, 
               co.logo_url as company_logo_url,
               co.color as company_color,
               uc.id as is_unlocked
        FROM contacts c
        LEFT JOIN companies co ON c.company_id = co.id
        LEFT JOIN user_unlocked_contacts uc ON c.id = uc.contact_id AND uc.user_id = ?
        WHERE c.id = ?
      `);
      contactItem = await stmt.bind(user.id, contactId).first();
    } else {
      // For admin users, return full data
      stmt = env.DB.prepare(`
        SELECT c.*, 
               co.id as company_id_data, 
               co.name as company_name, 
               co.logo_url as company_logo_url,
               co.color as company_color,
               1 as is_unlocked
        FROM contacts c
        LEFT JOIN companies co ON c.company_id = co.id
        WHERE c.id = ?
      `);
      contactItem = await stmt.bind(contactId).first();
    }

    if (!contactItem) {
      return createResponse({ error: "Contact not found" }, 404);
    }

    // Helper function to generate initials from name
    const generateInitials = (name) => {
      if (!name) return "??";
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    };

    const {
      company_id_data,
      company_name,
      company_logo_url,
      company_color,
      is_unlocked,
      ...contactData
    } = contactItem;

    const isUnlocked = !!is_unlocked;

    const returnContact = {
      ...contactData,
      // Show abbreviated name for locked contacts
      name: isUnlocked ? contactItem.name : generateInitials(contactItem.name),
      // Hide sensitive information for locked contacts
      position: isUnlocked ? contactItem.position : null,
      email: isUnlocked ? contactItem.email : null,
      whatsapp: isUnlocked ? contactItem.whatsapp : null,
      phone: isUnlocked ? contactItem.phone : null,
      // City is always visible
      city: contactItem.city,
      location: contactItem.location ? JSON.parse(contactItem.location) : [],
      // Add unlock status for frontend
      isUnlocked,
      company: {
        id: company_id_data,
        name: company_name,
        logo_url: company_logo_url,
        color: company_color,
      },
    };

    return createResponse({ success: true, data: returnContact });
  } catch (error) {
    console.error("Get contact error:", error);
    return createResponse({ error: "Failed to fetch contact" }, 500);
  }
}

async function getContacts(env, user, url) {
  try {
    const params = new URLSearchParams(url?.search || "");
    const page = parseInt(params.get("page") || "1");
    const limit = parseInt(params.get("limit") || "20");
    const search = params.get("search") || "";
    const filters = JSON.parse(params.get("filters") || "{}");
    const company_id = params.get("company_id") || "";

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
          () =>
            "(c.name LIKE ? OR c.position LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.whatsapp LIKE ? OR co.name LIKE ?)",
        );
        whereConditions.push(`(${searchConditions.join(" OR ")})`);

        // Add parameters for each search term
        searchUnits.forEach((term) => {
          const searchTerm = `%${term}%`;
          queryParams.push(
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
          );
        });
      }
    }

    // Filters
    if (filters) {
      if (filters?.city?.length > 0) {
        whereConditions.push("c.city = ?");
        queryParams.push(filters.city);
      }
    }

    // Company filtering
    if (company_id) {
      whereConditions.push("c.company_id = ?");
      queryParams.push(company_id);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      ${whereClause}
    `);
    const { total } = await countStmt.bind(...queryParams).first();

    // Get paginated results with unlock status for regular users
    const stmt = env.DB.prepare(`
      SELECT c.*, 
              co.id as company_id_data,
              co.name as company_name,
              co.logo_url as company_logo_url,
              co.color as company_color,
              uc.id as is_unlocked
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN user_unlocked_contacts uc ON c.id = uc.contact_id AND uc.user_id = ?
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const queryResult = await stmt
      .bind(user.id, ...queryParams, limit, offset)
      .all();
    const results = queryResult.results;

    // Helper function to generate initials from name
    const generateInitials = (name) => {
      if (!name) return "??";
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2); // Limit to 2 characters
    };

    // Format results - parse location JSON array and structure company data
    const contacts = results.map((contact) => {
      const {
        company_id_data,
        company_name,
        company_logo_url,
        company_color,
        is_unlocked,
        ...contactItem
      } = contact;

      const isUnlocked = !!is_unlocked;

      // For locked contacts, return abbreviated data
      const formattedContact = {
        ...contactItem,
        // Show abbreviated name for locked contacts
        name: isUnlocked ? contact.name : generateInitials(contact.name),
        // Hide sensitive information for locked contacts
        position: isUnlocked ? contact.position : null,
        email: isUnlocked ? contact.email : null,
        whatsapp: isUnlocked ? contact.whatsapp : null,
        phone: isUnlocked ? contact.phone : null,
        // City is always visible as it's not sensitive
        city: contact.city,
        location: contact.location ? JSON.parse(contact.location) : [],
        // Add unlock status for frontend
        isUnlocked,
        company: company_id_data
          ? {
              id: company_id_data,
              name: company_name,
              logo_url: company_logo_url,
              color: company_color,
            }
          : null,
      };

      return formattedContact;
    });

    const totalPages = Math.ceil(total / limit);

    return createResponse({
      success: true,
      data: contacts,
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
    console.error("Get contacts error:", error);
    return createResponse({ error: "Failed to fetch contacts" }, 500);
  }
}

export async function handleContactUnlockRequest(request, env, user) {
  const cache = new CloudflareCache(env);

  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return createResponse({ error: "Contact ID is required" }, 400);
    }

    // Check if user already has access to this contact
    const existingUnlock = await env.DB.prepare(
      `
      SELECT id FROM user_unlocked_contacts 
      WHERE user_id = ? AND contact_id = ?
    `,
    )
      .bind(user.id, contactId)
      .first();

    if (existingUnlock) {
      return createResponse({
        success: true,
        alreadyUnlocked: true,
        message: "Contact already unlocked",
      });
    }

    // Check if contact exists
    const contact = await env.DB.prepare(
      `
      SELECT c.*, co.name as company_name, co.logo_url as company_logo_url, co.color as company_color
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE c.id = ?
    `,
    )
      .bind(contactId)
      .first();

    if (!contact) {
      return createResponse({ error: "Contact not found" }, 404);
    }

    // Check user's credits
    const userRecord = await env.DB.prepare(
      `
      SELECT credits FROM users WHERE id = ?
    `,
    )
      .bind(user.id)
      .first();

    if (!userRecord || userRecord.credits < 1) {
      return createResponse(
        {
          error: "Insufficient credits",
          userCredits: userRecord?.credits || 0,
        },
        402,
      ); // Payment Required
    }

    // Start transaction-like operations
    try {
      // Deduct credit from user
      await env.DB.prepare(
        `
        UPDATE users SET credits = credits - 1, updated_at = datetime('now')
        WHERE id = ?
      `,
      )
        .bind(user.id)
        .run();

      // Record the unlock
      await env.DB.prepare(
        `
        INSERT INTO user_unlocked_contacts (user_id, contact_id, credits_spent)
        VALUES (?, ?, 1)
      `,
      )
        .bind(user.id, contactId)
        .run();

      // Format contact data with company info
      const unlockedContact = {
        ...contact,
        location: contact.location ? JSON.parse(contact.location) : [],
        company: {
          name: contact.company_name,
          logo_url: contact.company_logo_url,
          color: contact.company_color,
        },
      };

      // Invalidate relevant caches
      await invalidateUserContactCache(cache, user, contactId);

      return createResponse({
        success: true,
        contact: unlockedContact,
        creditsRemaining: userRecord.credits - 1,
        message: "Contact unlocked successfully",
      });
    } catch (error) {
      // If anything fails, we should ideally rollback, but since D1 doesn't support transactions,
      // we'll handle this with application logic
      console.error("Error during unlock process:", error);
      return createResponse(
        {
          error: "Failed to unlock contact. Please try again.",
        },
        500,
      );
    }
  } catch (error) {
    console.error("Contact unlock error:", error);
    return createResponse(
      {
        error: "Failed to process unlock request",
      },
      500,
    );
  }
}

export async function handleContactStatusRequest(request, env, user) {
  try {
    const url = new URL(request.url);
    const contactId = url.searchParams.get("contactId");

    if (!contactId) {
      return createResponse({ error: "Contact ID is required" }, 400);
    }

    // Check if user has unlocked this contact
    const unlock = await env.DB.prepare(
      `
      SELECT unlocked_at FROM user_unlocked_contacts 
      WHERE user_id = ? AND contact_id = ?
    `,
    )
      .bind(user.id, contactId)
      .first();

    // Get user's current credits
    const userRecord = await env.DB.prepare(
      `
      SELECT credits FROM users WHERE id = ?
    `,
    )
      .bind(user.id)
      .first();

    return createResponse({
      success: true,
      isUnlocked: !!unlock,
      userCredits: userRecord?.credits || 0,
      unlockedAt: unlock?.unlocked_at || null,
    });
  } catch (error) {
    console.error("Contact status check error:", error);
    return createResponse(
      {
        error: "Failed to check contact status",
      },
      500,
    );
  }
}

export async function handleUserUnlockedContactsRequest(request, env, user) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get user's unlocked contacts with contact and company details
    const contacts = await env.DB.prepare(
      `
      SELECT 
        c.*,
        uc.unlocked_at,
        uc.credits_spent,
        co.name as company_name,
        co.logo_url as company_logo_url,
        co.color as company_color
      FROM user_unlocked_contacts uc
      JOIN contacts c ON uc.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE uc.user_id = ?
      ORDER BY uc.unlocked_at DESC
      LIMIT ? OFFSET ?
    `,
    )
      .bind(user.id, limit, offset)
      .all();

    // Get total count
    const { total } = await env.DB.prepare(
      `
      SELECT COUNT(*) as total FROM user_unlocked_contacts WHERE user_id = ?
    `,
    )
      .bind(user.id)
      .first();

    // Format response
    const formattedContacts = contacts.results.map((contact) => ({
      ...contact,
      location: contact.location ? JSON.parse(contact.location) : [],
      company: {
        name: contact.company_name,
        logo_url: contact.company_logo_url,
        color: contact.company_color,
      },
    }));

    const totalPages = Math.ceil(total / limit);

    return createResponse({
      success: true,
      data: formattedContacts,
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
    console.error("Get user unlocked contacts error:", error);
    return createResponse(
      {
        error: "Failed to fetch unlocked contacts",
      },
      500,
    );
  }
}

// Cache invalidation helper
async function invalidateUserContactCache(cache, user, contactId) {
  try {
    const patterns = [
      `/api/contacts/status?contactId=${contactId}`,
      `/api/contacts/unlocked`,
      `/api/contacts`,
    ];

    for (const pattern of patterns) {
      const testUrl = new URL(`https://example.com${pattern}`);
      const testRequest = new Request(testUrl.toString());
      await cache.delete(testRequest);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}
