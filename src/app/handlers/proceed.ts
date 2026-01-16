import { htmlResponse } from "../../utils/response";
import { renderDisclaimer } from "../../templates/disclaimer";

export function handleProceed(shortUrl: string, targetUrl: string, slug: string): Response {
  return htmlResponse(renderDisclaimer(shortUrl, targetUrl, slug), 200, { robots: "noindex,nofollow", xRobotsTag: "noindex, nofollow" });
}

