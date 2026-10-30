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
// Render sits behind one proxy hop; trust that hop for accurate client IP rate limiting.
app.set("trust proxy", 1);
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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === "https://gist-up.onrender.com") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait a little and try again." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Gisty AI is getting too many requests. Please wait a minute and try again." }
});
const imageLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Image generation is rate-limited. Please try again later." } });

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
    cover_url: row.cover_url || null,
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
    sameSite: isProduction ? "none" : "lax",
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
      "SELECT id, email, full_name, username, bio, avatar_url, cover_url, created_at FROM users WHERE id = $1 LIMIT 1",
      [payload.sub]
    );
    if (!result.rowCount) return res.status(401).json({ error: "Your session is no longer valid. Please log in again." });
    req.user = publicUser(result.rows[0]);
    next();
  } catch {
    res.clearCookie("gistup_session", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", path: "/" });
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

app.get("/api/settings", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT preferences FROM user_settings WHERE user_id = $1 LIMIT 1", [req.user.id]);
    return res.json({ settings: result.rows[0]?.preferences || {} });
  } catch (error) {
    console.error("Settings fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load your settings right now." });
  }
});

app.patch("/api/settings", authenticate, async (req, res) => {
  const allowed = ["darkMode", "notificationsFollowers", "notificationsEngagement", "notificationsMessages", "notificationsCommunities"];
  const updates = {};
  for (const key of allowed) {
    if (typeof req.body?.[key] === "boolean") updates[key] = req.body[key];
  }
  if (!Object.keys(updates).length) return res.status(400).json({ error: "Choose a valid setting to update." });
  try {
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, preferences) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET preferences = user_settings.preferences || EXCLUDED.preferences, updated_at = NOW()
       RETURNING preferences`,
      [req.user.id, JSON.stringify(updates)]
    );
    return res.json({ settings: result.rows[0].preferences });
  } catch (error) {
    console.error("Settings update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't save this setting right now." });
  }
});

app.post("/api/auth/change-password", authenticate, authLimiter, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Enter your current password and a new password." });
  if (newPassword.length < 8 || newPassword.length > 128) return res.status(400).json({ error: "Your new password must be between 8 and 128 characters." });
  if (currentPassword === newPassword) return res.status(400).json({ error: "Choose a new password different from your current one." });
  try {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1 LIMIT 1", [req.user.id]);
    if (!result.rowCount || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
      return res.status(400).json({ error: "Your current password is incorrect." });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, req.user.id]);
    return res.json({ ok: true, message: "Your password has been updated." });
  } catch (error) {
    console.error("Password update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update your password right now." });
  }
});

app.get("/api/account/export", authenticate, async (req, res) => {
  try {
    const [profile, posts, likes, saved, comments] = await Promise.all([
      pool.query("SELECT id, email, full_name, username, bio, avatar_url, created_at FROM users WHERE id = $1", [req.user.id]),
      pool.query("SELECT id, content, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT post_id, created_at FROM post_likes WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT post_id, created_at FROM saved_posts WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT id, post_id, content, created_at FROM post_comments WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id])
    ]);
    return res.json({
      exportedAt: new Date().toISOString(),
      profile: profile.rows[0] || null,
      posts: posts.rows,
      likes: likes.rows,
      savedPosts: saved.rows,
      comments: comments.rows
    });
  } catch (error) {
    console.error("Account export failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't export your information right now." });
  }
});

app.get("/api/profile/me", authenticate, async (req, res) => {
  try {
    const counts = await pool.query(
      "SELECT (SELECT COUNT(*)::int FROM user_follows WHERE followed_id = $1) AS followers_count, (SELECT COUNT(*)::int FROM user_follows WHERE follower_id = $1) AS following_count",
      [req.user.id]
    );
    return res.json({ profile: req.user, followersCount: counts.rows[0].followers_count, followingCount: counts.rows[0].following_count });
  } catch (error) {
    console.error("Profile counts fetch failed:", error?.message || "unknown error");
    return res.json({ profile: req.user, followersCount: 0, followingCount: 0 });
  }
});

app.patch("/api/profile/me", authenticate, async (req, res) => {
  const fullName = String(req.body?.fullName || "").trim();
  const username = cleanUsername(req.body?.username);
  const bio = String(req.body?.bio || "").trim();
  const avatarUrl = req.body?.avatarUrl === undefined ? undefined : (req.body.avatarUrl === null ? null : String(req.body.avatarUrl));
  const coverUrl = req.body?.coverUrl === undefined ? undefined : (req.body.coverUrl === null ? null : String(req.body.coverUrl));
  if (fullName.length < 2 || fullName.length > 80) {
    return res.status(400).json({ error: "Display name must be between 2 and 80 characters." });
  }
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 3–30 characters using letters, numbers, or underscores." });
  }
  if (bio.length > 160) return res.status(400).json({ error: "Bio must be 160 characters or fewer." });
  for (const image of [avatarUrl, coverUrl]) {
    if (image !== undefined && image !== null && (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 1000000)) return res.status(400).json({ error: "Images must be JPG, PNG or WebP and smaller than 1 MB after resizing." });
  }
  try {
    const duplicate = await pool.query(
      "SELECT id FROM users WHERE username = $1 AND id <> $2 LIMIT 1",
      [username, req.user.id]
    );
    if (duplicate.rowCount) return res.status(409).json({ error: "That username is already taken. Try another one." });
    const result = await pool.query(
      "UPDATE users SET full_name = $1, username = $2, bio = $3, avatar_url = COALESCE($4, avatar_url), cover_url = COALESCE($5, cover_url) WHERE id = $6 RETURNING id, email, full_name, username, bio, avatar_url, cover_url, created_at",
      [fullName, username, bio, avatarUrl, coverUrl, req.user.id]
    );
    const profile = publicUser(result.rows[0]);
    req.user = profile;
    res.json({ profile });
  } catch (error) {
    console.error("Profile update failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't save your profile right now. Please try again." });
  }
});

app.get("/api/posts", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.content, p.image_url, p.created_at, u.id AS author_id, u.full_name, u.username, u.avatar_url,
             (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
             (SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = p.id) AS comments,
             (SELECT COUNT(*)::int FROM post_reposts pr WHERE pr.post_id = p.id) AS reposts,
             EXISTS(SELECT 1 FROM post_likes mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_liked,
             EXISTS(SELECT 1 FROM post_reposts mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_reposted
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE ($2::text <> 'following' OR EXISTS (
        SELECT 1 FROM user_follows uf WHERE uf.follower_id = $1 AND uf.followed_id = u.id
      ) OR p.user_id = $1)
        AND NOT EXISTS (
          SELECT 1 FROM user_blocks b
          WHERE (b.blocker_id = $1 AND b.blocked_id = u.id)
             OR (b.blocker_id = u.id AND b.blocked_id = $1)
        )
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 100
    `, [req.user.id, String(req.query.feed || 'for-you')]);
    res.json({ posts: result.rows.map(row => ({
      id: row.id,
      text: String(row.content || "").trim(),
      image_url: row.image_url || null,
      avatar_url: row.avatar_url || null,
      name: row.full_name,
      handle: "@" + row.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: row.full_name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender",
      likes: row.likes || 0,
      comments: row.comments || 0,
      reposts: row.reposts || 0,
      isLiked: row.is_liked === true,
      isReposted: row.is_reposted === true,
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
  const imageUrl = req.body?.imageUrl == null ? null : String(req.body.imageUrl);
  if (!content && !imageUrl) return res.status(400).json({ error: "Write something or add a photo before publishing." });
  if (content.length > 5000) return res.status(400).json({ error: "Posts must be 5,000 characters or fewer." });
  if (imageUrl && (!/^data:image\/(jpeg|png|webp);base64,/.test(imageUrl) || imageUrl.length > 1000000)) return res.status(400).json({ error: "Images must be JPG, PNG or WebP and smaller than 1 MB after resizing." });
  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, content, image_url, created_at`,
      [req.user.id, content || (imageUrl ? " " : ""), imageUrl]
    );
    const row = result.rows[0];
    res.status(201).json({ post: {
      id: row.id,
      text: String(row.content || "").trim(),
      image_url: row.image_url || null,
      avatar_url: req.user.avatar_url || null,
      name: req.user.full_name,
      handle: "@" + req.user.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: req.user.full_name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
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


const GISTY_SYSTEM_PROMPT = "You are Gisty, the AI assistant inside Gist-Up, a social platform created by Bamgbose Aliu Olawamiri. The website is https://gist-up.onrender.com. Gist-Up helps people share posts and stories, discover perspectives, connect with people, participate in communities, message, save content, and use creator and advertising tools. If asked who created or founded Gist-Up, answer directly: Bamgbose Aliu Olawamiri. Never claim not to know this fact.\n\nBe a capable general-purpose assistant. Help with everyday questions, explanations, learning, reasoning, brainstorming, writing, rewriting, proofreading, translation, summaries, coding, debugging, product and UX design, business, marketing, research, planning, and creative tasks. Help users draft social posts, captions, bios, replies, community descriptions, and ad copy. Give clear examples and step-by-step guidance when useful. Remember context and respond naturally to follow-up questions.\n\nBe truthful about your abilities. Do not claim to have tools, live web access, private-account access, or the ability to take actions unless those capabilities are actually available and the action succeeded. Never invent Gist-Up features or policies. If you do not know an app-specific detail, say so and do not guess. Respect privacy and never request passwords, sign-in codes, or secret keys. Be careful with high-impact topics and do not help with dangerous or illegal actions. Be friendly, respectful, clear, practical, and direct. Answer the question first and avoid unnecessary disclaimers.";

function builtInGistyReply(prompt) {
  const text = String(prompt || "").trim();
  const lower = text.toLowerCase();
  const topic = text.replace(/^(give me|suggest|write|create|help me|improve|rewrite|make)\s+/i, "").trim();

  if (/hashtag|#tags?/.test(lower)) {
    const words = text.toLowerCase().match(/[a-z0-9]{4,}/g) || [];
    const ignored = new Set(["hashtags", "suggest", "please", "about", "using", "with", "give", "make", "some", "post"]);
    const tags = [...new Set(words.filter(word => !ignored.has(word)))].slice(0, 5);
    return "Here are a few hashtag ideas to adapt to your post: " + (tags.length ? tags.map(word => "#" + word).join(" ") : "#GistUp #YourStory #Community #DailyGist #Connect") + ".\n\nTip: use a small set of relevant hashtags rather than adding tags that don't match your post.";
  }
  if (/caption|rewrite|improve|polish|make it better/.test(lower)) {
    const supplied = text.replace(/^(please\s+)?(improve|rewrite|polish|make)\s+(my\s+)?(caption|this|it)?\s*[:—-]?\s*/i, "").trim();
    if (supplied && supplied.length > 12 && !/^(my caption|this caption|it|caption)$/i.test(supplied)) {
      return "Here’s a clearer version you can adapt:\n\n" + supplied.replace(/\s+/g, " ").replace(/[.!?]*$/, "") + ".\n\nIf you want, add one personal detail or a question at the end to invite people to join the conversation.";
    }
    return "Paste the caption you want to improve, and I can help polish it. A simple structure is: your main point + one personal detail + a question that invites replies.";
  }
  if (/post idea|ideas for|content idea|what should i post/.test(lower)) {
    return "Here are 5 post ideas for Gist Up:\n\n1. A small win you had this week.\n2. Something useful you learned recently.\n3. Ask your community for recommendations.\n4. Share a behind-the-scenes look at something you’re building.\n5. Start a friendly debate about a topic your community cares about.\n\nChoose the one that feels most like you and add your own experience.";
  }
  if (/community|conversation topic|discussion topic/.test(lower)) {
    return "Try one of these community conversation starters:\n\n• What is one thing you wish more people understood about your interests?\n• What are you learning or working on this month?\n• What local place, tool, or resource would you recommend to others?\n• What small win are you celebrating today?\n\nKeep the question welcoming and avoid asking people to share private information.";
  }
  if (/bio|profile description/.test(lower)) {
    return "A simple profile bio formula is: what you’re interested in + what you share here + one personal detail.\n\nExample: “Creative thinker sharing my projects, lessons, and everyday moments. Always learning and open to good conversations.”\n\nReplace the example with details that are true for you.";
  }
  if (/hello|hi there|hey gisty|^hi[!. ]*$/.test(lower)) {
    return "Hey! I’m Gisty AI’s built-in starter assistant. I can help with post ideas, captions, hashtags, profile bios, and community conversation starters. What are you creating today?";
  }
  return "I can help with a few Gist Up writing tasks right now: try “Give me post ideas,” “Improve my caption: [paste your caption],” “Suggest hashtags for my post about [topic],” or “Suggest a community topic.”\n\nThis is the built-in starter mode, not a full conversational AI model. We’re keeping it available while we work on a suitable AI provider connection.";
}

app.get("/api/ai/status", authenticate, async (_req, res) => {
  const provider = process.env.OPENROUTER_API_KEY ? "openrouter" : process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : null;
  const model = provider === "openrouter"
    ? (process.env.OPENROUTER_MODEL || "openrouter/free")
    : provider === "gemini"
      ? (process.env.GEMINI_MODEL || "gemini-2.5-flash")
      : provider === "openai"
        ? (process.env.OPENAI_MODEL || "gpt-4o-mini")
        : null;
  return res.json({ configured: Boolean(provider), provider: provider || "built-in", model: model || "Starter writing tools", starterMode: !provider });
});

app.post("/api/ai/chat", authenticate, aiLimiter, async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Write a message for Gisty AI first." });
  if (prompt.length > 2000) return res.status(400).json({ error: "Keep your message under 2,000 characters." });
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-18).map(item => ({ role: item?.role === "assistant" ? "assistant" : "user", content: String(item?.content || "").slice(0, 2000) })).filter(item => item.content.trim()) : [{ role: "user", content: prompt }];
  while (messages.length && messages[0].role !== "user") messages.shift();

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openRouterKey && !geminiKey && !openaiKey) {
    return res.json({ reply: builtInGistyReply(prompt), mode: "built-in" });
  }

  try {
    let response;
    let reply = "";

    if (openRouterKey) {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + openRouterKey,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://gist-up.onrender.com",
          "X-Title": "Gist Up - Gisty AI"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openrouter/free",
          messages: [
            { role: "system", content: GISTY_SYSTEM_PROMPT },
            ...messages.map(item => ({ role: item.role, content: item.content }))
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("OpenRouter provider request failed:", response.status, data?.error?.code || data?.error?.message || "provider_error");
        if (response.status === 429) return res.json({ reply: builtInGistyReply(prompt), mode: "built-in" });
        return res.status(502).json({ error: "Gisty AI couldn't respond right now. Check that your OpenRouter key and free model are available." });
      }
      reply = String(data?.choices?.[0]?.message?.content || "").trim();
    } else if (geminiKey) {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: GISTY_SYSTEM_PROMPT }] },
          contents: messages.map(item => ({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.content }] })),
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Gemini provider request failed:", response.status, data?.error?.status || data?.error?.code || "provider_error");
        if (response.status === 429) return res.json({ reply: builtInGistyReply(prompt), mode: "built-in" });
        return res.status(502).json({ error: "Gisty AI couldn't respond right now. Please try again shortly." });
      }
      reply = String(data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "").trim();
    } else {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + openaiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: GISTY_SYSTEM_PROMPT },
            ...messages.map(item => ({ role: item.role, content: item.content }))
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("OpenAI provider request failed:", response.status, data?.error?.type || "provider_error");
        if (response.status === 429) return res.json({ reply: builtInGistyReply(prompt), mode: "built-in" });
        return res.status(502).json({ error: "Gisty AI couldn't respond right now. Please try again shortly." });
      }
      reply = String(data?.choices?.[0]?.message?.content || "").trim();
    }

    if (!reply) return res.status(502).json({ error: "Gisty AI returned an empty reply. Please try again." });
    return res.json({ reply });
  } catch (error) {
    console.error("AI request failed:", error?.message || "unknown error");
    return res.status(502).json({ error: "Gisty AI couldn't connect right now. Please try again shortly." });
  }
});

app.post("/api/ai/image", authenticate, imageLimiter, async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Describe the picture you want Gisty AI to create." });
  if (prompt.length > 1200) return res.status(400).json({ error: "Keep image descriptions under 1,200 characters." });

  // Image generation runs through a private Cloudflare Worker. OpenRouter remains the text-chat provider.
  const workerUrl = process.env.GISTY_IMAGE_WORKER_URL;
  const workerSecret = process.env.GISTY_IMAGE_WORKER_SECRET;
  const model = "@cf/black-forest-labs/flux-2-klein-4b";
  if (!workerUrl || !workerSecret) return res.status(503).json({ error: "Gisty image generation is not configured yet. Please try again later." });

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + workerSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) {
      const providerMessage = await response.text().catch(() => "");
      console.error("Cloudflare image request failed:", response.status, providerMessage.slice(0, 300));
      if (response.status === 401) return res.status(502).json({ error: "Gisty image service authentication needs attention. Please try again later." });
      if (response.status === 429) return res.status(429).json({ error: "Image generation is temporarily rate-limited. Please wait a little and try again." });
      return res.status(502).json({ error: "Gisty couldn't create this picture right now. Please try again shortly." });
    }
    const imageBytes = Buffer.from(await response.arrayBuffer());
    if (!imageBytes.length || !String(response.headers.get("content-type") || "").startsWith("image/")) {
      return res.status(502).json({ error: "Gisty image service returned an invalid image. Please try again." });
    }
    return res.json({ imageUrl: "data:image/png;base64," + imageBytes.toString("base64"), model });
  } catch (error) {
    console.error("Cloudflare image request failed:", error?.message || "unknown error");
    return res.status(502).json({ error: "Gisty AI couldn't connect to the image service. Please try again shortly." });
  }
});

app.get("/api/ads/campaigns", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, goal, daily_budget, audience, status, created_at FROM ad_campaigns WHERE advertiser_id = $1 ORDER BY created_at DESC, id DESC LIMIT 100",
      [req.user.id]
    );
    return res.json({ campaigns: result.rows });
  } catch (error) {
    console.error("Campaigns fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load campaigns right now." });
  }
});

app.post("/api/ads/campaigns", authenticate, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const goal = String(req.body?.goal || "").trim();
  const audience = String(req.body?.audience || "").trim();
  const dailyBudget = Number(req.body?.dailyBudget);
  const allowedGoals = ["Reach", "Engagement", "Website visits", "Followers"];
  if (name.length < 3 || name.length > 100) return res.status(400).json({ error: "Campaign name must be 3–100 characters." });
  if (!allowedGoals.includes(goal)) return res.status(400).json({ error: "Choose a valid campaign goal." });
  if (!Number.isFinite(dailyBudget) || dailyBudget < 100 || dailyBudget > 100000000) {
    return res.status(400).json({ error: "Daily budget must be between ₦100 and ₦100,000,000." });
  }
  if (audience.length > 240) return res.status(400).json({ error: "Audience description must be 240 characters or fewer." });
  try {
    const result = await pool.query(
      "INSERT INTO ad_campaigns (advertiser_id, name, goal, daily_budget, audience, status) VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING id, name, goal, daily_budget, audience, status, created_at",
      [req.user.id, name, goal, dailyBudget, audience]
    );
    return res.status(201).json({ campaign: result.rows[0] });
  } catch (error) {
    console.error("Campaign creation failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't save this campaign right now." });
  }
});

app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.type, n.post_id, n.created_at, n.is_read,
              a.id AS actor_id, a.full_name AS actor_name, a.username AS actor_username
       FROM notifications n LEFT JOIN users a ON a.id = n.actor_id
       WHERE n.recipient_id = $1 ORDER BY n.created_at DESC, n.id DESC LIMIT 100`,
      [req.user.id]
    );
    return res.json({ notifications: result.rows });
  } catch (error) {
    console.error("Notifications fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load notifications right now." });
  }
});

app.patch("/api/notifications/read-all", authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE", [req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error("Notifications read update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update notifications right now." });
  }
});

