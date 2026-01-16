export type HtmlResponseOptions = {
  robots?: string;
  xRobotsTag?: string;
  cacheControl?: string;
};

export function buildSecurityHeaders(options?: HtmlResponseOptions): HeadersInit {
  const base: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-frame-options": "DENY",
    "permissions-policy": "geolocation=(), camera=(), microphone=()",
    "content-security-policy":
      "default-src 'self'; style-src 'self' 'unsafe-inline' https://static.integrations.cloudflare.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'",
  };
  if (options?.robots) base["vary"] = "user-agent";
  if (options?.xRobotsTag) base["x-robots-tag"] = options.xRobotsTag;
  if (options?.cacheControl) base["cache-control"] = options.cacheControl;
  return base;
}

