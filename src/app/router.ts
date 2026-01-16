import { EnvBindings, getBaseUrl } from "../utils/env";
import { handleHome } from "./handlers/home";
import { handleLegal } from "./handlers/legal";
import { handleNotFound } from "./handlers/not-found";
import { handlePreview } from "./handlers/preview";
import { handleProceed } from "./handlers/proceed";
import { handleShorten } from "./handlers/api/shorten";
import { handleHealth } from "./handlers/api/health";
import { handleReport } from "./handlers/api/report";
import { handleGetBySlug } from "./handlers/api/get-by-slug";
import { findBySlug, incrementClicks } from "../db/repositories/urlRepo";
import { htmlResponse } from "../utils/response";
import { isBot } from "../utils/bots";
import { CACHE_TTL_SECONDS } from "../utils/constants";

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

function handleRobots(): Response {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /go/",
    "Disallow: /favicon.ico",
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}

function handleSitemap(base: string): Response {
  const now = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${base}`, priority: "1.0" },
    { loc: `${base}legal`, priority: "0.5" },
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url><loc>${u.loc}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("") +
    `</urlset>`;
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}

export async function route(request: Request, env: EnvBindings): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();
  const base = getBaseUrl(url);

  if (method === "GET" && pathname === "/favicon.ico") return serveFavicon();
  if (method === "GET" && pathname === "/") return handleHome(base);
  if (method === "GET" && pathname === "/legal") return handleLegal(base);
  if (method === "GET" && pathname === "/robots.txt") return handleRobots();
  if (method === "GET" && pathname === "/sitemap.xml") return handleSitemap(base);

  if (method === "POST" && pathname === "/api/shorten") {
    return handleShorten(env, base, request);
  }

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/health") return handleHealth(env);
    if (pathname === "/api/report") return handleReport(env, request);
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 2 && parts[0] === "api") {
      return handleGetBySlug(env, parts[1]!);
    }
    return new Response(JSON.stringify({ error: "Invalid API route" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (method === "GET" && pathname.length > 1) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "go" && segments[1]) {
      const slug = segments[1];
      const cached = await env.KV.get(slug);
      const target = cached ?? (await (async () => {
        try {
          const rec = await findBySlug(env, slug);
          return rec ? rec.url : null;
        } catch {
          return null;
        }
      })());
      if (!target) {
        return handleNotFound(slug);
      }
      try {
        await incrementClicks(env, slug);
      } catch {}
      return Response.redirect(target, 302);
    }
    const slug = pathname.slice(1);
    const cached = await env.KV.get(slug);
    const target = cached ?? (await (async () => {
      try {
        const rec = await findBySlug(env, slug);
        return rec ? rec.url : null;
      } catch {
        return null;
      }
    })());
    if (!target) {
      return handleNotFound(slug);
    }
    if (!cached) {
      await env.KV.put(slug, target, { expirationTtl: CACHE_TTL_SECONDS });
    }
    const shortUrl = `${base}${slug}`;
    const preview = new URL(request.url).searchParams.get("preview");
    if (preview === "1" || isBot(request)) {
      return handlePreview(shortUrl, target, slug);
    }
    return handleProceed(shortUrl, target, slug);
  }

  return new Response(JSON.stringify({ error: "Route not found" }), {
    status: 404,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