app.post("/api/posts/:id/repost", authenticate, async (req, res) => {
  const reposted = req.body?.reposted === true;
  try {
    const post = await pool.query("SELECT id FROM posts WHERE id = $1 LIMIT 1", [req.params.id]);
    if (!post.rowCount) return res.status(404).json({ error: "Post not found." });
    if (reposted) {
      await pool.query("INSERT INTO post_reposts (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.user.id, req.params.id]);
    } else {
      await pool.query("DELETE FROM post_reposts WHERE user_id = $1 AND post_id = $2", [req.user.id, req.params.id]);
    }
    if (reposted) {
      await pool.query(
        "INSERT INTO notifications (recipient_id, actor_id, type, post_id) SELECT p.user_id, $1, 'repost', p.id FROM posts p WHERE p.id = $2 AND p.user_id <> $1 AND COALESCE((SELECT (preferences->>'notificationsEngagement')::boolean FROM user_settings WHERE user_id = p.user_id), TRUE)",
        [req.user.id, req.params.id]
      );
    }
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM post_reposts WHERE post_id = $1", [req.params.id]);
    return res.json({ reposted, reposts: count.rows[0].count });
  } catch (error) {
    console.error("Post repost failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update this repost right now." });
  }
});

app.post("/api/posts/:id/report", authenticate, async (req, res) => {
  const allowedReasons = ["Spam", "Harassment or bullying", "Hate or abuse", "False information", "Other"];
  const reason = String(req.body?.reason || "");
  const details = String(req.body?.details || "").trim();
  if (!allowedReasons.includes(reason)) return res.status(400).json({ error: "Choose a report reason." });
  if (details.length > 500) return res.status(400).json({ error: "Additional details must be 500 characters or fewer." });
  try {
    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1 LIMIT 1", [req.params.id]);
    if (!post.rowCount) return res.status(404).json({ error: "Post not found." });
    if (Number(post.rows[0].user_id) === Number(req.user.id)) return res.status(400).json({ error: "You can't report your own post." });
    await pool.query(
      `INSERT INTO post_reports (reporter_id, post_id, reason, details)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (reporter_id, post_id)
       DO UPDATE SET reason = EXCLUDED.reason, details = EXCLUDED.details, status = 'pending', created_at = NOW()`,
      [req.user.id, req.params.id, reason, details]
    );
    return res.status(201).json({ ok: true, message: "Thanks. Your report has been sent for review." });
  } catch (error) {
    console.error("Post report failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't submit your report right now." });
  }
});

