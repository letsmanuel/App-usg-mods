import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { Session } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

const SESSION_COOKIE_NAME = "roblox_session";

// Roblox OAuth endpoints
app.get("/api/auth/roblox/redirect", async (c) => {
  const redirectUri = `${new URL(c.req.url).origin}/auth/callback`;
  const state = crypto.randomUUID();
  
  const authUrl = new URL("https://apis.roblox.com/oauth/v1/authorize");
  authUrl.searchParams.set("client_id", c.env.ROBLOX_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid profile");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  
  return c.json({ redirectUrl: authUrl.toString() });
});

app.post("/api/auth/roblox/callback", async (c) => {
  const { code } = await c.req.json();
  const redirectUri = `${new URL(c.req.url).origin}/auth/callback`;
  
  // Exchange code for tokens
  const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${c.env.ROBLOX_CLIENT_ID}:${c.env.ROBLOX_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  
  if (!tokenResponse.ok) {
    return c.json({ error: "Failed to exchange code for token" }, 400);
  }
  
  const tokens = await tokenResponse.json() as { access_token: string };
  
  // Get user info
  const userInfoResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: {
      "Authorization": `Bearer ${tokens.access_token}`,
    },
  });
  
  if (!userInfoResponse.ok) {
    return c.json({ error: "Failed to fetch user info" }, 400);
  }
  
  const userInfo = await userInfoResponse.json() as { sub: string; preferred_username: string };
  
  // Create session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
  
  await c.env.DB.prepare(
    "INSERT INTO sessions (session_token, roblox_id, roblox_username, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(sessionToken, userInfo.sub, userInfo.preferred_username, expiresAt.toISOString()).run();
  
  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 24 * 60 * 60,
  });
  
  return c.json({ success: true });
});

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  
  if (!sessionToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const session = await c.env.DB.prepare(
    "SELECT * FROM sessions WHERE session_token = ? AND expires_at > datetime('now')"
  ).bind(sessionToken).first() as Session | null;
  
  if (!session) {
    return c.json({ error: "Invalid session" }, 401);
  }
  
  c.set("session", session);
  await next();
};

// Get current user
app.get("/api/auth/me", authMiddleware, async (c) => {
  const session = c.get("session")!;
  
  // Check by ID first, then fallback to username match
  let moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ?"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    moderator = await c.env.DB.prepare(
      "SELECT * FROM moderators WHERE roblox_username = ?"
    ).bind(session.roblox_username).first();
    
    // Update the moderator record with the correct Roblox ID
    if (moderator) {
      await c.env.DB.prepare(
        "UPDATE moderators SET roblox_id = ? WHERE id = ?"
      ).bind(session.roblox_id, moderator.id).run();
    }
  }
  
  return c.json({
    robloxId: session.roblox_id,
    robloxUsername: session.roblox_username,
    isModerator: !!moderator,
    isSystemAdmin: moderator?.is_system_admin === 1,
  });
});

// Logout
app.post("/api/auth/logout", authMiddleware, async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  
  await c.env.DB.prepare(
    "DELETE FROM sessions WHERE session_token = ?"
  ).bind(sessionToken).run();
  
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
  });
  
  return c.json({ success: true });
});

// Get pending violations for moderator
app.get("/api/violations/pending", authMiddleware, async (c) => {
  const session = c.get("session")!;
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ?"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT v.*, ru.roblox_username, ru.is_banned
    FROM violations v
    LEFT JOIN roblox_users ru ON v.roblox_user_id = ru.roblox_id
    WHERE v.status = 'pending'
    ORDER BY v.created_at ASC
  `).all();
  
  return c.json(results);
});

// Get guilty violations for system admins
app.get("/api/violations/guilty", authMiddleware, async (c) => {
  const session = c.get("session")!;
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT v.*, ru.roblox_username, ru.is_banned
    FROM violations v
    LEFT JOIN roblox_users ru ON v.roblox_user_id = ru.roblox_id
    WHERE v.status = 'guilty'
    ORDER BY v.created_at ASC
  `).all();
  
  return c.json(results);
});

