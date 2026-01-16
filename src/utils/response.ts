import { buildSecurityHeaders, HtmlResponseOptions } from "./headers";

export function json(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function errorJson(message: string, status: number): Response {
  return json({ error: message }, status);
}

export function htmlResponse(body: string, status: number = 200, options?: HtmlResponseOptions): Response {
  const headers = buildSecurityHeaders(options);
  return new Response(body, { status, headers });
}

