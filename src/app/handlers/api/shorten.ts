import { EnvBindings } from "../../../utils/env";
import { json, errorJson } from "../../../utils/response";
import { isValidUrl, normalizeUrl } from "../../../utils/url";
import { randomSlug, isValidSlug } from "../../../utils/slug";
import { CACHE_TTL_SECONDS } from "../../../utils/constants";
import { insertRecord, findBySlug } from "../../../db/repositories/urlRepo";
import { insertCreationEvent } from "../../../db/repositories/creationEventRepo";
import { getClientInfo } from "../shared/clientInfo";

type ShortenRequestBody = {
  url: string;
  slug?: string;
};

export async function handleShorten(bindings: EnvBindings, base: string, request: Request): Promise<Response> {
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
  const record = {
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

