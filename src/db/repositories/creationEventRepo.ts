import { EnvBindings } from "../../utils/env";

export async function insertCreationEvent(env: EnvBindings, slug: string, info: {
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

