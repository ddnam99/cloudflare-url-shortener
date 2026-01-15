import { renderHtml } from "./renderHtml";
import { renderMetaHtml } from "./renderMeta";
import { renderDisclaimerHtml } from "./renderDisclaimer";
import { renderNotFoundHtml } from "./renderNotFound";

type EnvBindings = {
  DB: D1Database;
  KV: KVNamespace;
};

type ShortenRequestBody = {
  url: string;
  slug?: string;
};

type UrlRecord = {
  id: string;
  slug: string;
  url: string;
  created_at: number;
  clicks: number;
};

function isValidUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(input: string): string {
  const u = new URL(input);
  // Lowercase host, keep path/query as-is
  u.host = u.host.toLowerCase();
  return u.toString();
}

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
function randomSlug(length: number = 6): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * BASE62.length);
    s += BASE62[idx]!;
  }
  return s;
}

function isValidSlug(slug: string): boolean {
  // allow letters, numbers, -, _
  if (slug.length < 3 || slug.length > 32) return false;
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

// schema is managed by D1 migrations

async function findBySlug(env: EnvBindings, slug: string): Promise<UrlRecord | null> {
  const stmt = env.DB.prepare("SELECT id, slug, url, created_at, clicks FROM urls WHERE slug = ? LIMIT 1").bind(slug);
  const res = await stmt.first<UrlRecord>();
  return res ?? null;
}

async function insertRecord(env: EnvBindings, record: UrlRecord): Promise<void> {
  const stmt = env.DB.prepare(
    "INSERT INTO urls (id, slug, url, created_at, clicks) VALUES (?, ?, ?, ?, ?)"
  ).bind(record.id, record.slug, record.url, record.created_at, record.clicks);
  await stmt.run();
}

async function incrementClicks(env: EnvBindings, slug: string): Promise<void> {
  const stmt = env.DB.prepare("UPDATE urls SET clicks = clicks + 1 WHERE slug = ?").bind(slug);
  await stmt.run();
}

function json(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function errorJson(message: string, status: number): Response {
  return json({ error: message }, status);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function serveFavicon(): Response {
  const pngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/gbh3Y0AAAAASUVORK5CYII=";
  const body = base64ToUint8Array(pngB64);
  return new Response(body, { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000" } });
}

async function handleHome(): Promise<Response> {
  return new Response(renderHtml(), { headers: { "content-type": "text/html" } });
}

async function handleShorten(bindings: EnvBindings, base: string, request: Request): Promise<Response> {
  let body: ShortenRequestBody;
  try {
    body = (await request.json()) as ShortenRequestBody;
  } catch {
    return errorJson("Invalid JSON body", 400);
  }
  const originalUrl = body.url;
  const customSlug = body.slug;
  if (!originalUrl || !isValidUrl(originalUrl)) {
    return errorJson("Invalid URL", 422);
  }
  if (customSlug && !isValidSlug(customSlug)) {
    return errorJson("Invalid slug format", 422);
  }
  const normalized = normalizeUrl(originalUrl);
  let slug = customSlug ?? randomSlug(6);
  if (!customSlug) {
    for (let i = 0; i < 5; i++) {
      const exists = await bindings.KV.get(slug);
      if (!exists) {
        const inDb = await findBySlug(bindings, slug);
        if (!inDb) break;
      }
      slug = randomSlug(6);
    }
    const collision = await findBySlug(bindings, slug);
    if (collision) return errorJson("Slug collision, please retry", 409);
  } else {
    const existsDb = await findBySlug(bindings, slug);
    if (existsDb) return errorJson("Slug already in use", 409);
  }
  const record: UrlRecord = {
    id: crypto.randomUUID(),
    slug,
    url: normalized,
    created_at: Date.now(),
    clicks: 0,
  };
  await insertRecord(bindings, record);
  await bindings.KV.put(slug, normalized, { expirationTtl: CACHE_TTL_SECONDS });
  try {
    const info = getClientInfo(request);
    await insertCreationEvent(bindings, slug, info);
  } catch {}
  return json({ slug, url: normalized, short_url: base + slug }, 201);
}

async function handleApi(bindings: EnvBindings, pathname: string, request?: Request): Promise<Response> {
  if (pathname === "/api/health") {
    try {
      const one = await bindings.DB.prepare("SELECT 1 as ok").first<{ ok: number }>();
      const kvOk = await bindings.KV.get("__kv_health_check__");
      return json({ d1: one?.ok === 1, kv: kvOk === null ? true : true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return errorJson(`Health check failed: ${message}`, 500);
    }
  }
  if (pathname === "/api/report") {
    if (!request || request.method.toUpperCase() !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { "content-type": "application/json; charset=utf-8" } });
    }
    let body: { slug?: string; reason?: string };
    try {
      body = (await request.json()) as { slug?: string; reason?: string };
    } catch {
      return errorJson("Invalid JSON body", 400);
    }
    const slug = (body.slug || "").trim();
    const reason = (body.reason || "").trim();
    if (!slug) return errorJson("Missing slug", 422);
    const exists = await findBySlug(bindings, slug);
    const meta = getClientInfo(request);
    try {
      await insertAbuseReport(bindings, { slug, reason, meta });
    } catch {
      return errorJson("Failed to save report", 500);
    }
    return json({ ok: true, exists: !!exists });
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "api") {
    const slug = parts[1]!;
    try {
      const rec = await findBySlug(bindings, slug);
      if (!rec) return errorJson("Not found", 404);
      return json(rec);
    } catch {
      return errorJson("Internal error", 500);
    }
  }
  return errorJson("Invalid API route", 404);
}

async function insertAbuseReport(env: EnvBindings, input: { slug: string; reason: string; meta: ReturnType<typeof getClientInfo> }): Promise<void> {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS abuse_reports (id TEXT PRIMARY KEY, slug TEXT NOT NULL, reason TEXT, reporter_ip TEXT, country TEXT, city TEXT, region TEXT, continent TEXT, timezone TEXT, user_agent TEXT, created_at INTEGER NOT NULL)"
  ).run();
  const stmt = env.DB.prepare(
    "INSERT INTO abuse_reports (id, slug, reason, reporter_ip, country, city, region, continent, timezone, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    input.slug,
    input.reason,
    input.meta.ip,
    input.meta.country,
    input.meta.city,
    input.meta.region,
    input.meta.continent,
    input.meta.timezone,
    input.meta.ua,
    Date.now()
  );
  await stmt.run();
}
function isBot(request: Request): boolean {
  const ua = request.headers.get("user-agent") || "";
  const bots = ["Slackbot", "Twitterbot", "facebookexternalhit", "Discordbot", "WhatsApp", "TelegramBot", "LinkedInBot"];
  for (const b of bots) if (ua.includes(b)) return true;
  return request.method === "HEAD";
}

function getClientInfo(request: Request): {
  ip: string;
  ua: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  timezone: string;
  latitude: string;
  longitude: string;
  postalCode: string;
} {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const ua = request.headers.get("user-agent") || "";
  const cf: any = (request as any).cf || {};
  return {
    ip,
    ua,
    country: cf.country || "",
    city: cf.city || "",
    region: cf.region || "",
    continent: cf.continent || "",
    timezone: cf.timezone || "",
    latitude: cf.latitude !== undefined ? String(cf.latitude) : "",
    longitude: cf.longitude !== undefined ? String(cf.longitude) : "",
    postalCode: cf.postalCode || "",
  };
}

async function insertCreationEvent(env: EnvBindings, slug: string, info: {
  ip: string;
  ua: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  timezone: string;
  latitude: string;
  longitude: string;
  postalCode: string;
}): Promise<void> {
  const stmt = env.DB.prepare(
    "INSERT INTO creation_events (id, slug, ip, country, city, region, continent, timezone, latitude, longitude, postal_code, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    slug,
    info.ip,
    info.country,
    info.city,
    info.region,
    info.continent,
    info.timezone,
    info.latitude,
    info.longitude,
    info.postalCode,
    info.ua,
    Date.now()
  );
  await stmt.run();
}
async function handleRedirect(bindings: EnvBindings, slug: string, shortBase: string, request: Request): Promise<Response> {
  const cached = await bindings.KV.get(slug);
  const target = cached ?? (await (async () => {
    try {
      const rec = await findBySlug(bindings, slug);
      return rec ? rec.url : null;
    } catch {
      return null;
    }
  })());
  if (!target) {
    return new Response(renderNotFoundHtml(slug), { status: 404, headers: { "content-type": "text/html" } });
  }
  if (!cached) {
    await bindings.KV.put(slug, target, { expirationTtl: CACHE_TTL_SECONDS });
  }
  const shortUrl = `${shortBase}${slug}`;
  const preview = new URL(request.url).searchParams.get("preview");
  if (preview === "1" || isBot(request)) {
    return new Response(renderMetaHtml(shortUrl, target, slug), { headers: { "content-type": "text/html" } });
  }
  return new Response(renderDisclaimerHtml(shortUrl, target, slug), { headers: { "content-type": "text/html" } });
}

async function handleGo(bindings: EnvBindings, slug: string, shortBase: string): Promise<Response> {
  const cached = await bindings.KV.get(slug);
  const target = cached ?? (await (async () => {
    try {
      const rec = await findBySlug(bindings, slug);
      return rec ? rec.url : null;
    } catch {
      return null;
    }
  })());
  if (!target) {
    return new Response(renderNotFoundHtml(slug), { status: 404, headers: { "content-type": "text/html" } });
  }
  try {
    await incrementClicks(bindings, slug);
  } catch {}
  return Response.redirect(target, 302);
}
export default {
  async fetch(request, env) {
    try {
    const bindings = env as EnvBindings;

    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    if (method === "GET" && pathname === "/favicon.ico") return serveFavicon();
    if (method === "GET" && pathname === "/") return handleHome();

    if (method === "POST" && pathname === "/api/shorten") {
      const base = `${url.protocol}//${url.host}/`;
      return handleShorten(bindings, base, request);
    }

    if (pathname.startsWith("/api/")) return handleApi(bindings, pathname, request);

    if (method === "GET" && pathname.length > 1) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments[0] === "go" && segments[1]) {
        const slug = segments[1];
        const base = `${url.protocol}//${url.host}/`;
        return handleGo(bindings, slug, base);
      }
      const slug = pathname.slice(1);
      const base = `${url.protocol}//${url.host}/`;
      return handleRedirect(bindings, slug, base, request);
    }

    return errorJson("Route not found", 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: "Internal Server Error", message }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
} satisfies ExportedHandler<EnvBindings>;
