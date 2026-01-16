import { htmlResponse } from "../../utils/response";
import { renderLegal } from "../../templates/legal";

export function handleLegal(baseUrl: string): Response {
  return htmlResponse(renderLegal(baseUrl), 200, { robots: "index,follow" });
}

