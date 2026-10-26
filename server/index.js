import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 10000);
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

if (!JWT_SECRET) console.warn("JWT_SECRET is missing; authentication endpoints will be unavailable.");
if (!DATABASE_URL) console.warn("DATABASE_URL is missing; database endpoints will be unavailable.");

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait a little and try again." }
});

function requireConfig(res) {
  if (!pool || !JWT_SECRET) {
    res.status(503).json({ error: "The Gist Up account service is not configured yet." });
    return false;
  }
  return true;
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    username: row.username || row.email?.split("@")[0] || "member",
    bio: row.bio || "",
    avatar_url: row.avatar_url || null,
    created_at: row.created_at
  };
}

function cleanUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

async function availableUsername(base) {
  const root = cleanUsername(base).slice(0, 22) || "member";
  let candidate = root;
  let suffix = 1;
  while (true) {
    const found = await pool.query("SELECT 1 FROM users WHERE username = $1 LIMIT 1", [candidate]);
    if (!found.rowCount) return candidate;
    const tail = String(suffix++);
    candidate = root.slice(0, 30 - tail.length - 1) + "_" + tail;
  }
}

function createSession(res, user) {
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d", issuer: "gist-up" });
  res.cookie("gistup_session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function authenticate(req, res, next) {
  if (!requireConfig(res)) return;
  const token = req.cookies?.gistup_session;
  if (!token) return res.status(401).json({ error: "Please log in to continue." });
  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: "gist-up" });
    const result = await pool.query(
      "SELECT id, email, full_name, username, bio, avatar_url, created_at FROM users WHERE id = $1 LIMIT 1",
      [payload.sub]
    );
    if (!result.rowCount) return res.status(401).json({ error: "Your session is no longer valid. Please log in again." });
    req.user = publicUser(result.rows[0]);
    next();
  } catch {
    res.clearCookie("gistup_session", { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/" });
    return res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

app.get("/api/health", async (_req, res) => {
  let database = "not configured";
  if (pool) {
    try {
      await pool.query("SELECT 1");
      database = "connected";
    } catch {
      database = "error";
    }
  }
  res.status(database === "error" ? 503 : 200).json({
    status: database === "error" ? "degraded" : "ok",
    service: "Gist Up API",
    database
  });
});

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  if (!requireConfig(res)) return;
  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (fullName.length < 2 || fullName.length > 80) return res.status(400).json({ error: "Enter a name between 2 and 80 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ error: "Your password must be between 8 and 128 characters." });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rowCount) return res.status(409).json({ error: "An account with this email already exists. Log in instead." });
    const passwordHash = await bcrypt.hash(password, 12);
    const username = await availableUsername(email.split("@")[0]);
    const result = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, username) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, username, bio, avatar_url, created_at",
      [fullName, email, passwordHash, username]
    );
    const user = publicUser(result.rows[0]);
    createSession(res, user);
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Signup failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't create your account right now. Please try again." });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  if (!requireConfig(res)) return;
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) return res.status(400).json({ error: "Enter your email address and password." });
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, username, bio, avatar_url, password_hash, created_at FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: "The email or password is incorrect." });
    }
    const user = publicUser(row);
    createSession(res, user);
    return res.json({ user });
  } catch (error) {
    console.error("Login failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't log you in right now. Please try again." });
  }
});

app.get("/api/profile/me", authenticate, (req, res) => {
  res.json({ profile: req.user });
});

app.patch("/api/profile/me", authenticate, async (req, res) => {
  const fullName = String(req.body?.fullName || "").trim();
  const username = cleanUsername(req.body?.username);
  const bio = String(req.body?.bio || "").trim();
  if (fullName.length < 2 || fullName.length > 80) {
    return res.status(400).json({ error: "Display name must be between 2 and 80 characters." });
  }
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 3–30 characters using letters, numbers, or underscores." });
  }
  if (bio.length > 160) return res.status(400).json({ error: "Bio must be 160 characters or fewer." });
  try {
    const duplicate = await pool.query(
      "SELECT id FROM users WHERE username = $1 AND id <> $2 LIMIT 1",
      [username, req.user.id]
    );
    if (duplicate.rowCount) return res.status(409).json({ error: "That username is already taken. Try another one." });
    const result = await pool.query(
      "UPDATE users SET full_name = $1, username = $2, bio = $3 WHERE id = $4 RETURNING id, email, full_name, username, bio, avatar_url, created_at",
      [fullName, username, bio, req.user.id]
    );
    const profile = publicUser(result.rows[0]);
    req.user = profile;
    res.json({ profile });
  } catch (error) {
    console.error("Profile update failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't save your profile right now. Please try again." });
  }
});

app.get("/api/posts", authenticate, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.content, p.created_at, u.id AS author_id, u.full_name, u.username, u.avatar_url
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 100
    `);
    res.json({ posts: result.rows.map(row => ({
      id: row.id,
      text: row.content,
      name: row.full_name,
      handle: "@" + row.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: row.full_name.split(/\\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender",
      likes: 0,
      comments: 0,
      topic: "Community",
      authorId: row.author_id
    })) });
  } catch (error) {
    console.error("Posts fetch failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't load posts right now." });
  }
});

app.post("/api/posts", authenticate, async (req, res) => {
  const content = String(req.body?.content || "").trim();
  if (!content) return res.status(400).json({ error: "Write something before publishing." });
  if (content.length > 5000) return res.status(400).json({ error: "Posts must be 5,000 characters or fewer." });
  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING id, content, created_at`,
      [req.user.id, content]
    );
    const row = result.rows[0];
    res.status(201).json({ post: {
      id: row.id,
      text: row.content,
      name: req.user.full_name,
      handle: "@" + req.user.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: req.user.full_name.split(/\\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender",
      likes: 0,
      comments: 0,
      topic: "Community",
      authorId: req.user.id
    }});
  } catch (error) {
    console.error("Post creation failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't publish your post right now. Please try again." });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => res.json({ user: req.user }));

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("gistup_session", { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/" });
  res.json({ ok: true });
});

app.use(express.static(distDir));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

async function start() {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          full_name VARCHAR(80) NOT NULL,
          email VARCHAR(254) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(30)");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160) NOT NULL DEFAULT ''");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
      await pool.query(`
        UPDATE users
        SET username = COALESCE(NULLIF(lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9_]', '', 'g')), ''), 'member') || id::text
        WHERE username IS NULL OR username = ''
      `);
      await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC, id DESC)");
      console.log("Gist Up database schema is ready.");
    } catch (error) {
      console.error("Could not initialize database:", error?.message || "unknown error");
    }
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Gist Up server listening on port ${PORT}`));
}

start();