app.get("/api/likes/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.id AS author_id, u.full_name, u.username,
              (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
              (SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = p.id) AS comments,
              (SELECT COUNT(*)::int FROM post_reposts pr WHERE pr.post_id = p.id) AS reposts,
              EXISTS(SELECT 1 FROM post_reposts mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_reposted
       FROM post_likes mine JOIN posts p ON p.id = mine.post_id JOIN users u ON u.id = p.user_id
       WHERE mine.user_id = $1
         AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = $1))
       ORDER BY mine.created_at DESC LIMIT 200`,
      [req.user.id]
    );
    return res.json({ posts: result.rows.map(row => ({
      id: row.id, text: String(row.content || "").trim(), name: row.full_name, handle: "@" + row.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: row.full_name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender", likes: row.likes || 0, comments: row.comments || 0,
      reposts: row.reposts || 0, isLiked: true, isReposted: row.is_reposted === true,
      topic: "Community", authorId: row.author_id
    })) });
  } catch (error) {
    console.error("Liked posts fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load liked posts right now." });
  }
});

app.get("/api/comments/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, p.id AS post_id, p.content AS post_content,
              u.full_name AS post_author_name, u.username AS post_author_username
       FROM post_comments c
       JOIN posts p ON p.id = c.post_id
       JOIN users u ON u.id = p.user_id
       WHERE c.user_id = $1
         AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = $1))
       ORDER BY c.created_at DESC
       LIMIT 200`,
      [req.user.id]
    );
    return res.json({ replies: result.rows });
  } catch (error) {
    console.error("My replies fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load your replies right now." });
  }
});

