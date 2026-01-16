import { htmlResponse } from "../../utils/response";
import { renderMeta } from "../../templates/meta";

export function handlePreview(shortUrl: string, targetUrl: string, slug: string): Response {
  return htmlResponse(renderMeta(shortUrl, targetUrl, slug), 200, { robots: "noindex,nofollow", xRobotsTag: "noindex, nofollow" });
}

