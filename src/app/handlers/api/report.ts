import { EnvBindings } from "../../../utils/env";
import { json, errorJson } from "../../../utils/response";
import { insertAbuseReport } from "../../../db/repositories/abuseReportRepo";
import { getClientInfo } from "../shared/clientInfo";

export async function handleReport(bindings: EnvBindings, request: Request): Promise<Response> {
  if (request.method.toUpperCase() !== "POST") {
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
  const meta = getClientInfo(request);
  try {
    await insertAbuseReport(bindings, { slug, reason, meta });
  } catch {
    return errorJson("Failed to save report", 500);
  }
  return json({ ok: true });
}

