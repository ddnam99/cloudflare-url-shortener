import { htmlResponse } from "../../utils/response";
import { renderHome } from "../../templates/home";

export function handleHome(baseUrl: string): Response {
  return htmlResponse(renderHome(baseUrl), 200, { robots: "index,follow" });
}

