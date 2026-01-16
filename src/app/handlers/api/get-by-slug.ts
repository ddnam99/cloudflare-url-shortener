import { EnvBindings } from "../../../utils/env";
import { json, errorJson } from "../../../utils/response";
import { findBySlug } from "../../../db/repositories/urlRepo";

export async function handleGetBySlug(bindings: EnvBindings, slug: string): Promise<Response> {
  try {
    const rec = await findBySlug(bindings, slug);
    if (!rec) return errorJson("Not found", 404);
    return json(rec);
  } catch {
    return errorJson("Internal error", 500);
  }
}