app.get("/api/saved", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.id AS author_id, u.full_name, u.username, u.avatar_url,
              (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
              (SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = p.id) AS comments,
              EXISTS(SELECT 1 FROM post_likes mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_liked
       FROM saved_posts sp JOIN posts p ON p.id = sp.post_id JOIN users u ON u.id = p.user_id
       WHERE sp.user_id = $1 ORDER BY sp.created_at DESC LIMIT 200`,
      [req.user.id]
    );
    return res.json({ posts: result.rows.map(row => ({
      id: row.id, text: String(row.content || "").trim(), name: row.full_name, handle: "@" + row.username,
      time: new Date(row.created_at).toLocaleString(),
      initials: row.full_name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender", likes: row.likes || 0, comments: row.comments || 0,
      isLiked: row.is_liked === true, topic: "Community", authorId: row.author_id
    })) });
  } catch (error) {
    console.error("Saved posts fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load saved posts right now." });
  }
});

app.post("/api/posts/:id/save", authenticate, async (req, res) => {
  const saved = req.body?.saved === true;
  try {
    const post = await pool.query("SELECT id FROM posts WHERE id = $1 LIMIT 1", [req.params.id]);
    if (!post.rowCount) return res.status(404).json({ error: "Post not found." });
    if (saved) {
      await pool.query("INSERT INTO saved_posts (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.user.id, req.params.id]);
    } else {
      await pool.query("DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2", [req.user.id, req.params.id]);
    }
    return res.json({ saved, postId: Number(req.params.id) });
  } catch (error) {
    console.error("Save post failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update saved posts right now." });
  }
});

app.post("/api/posts/:id/like", authenticate, async (req, res) => {
  try {
    const post = await pool.query("SELECT id FROM posts WHERE id = $1 LIMIT 1", [req.params.id]);
    if (!post.rowCount) return res.status(404).json({ error: "Post not found." });
    const existing = await pool.query("SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2 LIMIT 1", [req.user.id, req.params.id]);
    let liked;
    if (existing.rowCount) {
      await pool.query("DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2", [req.user.id, req.params.id]);
      liked = false;
    } else {
      await pool.query("INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.user.id, req.params.id]);
      liked = true;
      await pool.query(
        "INSERT INTO notifications (recipient_id, actor_id, type, post_id) SELECT p.user_id, $1, 'like', p.id FROM posts p WHERE p.id = $2 AND p.user_id <> $1 AND COALESCE((SELECT (preferences->>'notificationsEngagement')::boolean FROM user_settings WHERE user_id = p.user_id), TRUE)",
        [req.user.id, req.params.id]
      );
    }
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1", [req.params.id]);
    return res.json({ liked, likes: count.rows[0].count });
  } catch (error) {
    console.error("Post like failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update that like right now." });
  }
});

app.get("/api/posts/:id/comments", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.content, c.created_at, u.id AS user_id, u.full_name, u.username
      FROM post_comments c JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC, c.id ASC
      LIMIT 200
    `, [req.params.id]);
    return res.json({ comments: result.rows });
  } catch (error) {
    console.error("Post comments fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load comments right now." });
  }
});