// Review violation
app.post("/api/violations/:id/review", authMiddleware, async (c) => {
  const session = c.get("session")!;
  const violationId = c.req.param("id");
  const { verdict } = await c.req.json();
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ?"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  await c.env.DB.prepare(`
    UPDATE violations 
    SET status = ?, reviewed_by_moderator_id = ?, reviewed_at = datetime('now'), verdict = ?
    WHERE id = ?
  `).bind(verdict, session.roblox_id, verdict, violationId).run();
  
  return c.json({ success: true });
});

// Search user by username or ID
app.get("/api/users/search", authMiddleware, async (c) => {
  const query = c.req.query("q");
  
  if (!query) {
    return c.json([]);
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT ru.*, 
           (SELECT COUNT(*) FROM violations WHERE roblox_user_id = ru.roblox_id) as violation_count
    FROM roblox_users ru
    WHERE ru.roblox_username LIKE ? OR ru.roblox_id LIKE ?
    LIMIT 20
  `).bind(`%${query}%`, `%${query}%`).all();
  
  return c.json(results);
});

// Get user violations
app.get("/api/users/:robloxId/violations", authMiddleware, async (c) => {
  const robloxId = c.req.param("robloxId");
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM violations 
    WHERE roblox_user_id = ?
    ORDER BY created_at DESC
  `).bind(robloxId).all();
  
  return c.json(results);
});

// Ban user
app.post("/api/users/:robloxId/ban", authMiddleware, async (c) => {
  const session = c.get("session")!;
  const robloxId = c.req.param("robloxId");
  const { violationId, durationHours } = await c.req.json();
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Only system admins can ban users" }, 403);
  }
  
  const violation = await c.env.DB.prepare(
    "SELECT * FROM violations WHERE id = ?"
  ).bind(violationId).first();
  
  if (!violation) {
    return c.json({ error: "Violation not found" }, 404);
  }
  
  await c.env.DB.prepare(`
    UPDATE roblox_users 
    SET is_banned = 1, ban_reason = ?, ban_duration_hours = ?, banned_at = datetime('now')
    WHERE roblox_id = ?
  `).bind(violation.violation_text, durationHours || null, robloxId).run();
  
  return c.json({ success: true });
});

// Dismiss violation
app.post("/api/violations/:id/dismiss", authMiddleware, async (c) => {
  const session = c.get("session")!;
  const violationId = c.req.param("id");
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Only system admins can dismiss violations" }, 403);
  }
  
  await c.env.DB.prepare(
    "UPDATE violations SET status = 'dismissed' WHERE id = ?"
  ).bind(violationId).run();
  
  return c.json({ success: true });
});

// Add violation (public endpoint for game)
app.post("/api/violations", async (c) => {
  const { robloxId, violationText } = await c.req.json();
  
  if (!robloxId || !violationText) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  
  // Ensure user exists
  let user = await c.env.DB.prepare(
    "SELECT * FROM roblox_users WHERE roblox_id = ?"
  ).bind(robloxId).first();
  
  if (!user) {
    await c.env.DB.prepare(
      "INSERT INTO roblox_users (roblox_id, roblox_username) VALUES (?, ?)"
    ).bind(robloxId, `User_${robloxId}`).run();
  }
  
  await c.env.DB.prepare(
    "INSERT INTO violations (roblox_user_id, violation_text) VALUES (?, ?)"
  ).bind(robloxId, violationText).run();
  
  return c.json({ success: true });
});

// Get moderators list (system admins only)
app.get("/api/moderators", authMiddleware, async (c) => {
  const session = c.get("session")!;
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM moderators ORDER BY created_at DESC"
  ).all();
  
  return c.json(results);
});

// Add moderator (system admins only)
app.post("/api/moderators", authMiddleware, async (c) => {
  const session = c.get("session")!;
  const { robloxId, robloxUsername } = await c.req.json();
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  await c.env.DB.prepare(
    "INSERT INTO moderators (roblox_id, roblox_username, is_system_admin) VALUES (?, ?, 0)"
  ).bind(robloxId, robloxUsername).run();
  
  return c.json({ success: true });
});

// Remove moderator (system admins only)
app.delete("/api/moderators/:id", authMiddleware, async (c) => {
  const session = c.get("session")!;
  const moderatorId = c.req.param("id");
  
  const moderator = await c.env.DB.prepare(
    "SELECT * FROM moderators WHERE roblox_id = ? AND is_system_admin = 1"
  ).bind(session.roblox_id).first();
  
  if (!moderator) {
    return c.json({ error: "Not authorized" }, 403);
  }
  
  await c.env.DB.prepare(
    "DELETE FROM moderators WHERE id = ?"
  ).bind(moderatorId).run();
  
  return c.json({ success: true });
});

app.get("*", (c) => serveStatic(c, "./public/index.html"));

export default app;
