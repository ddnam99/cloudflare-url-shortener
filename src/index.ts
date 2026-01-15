import { renderHtml } from "./renderHtml";

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
  return json({ slug, url: normalized, short_url: base + slug }, 201);
}

async function handleApi(bindings: EnvBindings, pathname: string): Promise<Response> {
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

async function handleRedirect(bindings: EnvBindings, slug: string): Promise<Response> {
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
    return errorJson("Not found", 404);
  }
  if (!cached) {
    await bindings.KV.put(slug, target, { expirationTtl: CACHE_TTL_SECONDS });
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

    if (method === "GET" && pathname === "/") return handleHome();

    if (method === "POST" && pathname === "/api/shorten") {
      const base = `${url.protocol}//${url.host}/`;
      return handleShorten(bindings, base, request);
    }

    if (method === "GET" && pathname.startsWith("/api/")) return handleApi(bindings, pathname);

    if (method === "GET" && pathname.length > 1) {
      const slug = pathname.slice(1);
      return handleRedirect(bindings, slug);
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