app.post("/api/posts/:id/comments", authenticate, async (req, res) => {
  const content = String(req.body?.content || "").trim();
  if (!content) return res.status(400).json({ error: "Write a comment first." });
  if (content.length > 2000) return res.status(400).json({ error: "Comments must be 2,000 characters or fewer." });
  try {
    const result = await pool.query(`
      INSERT INTO post_comments (post_id, user_id, content)
      SELECT p.id, $2, $3 FROM posts p WHERE p.id = $1
      RETURNING id, post_id, user_id, content, created_at
    `, [req.params.id, req.user.id, content]);
    if (!result.rowCount) return res.status(404).json({ error: "Post not found." });
    await pool.query(
      "INSERT INTO notifications (recipient_id, actor_id, type, post_id) SELECT p.user_id, $1, 'comment', p.id FROM posts p WHERE p.id = $2 AND p.user_id <> $1 AND COALESCE((SELECT (preferences->>'notificationsEngagement')::boolean FROM user_settings WHERE user_id = p.user_id), TRUE)",
      [req.user.id, req.params.id]
    );
    return res.status(201).json({ comment: { ...result.rows[0], full_name: req.user.full_name, username: req.user.username } });
  } catch (error) {
    console.error("Post comment failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't publish that comment right now." });
  }
});

