import { htmlResponse } from "../../utils/response";
import { renderNotFound } from "../../templates/notFound";

export function handleNotFound(slug: string): Response {
  return htmlResponse(renderNotFound(slug), 404, { robots: "noindex,nofollow", xRobotsTag: "noindex, nofollow" });
}

