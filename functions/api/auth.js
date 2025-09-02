/**
 * Authentication API handlers
 */

import { createResponse } from "../utils/cors.js";
import { createJWT, verifyJWT } from "../utils/jwt.js";
import { executeQueryFirst, executeUpdate } from "../utils/database.js";

/**
 * Hash password using Web Crypto API
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Handle authentication requests
 */
export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === "/api/auth/register" && request.method === "POST") {
      return await handleRegister(request, env);
    }

    if (path === "/api/auth/login" && request.method === "POST") {
      return await handleLogin(request, env);
    }

    if (path === "/api/auth/me" && request.method === "GET") {
      return await handleMe(request, env);
    }

    return createResponse({ error: "Auth endpoint not found" }, 404);
  } catch (error) {
    console.error("Auth error:", error);
    return createResponse({ error: "Authentication failed" }, 500);
  }
}

/**
 * Handle user registration
 */
async function handleRegister(request, env) {
  const { email, password, firstName, lastName } = await request.json();

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    return createResponse({ error: "Missing required fields" }, 400);
  }

  if (password.length < 8) {
    return createResponse(
      { error: "Password must be at least 8 characters" },
      400,
    );
  }

  try {
    // Check if user already exists
    const existingUser = await executeQueryFirst(
      env,
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    // Debug log removed for production

    if (existingUser) {
      return createResponse({ error: "User already exists" }, 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await executeUpdate(
      env,
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, passwordHash, firstName, lastName],
    );

    // Create JWT token
    const token = await createJWT(
      {
        id: result.meta.last_row_id,
        email: email,
        role: "user",
        company_id: null,
      },
      "24h",
      env,
    );

    return createResponse(
      {
        message: "User registered successfully",
        token,
        user: {
          id: result.meta.last_row_id,
          email,
          firstName,
          lastName,
          role: "user",
        },
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return createResponse({ error: "Registration failed" }, 500);
  }
}

/**
 * Handle user login
 */
async function handleLogin(request, env) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return createResponse({ error: "Email and password required" }, 400);
  }

  try {
    // Find user by email
    const user = await executeQueryFirst(
      env,
      "SELECT id, email, password_hash, first_name, last_name, role, company_id FROM users WHERE email = ?",
      [email],
    );

    if (!user) {
      return createResponse({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return createResponse({ error: "Invalid credentials" }, 401);
    }

    // Create JWT token
    const token = await createJWT(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      "24h",
      env,
    );

    return createResponse({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return createResponse(
      { error: "Login failed", message: error.message },
      500,
    );
  }
}

/**
 * Handle getting current user info
 */
async function handleMe(request, env) {
  try {
    // Verify JWT token
    const authResult = await verifyJWT(request, env);

    if (!authResult || !authResult.valid) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    const userPayload = authResult.payload;

    // Fetch fresh user data from database
    const user = await executeQueryFirst(
      env,
      "SELECT id, email, first_name, last_name, role, company_id FROM users WHERE id = ?",
      [userPayload.id],
    );

    if (!user) {
      return createResponse({ error: "User not found" }, 404);
    }

    return createResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return createResponse({ error: "Failed to get user info" }, 500);
  }
}
