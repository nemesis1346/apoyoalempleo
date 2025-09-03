import { createResponse } from "../../utils/cors.js";
import { CloudflareCache } from "../../utils/cloudflare-cache.js";

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
      `/api/admin/contacts`, // Admin contact lists might be affected
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