app.get("/api/users", authenticate, async (req, res) => {
  const search = String(req.query.search || "").trim().slice(0, 80);
  if (search && search.length < 2) return res.json({ users: [] });
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.bio, u.avatar_url,
              EXISTS(SELECT 1 FROM user_follows mine WHERE mine.follower_id = $1 AND mine.followed_id = u.id) AS is_following,
              (SELECT COUNT(*)::int FROM user_follows followers WHERE followers.followed_id = u.id) AS followers_count,
              (SELECT COUNT(*)::int FROM user_follows following WHERE following.follower_id = u.id) AS following_count
       FROM users u
       WHERE u.id <> $1
         AND ($2::text = '' OR u.full_name ILIKE $3 OR u.username ILIKE $3)
         AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = $1))
       ORDER BY EXISTS(SELECT 1 FROM user_follows prioritized WHERE prioritized.follower_id = $1 AND prioritized.followed_id = u.id) DESC, followers_count DESC, u.created_at DESC
       LIMIT 30`,
      [req.user.id, search, "%" + search + "%"]
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("User search failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't search accounts right now." });
  }
});

app.get("/api/users/:id/profile", authenticate, async (req, res) => {
  const targetId = String(req.params.id || "");
  if (!/^\d+$/.test(targetId)) return res.status(400).json({ error: "Choose a valid account." });
  if (targetId === String(req.user.id)) return res.json({ profile: req.user, isFollowing: false, followsYou: false, posts: [] });
  try {
    const blocked = await pool.query(
      "SELECT 1 FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1) LIMIT 1",
      [req.user.id, targetId]
    );
    if (blocked.rowCount) return res.status(403).json({ error: "This profile isn't available." });
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.username, u.bio, u.avatar_url, u.created_at,
              EXISTS(SELECT 1 FROM user_follows f WHERE f.follower_id = $1 AND f.followed_id = u.id) AS is_following,
              EXISTS(SELECT 1 FROM user_follows f WHERE f.follower_id = u.id AND f.followed_id = $1) AS follows_you,
              (SELECT COUNT(*)::int FROM user_follows f WHERE f.followed_id = u.id) AS followers_count,
              (SELECT COUNT(*)::int FROM user_follows f WHERE f.follower_id = u.id) AS following_count
       FROM users u WHERE u.id = $2 LIMIT 1`,
      [req.user.id, targetId]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Account not found." });
    const row = result.rows[0];
    const postsResult = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.id AS author_id, u.full_name, u.username, u.avatar_url,
              (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
              (SELECT COUNT(*)::int FROM post_comments pc WHERE pc.post_id = p.id) AS comments,
              (SELECT COUNT(*)::int FROM post_reposts pr WHERE pr.post_id = p.id) AS reposts,
              EXISTS(SELECT 1 FROM post_likes mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_liked,
              EXISTS(SELECT 1 FROM post_reposts mine WHERE mine.post_id = p.id AND mine.user_id = $1) AS is_reposted
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $2
       ORDER BY p.created_at DESC, p.id DESC LIMIT 100`,
      [req.user.id, targetId]
    );
    const posts = postsResult.rows.map(post => ({
      id: post.id, text: post.content, name: post.full_name, handle: "@" + post.username,
      time: new Date(post.created_at).toLocaleString(),
      initials: String(post.full_name || post.username).split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      tone: "lavender", likes: post.likes || 0, comments: post.comments || 0, reposts: post.reposts || 0,
      isLiked: post.is_liked === true, isReposted: post.is_reposted === true, topic: "Community", authorId: post.author_id
    }));
    return res.json({
      profile: publicUser(row),
      isFollowing: row.is_following === true,
      followsYou: row.follows_you === true,
      followersCount: Number(row.followers_count || 0),
      followingCount: Number(row.following_count || 0),
      posts
    });
  } catch (error) {
    console.error("User profile fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load this profile right now." });
  }
});

app.get("/api/blocks/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.bio, u.avatar_url
       FROM user_blocks b JOIN users u ON u.id = b.blocked_id
       WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    return res.json({ users: result.rows });
  } catch (error) {
    console.error("Blocked list fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load blocked accounts right now." });
  }
});

app.post("/api/users/:id/block", authenticate, async (req, res) => {
  const targetId = String(req.params.id || "");
  const blocked = req.body?.blocked === true;
  if (!/^\d+$/.test(targetId) || targetId === String(req.user.id)) {
    return res.status(400).json({ error: "Choose a valid account to block." });
  }
  try {
    const target = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [targetId]);
    if (!target.rowCount) return res.status(404).json({ error: "Account not found." });
    if (blocked) {
      await pool.query("INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.user.id, targetId]);
      await pool.query("DELETE FROM user_follows WHERE (follower_id = $1 AND followed_id = $2) OR (follower_id = $2 AND followed_id = $1)", [req.user.id, targetId]);
    } else {
      await pool.query("DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2", [req.user.id, targetId]);
    }
    return res.json({ ok: true, blocked, userId: Number(targetId) });
  } catch (error) {
    console.error("Block update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update blocked accounts right now." });
  }
});

app.post("/api/users/:id/follow", authenticate, async (req, res) => {
  const targetId = String(req.params.id || "");
  if (!/^\d+$/.test(targetId) || targetId === String(req.user.id)) {
    return res.status(400).json({ error: "Choose a valid account to follow." });
  }
  try {
    const target = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [targetId]);
    if (!target.rowCount) return res.status(404).json({ error: "Account not found." });
    const existing = await pool.query("SELECT 1 FROM user_follows WHERE follower_id = $1 AND followed_id = $2", [req.user.id, targetId]);
    let following;
    if (existing.rowCount) {
      await pool.query("DELETE FROM user_follows WHERE follower_id = $1 AND followed_id = $2", [req.user.id, targetId]);
      following = false;
    } else {
      await pool.query("INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.user.id, targetId]);
      following = true;
      await pool.query(
        "INSERT INTO notifications (recipient_id, actor_id, type) SELECT $1, $2, 'follow' WHERE COALESCE((SELECT (preferences->>'notificationsFollowers')::boolean FROM user_settings WHERE user_id = $1), TRUE)",
        [targetId, req.user.id]
      );
    }
    const counts = await pool.query(
      "SELECT (SELECT COUNT(*)::int FROM user_follows WHERE follower_id = $1) AS following_count, (SELECT COUNT(*)::int FROM user_follows WHERE followed_id = $1) AS followers_count",
      [targetId]
    );
    return res.json({ following, userId: Number(targetId), followersCount: counts.rows[0].followers_count, myFollowingCount: (await pool.query("SELECT COUNT(*)::int AS count FROM user_follows WHERE follower_id = $1", [req.user.id])).rows[0].count });
  } catch (error) {
    console.error("Follow update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update that connection right now." });
  }
});

app.get("/api/follows/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.bio, u.avatar_url
       FROM user_follows f JOIN users u ON u.id = f.followed_id
       WHERE f.follower_id = $1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Following list fetch failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't load your connections right now." });
  }
});

app.get("/api/communities", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at, u.full_name AS creator_name,
              (SELECT COUNT(*)::int FROM community_memberships cm WHERE cm.community_id = c.id) AS member_count,
              EXISTS(SELECT 1 FROM community_memberships mine WHERE mine.community_id = c.id AND mine.user_id = $1) AS is_member
       FROM communities c JOIN users u ON u.id = c.creator_id
       ORDER BY member_count DESC, c.created_at DESC, c.id DESC LIMIT 100`,
      [req.user.id]
    );
    return res.json({ communities: result.rows });
  } catch (error) {
    console.error("Communities fetch failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't load communities right now." });
  }
});

