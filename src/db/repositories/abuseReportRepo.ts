import { EnvBindings } from "../../utils/env";

export async function insertAbuseReport(env: EnvBindings, input: {
  slug: string;
  reason: string;
  meta: {
    ip: string;
    ua: string;
    country: string;
    city: string;
    region: string;
    continent: string;
    timezone: string;
  };
}): Promise<void> {
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

