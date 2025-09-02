import { verifyJWT } from "../../utils/jwt.js";
import { createResponse, addCorsHeaders } from "../../utils/cors.js";
import { handleCompaniesRequest } from "./companies.js";
import { handleJobsRequest } from "./jobs.js";
import { handleContactsRequest } from "./contacts.js";

export async function handleAdminRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Extract admin resource (companies, jobs, contacts, users)
  const resource = pathParts[2]; // /api/admin/{resource}
  const resourceId = pathParts[3]; // /api/admin/{resource}/{id}

  try {
    // Verify JWT and get user
    const authResult = await verifyJWT(request, env);

    if (!authResult || !authResult.valid) {
      return createResponse({ error: "Unauthorized" }, 401);
    }
    const user = authResult.payload;

    // Check admin role
    if (!["super_admin", "company_admin"].includes(user.role)) {
      return createResponse({ error: "Admin access required" }, 403);
    }

    let response;
    switch (resource) {
      case "companies":
        response = await handleCompaniesRequest(
          method,
          resourceId,
          request,
          env,
          user,
        );
        break;
      case "jobs":
        response = await handleJobsRequest(
          method,
          resourceId,
          request,
          env,
          user,
        );
        break;
      case "contacts":
        response = await handleContactsRequest(
          method,
          resourceId,
          request,
          env,
          user,
        );
        break;
      case "stats":
        response = await handleStats(method, request, env, user);
        break;
      default:
        return createResponse({ error: "Resource not found" }, 404);
    }

    // Ensure CORS headers are present on all admin responses
    return addCorsHeaders(response);
  } catch (error) {
    return createResponse({ error: "Internal server error" }, 500);
  }
}

// Stats endpoint
async function handleStats(method, request, env, user) {
  if (method !== "GET") {
    return createResponse({ error: "Method not allowed" }, 405);
  }

  try {
    let companiesCount, jobsCount, contactsCount, usersCount;

    if (user.role === "super_admin") {
      // Super admin sees all stats
      const [companies, jobs, contacts, users] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) as count FROM companies").first(),
        env.DB.prepare("SELECT COUNT(*) as count FROM jobs").first(),
        env.DB.prepare("SELECT COUNT(*) as count FROM contacts").first(),
        env.DB.prepare("SELECT COUNT(*) as count FROM users").first(),
      ]);

      companiesCount = companies.count;
      jobsCount = jobs.count;
      contactsCount = contacts.count;
      usersCount = users.count;
    } else {
      // Company admin sees only their company stats
      const [jobs, contacts] = await Promise.all([
        env.DB.prepare(
          "SELECT COUNT(*) as count FROM jobs WHERE company_id = ?",
        )
          .bind(user.company_id)
          .first(),
        env.DB.prepare(
          "SELECT COUNT(*) as count FROM contacts WHERE company_id = ?",
        )
          .bind(user.company_id)
          .first(),
      ]);

      companiesCount = 1; // Their own company
      jobsCount = jobs.count;
      contactsCount = contacts.count;
      usersCount = 0; // Company admins can't see user stats
    }

    return createResponse({
      companies: companiesCount,
      jobs: jobsCount,
      contacts: contactsCount,
      users: usersCount,
    });
  } catch (error) {
    return createResponse({ error: "Failed to fetch stats" }, 500);
  }
}
