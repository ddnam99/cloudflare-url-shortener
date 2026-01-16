import { BASE62 } from "./constants";

export function randomSlug(length: number = 6): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * BASE62.length);
    s += BASE62[idx]!;
  }
  return s;
}

export function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 32) return false;
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

