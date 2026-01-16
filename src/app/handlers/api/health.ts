import { EnvBindings } from "../../../utils/env";
import { json, errorJson } from "../../../utils/response";

export async function handleHealth(bindings: EnvBindings): Promise<Response> {
  try {
    const one = await bindings.DB.prepare("SELECT 1 as ok").first<{ ok: number }>();
    const kvOk = await bindings.KV.get("__kv_health_check__");
    return json({ d1: one?.ok === 1, kv: kvOk === null ? true : true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return errorJson(`Health check failed: ${message}`, 500);
  }
}