app.post("/api/communities", authenticate, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const description = String(req.body?.description || "").trim();
  if (name.length < 3 || name.length > 70) return res.status(400).json({ error: "Community name must be 3–70 characters." });
  if (description.length < 10 || description.length > 300) return res.status(400).json({ error: "Description must be 10–300 characters." });
  try {
    const result = await pool.query(
      "INSERT INTO communities (creator_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description, created_at",
      [req.user.id, name, description]
    );
    await pool.query("INSERT INTO community_memberships (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [result.rows[0].id, req.user.id]);
    return res.status(201).json({ community: { ...result.rows[0], creator_name: req.user.full_name, member_count: 1, is_member: true } });
  } catch (error) {
    console.error("Community creation failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't create this community right now." });
  }
});

app.post("/api/communities/:id/join", authenticate, async (req, res) => {
  const communityId = String(req.params.id || "");
  if (!/^\d+$/.test(communityId)) return res.status(400).json({ error: "Choose a valid community." });
  try {
    const found = await pool.query("SELECT id, creator_id FROM communities WHERE id = $1 LIMIT 1", [communityId]);
    if (!found.rowCount) return res.status(404).json({ error: "Community not found." });
    const existing = await pool.query("SELECT 1 FROM community_memberships WHERE community_id = $1 AND user_id = $2", [communityId, req.user.id]);
    const joined = !existing.rowCount;
    if (joined) {
      await pool.query("INSERT INTO community_memberships (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [communityId, req.user.id]);
      const creatorId = found.rows[0].creator_id;
      if (String(creatorId) !== String(req.user.id)) {
        await pool.query(
          `INSERT INTO notifications (recipient_id, actor_id, type)
           SELECT $1, $2, 'community'
           WHERE COALESCE((SELECT (preferences->>'notificationsCommunities')::boolean FROM user_settings WHERE user_id = $1), TRUE)`,
          [creatorId, req.user.id]
        );
      }
    } else {
      await pool.query("DELETE FROM community_memberships WHERE community_id = $1 AND user_id = $2", [communityId, req.user.id]);
    }
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM community_memberships WHERE community_id = $1", [communityId]);
    return res.json({ joined, member_count: count.rows[0].count });
  } catch (error) {
    console.error("Community membership update failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "We couldn't update community membership right now." });
  }
});

app.get("/api/conversations", authenticate, async (req, res) => {
  const includeArchived = String(req.query.archived || "false") === "true";
  try {
    const result = await pool.query(
      `SELECT c.id,
              CASE WHEN c.user_a_id = $1 THEN ub.id ELSE ua.id END AS other_user_id,
              CASE WHEN c.user_a_id = $1 THEN ub.full_name ELSE ua.full_name END AS full_name,
              CASE WHEN c.user_a_id = $1 THEN ub.username ELSE ua.username END AS username,
              CASE WHEN c.user_a_id = $1 THEN ub.avatar_url ELSE ua.avatar_url END AS avatar_url,
              lm.content AS last_message,
              lm.created_at AS last_message_at,
              (a.conversation_id IS NOT NULL) AS archived
       FROM conversations c
       JOIN users ua ON ua.id = c.user_a_id
       JOIN users ub ON ub.id = c.user_b_id
       LEFT JOIN LATERAL (
         SELECT content, created_at FROM direct_messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC, id DESC LIMIT 1
       ) lm ON TRUE
       LEFT JOIN conversation_archives a ON a.conversation_id = c.id AND a.user_id = $1
       WHERE (c.user_a_id = $1 OR c.user_b_id = $1)
         AND (CASE WHEN $2 THEN a.conversation_id IS NOT NULL ELSE a.conversation_id IS NULL END)
       ORDER BY COALESCE(lm.created_at, c.created_at) DESC, c.id DESC
       LIMIT 100`,
      [req.user.id, includeArchived]
    );
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error("Conversations fetch failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't load your conversations right now." });
  }
});

app.post("/api/conversations", authenticate, async (req, res) => {
  const otherId = String(req.body?.userId || "");
  if (!/^\d+$/.test(otherId) || otherId === String(req.user.id)) {
    return res.status(400).json({ error: "Choose another registered user to start a conversation." });
  }
  try {
    const found = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [otherId]);
    if (!found.rowCount) return res.status(404).json({ error: "That account could not be found." });
    const blockCheck = await pool.query("SELECT 1 FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1) LIMIT 1", [req.user.id, otherId]);
    if (blockCheck.rowCount) return res.status(403).json({ error: "You can't start a conversation with this account." });
    const a = BigInt(req.user.id) < BigInt(otherId) ? req.user.id : otherId;
    const b = BigInt(req.user.id) < BigInt(otherId) ? otherId : req.user.id;
    await pool.query(
      "INSERT INTO conversations (user_a_id, user_b_id) VALUES ($1, $2) ON CONFLICT (user_a_id, user_b_id) DO NOTHING",
      [String(a), String(b)]
    );
    const result = await pool.query(
      "SELECT id FROM conversations WHERE user_a_id = $1 AND user_b_id = $2 LIMIT 1",
      [String(a), String(b)]
    );
    res.status(201).json({ conversationId: result.rows[0].id });
  } catch (error) {
    console.error("Conversation create failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't start that conversation right now." });
  }
});

app.get("/api/conversations/:id/messages", authenticate, async (req, res) => {
  try {
    const access = await pool.query(
      "SELECT id FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2) LIMIT 1",
      [req.params.id, req.user.id]
    );
    if (!access.rowCount) return res.status(404).json({ error: "Conversation not found." });
    const blockCheck = await pool.query("SELECT 1 FROM conversations c WHERE c.id = $1 AND EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $2 AND b.blocked_id = CASE WHEN c.user_a_id = $2 THEN c.user_b_id ELSE c.user_a_id END) OR (b.blocker_id = CASE WHEN c.user_a_id = $2 THEN c.user_b_id ELSE c.user_a_id END AND b.blocked_id = $2))", [req.params.id, req.user.id]);
    if (blockCheck.rowCount) return res.status(403).json({ error: "Messaging is unavailable for this conversation." });
    const result = await pool.query(
      `SELECT m.id, m.content, m.created_at, m.sender_id,
              u.full_name AS sender_name, u.username AS sender_username
       FROM direct_messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC, m.id ASC
       LIMIT 200`,
      [req.params.id]
    );
    res.json({ messages: result.rows });
  } catch (error) {
    console.error("Messages fetch failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't load messages right now." });
  }
});

