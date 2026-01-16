import { EnvBindings } from "../../utils/env";
import { UrlRecord } from "../types";

export async function findBySlug(env: EnvBindings, slug: string): Promise<UrlRecord | null> {
  const stmt = env.DB.prepare("SELECT id, slug, url, created_at, clicks FROM urls WHERE slug = ? LIMIT 1").bind(slug);
  const res = await stmt.first<UrlRecord>();
  return res ?? null;
}

export async function insertRecord(env: EnvBindings, record: UrlRecord): Promise<void> {
  const stmt = env.DB.prepare(
    "INSERT INTO urls (id, slug, url, created_at, clicks) VALUES (?, ?, ?, ?, ?)"
  ).bind(record.id, record.slug, record.url, record.created_at, record.clicks);
  await stmt.run();
}

export async function incrementClicks(env: EnvBindings, slug: string): Promise<void> {
  const stmt = env.DB.prepare("UPDATE urls SET clicks = clicks + 1 WHERE slug = ?").bind(slug);
  await stmt.run();
}