app.post("/api/conversations/:id/messages", authenticate, async (req, res) => {
  const content = String(req.body?.content || "").trim();
  if (!content) return res.status(400).json({ error: "Write a message before sending." });
  if (content.length > 4000) return res.status(400).json({ error: "Messages must be 4,000 characters or fewer." });
  try {
    const access = await pool.query(
      "SELECT id FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2) LIMIT 1",
      [req.params.id, req.user.id]
    );
    if (!access.rowCount) return res.status(404).json({ error: "Conversation not found." });
    const blockCheck = await pool.query("SELECT 1 FROM conversations c WHERE c.id = $1 AND EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = $2 AND b.blocked_id = CASE WHEN c.user_a_id = $2 THEN c.user_b_id ELSE c.user_a_id END) OR (b.blocker_id = CASE WHEN c.user_a_id = $2 THEN c.user_b_id ELSE c.user_a_id END AND b.blocked_id = $2))", [req.params.id, req.user.id]);
    if (blockCheck.rowCount) return res.status(403).json({ error: "Messaging is unavailable for this conversation." });
    const result = await pool.query(
      `INSERT INTO direct_messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at, sender_id`,
      [req.params.id, req.user.id, content]
    );
    await pool.query(
      "INSERT INTO notifications (recipient_id, actor_id, type) SELECT recipient.id, $2, 'message' FROM conversations c CROSS JOIN LATERAL (SELECT CASE WHEN c.user_a_id = $2 THEN c.user_b_id ELSE c.user_a_id END AS id) recipient WHERE c.id = $1 AND COALESCE((SELECT (preferences->>'notificationsMessages')::boolean FROM user_settings WHERE user_id = recipient.id), TRUE)",
      [req.params.id, req.user.id]
    );
    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error("Message send failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't send that message right now." });
  }
});

app.patch("/api/conversations/:id/archive", authenticate, async (req, res) => {
  const archived = req.body?.archived === true;
  try {
    const access = await pool.query(
      "SELECT id FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2) LIMIT 1",
      [req.params.id, req.user.id]
    );
    if (!access.rowCount) return res.status(404).json({ error: "Conversation not found." });
    if (archived) {
      await pool.query(
        "INSERT INTO conversation_archives (user_id, conversation_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [req.user.id, req.params.id]
      );
    } else {
      await pool.query(
        "DELETE FROM conversation_archives WHERE user_id = $1 AND conversation_id = $2",
        [req.user.id, req.params.id]
      );
    }
    res.json({ ok: true, archived });
  } catch (error) {
    console.error("Conversation archive failed:", error?.message || "unknown error");
    res.status(500).json({ error: "We couldn't update that conversation right now." });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => res.json({ user: req.user }));

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("gistup_session", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", path: "/" });
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
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT");
      await pool.query(`
        UPDATE users
        SET username = left(COALESCE(NULLIF(lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9_]', '', 'g')), ''), 'member'), greatest(1, 30 - length(id::text))) || id::text
        WHERE username IS NULL OR username = ''
      `);
      await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT");
      await pool.query("CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC, id DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_follows (
          follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (follower_id, followed_id),
          CHECK (follower_id <> followed_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS user_follows_followed_idx ON user_follows (followed_id, created_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS communities (
          id BIGSERIAL PRIMARY KEY,
          creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(70) NOT NULL,
          description VARCHAR(300) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS communities_name_unique ON communities (lower(name))");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS community_memberships (
          community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (community_id, user_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS community_memberships_user_idx ON community_memberships (user_id, joined_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_blocks (
          blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          blocked_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (blocker_id, blocked_id),
          CHECK (blocker_id <> blocked_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON user_blocks (blocked_id, blocker_id)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS post_likes (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, post_id)
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS post_comments (
          id BIGSERIAL PRIMARY KEY,
          post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS post_comments_post_created_idx ON post_comments (post_id, created_at, id)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS post_reposts (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, post_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS post_reposts_post_created_idx ON post_reposts (post_id, created_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS saved_posts (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, post_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS saved_posts_user_created_idx ON saved_posts (user_id, created_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id BIGSERIAL PRIMARY KEY,
          recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          actor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'message')),
          post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          is_read BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);
      await pool.query("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
      await pool.query("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('follow', 'like', 'comment', 'message', 'repost', 'community'))");
      await pool.query("CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications (recipient_id, created_at DESC, id DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS post_reports (
          id BIGSERIAL PRIMARY KEY,
          reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          reason VARCHAR(40) NOT NULL CHECK (reason IN ('Spam', 'Harassment or bullying', 'Hate or abuse', 'False information', 'Other')),
          details VARCHAR(500) NOT NULL DEFAULT '',
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (reporter_id, post_id)
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS post_reports_status_created_idx ON post_reports (status, created_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ad_campaigns (
          id BIGSERIAL PRIMARY KEY,
          advertiser_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          goal VARCHAR(40) NOT NULL,
          daily_budget NUMERIC(12, 2) NOT NULL CHECK (daily_budget > 0),
          audience VARCHAR(240) NOT NULL DEFAULT '',
          status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'paused')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS ad_campaigns_advertiser_created_idx ON ad_campaigns (advertiser_id, created_at DESC)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id BIGSERIAL PRIMARY KEY,
          user_a_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          user_b_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CHECK (user_a_id < user_b_id),
          UNIQUE (user_a_id, user_b_id)
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS direct_messages (
          id BIGSERIAL PRIMARY KEY,
          conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("CREATE INDEX IF NOT EXISTS direct_messages_conversation_idx ON direct_messages (conversation_id, created_at, id)");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversation_archives (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, conversation_id)
        )
      `);

      console.log("Gist Up database schema is ready.");
    } catch (error) {
      console.error("Could not initialize database:", error?.message || "unknown error");
    }
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Gist Up server listening on port ${PORT}`));
}

start();
