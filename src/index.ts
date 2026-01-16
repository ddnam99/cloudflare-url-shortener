import { route } from "./app/router";
import { EnvBindings } from "./utils/env";

export default {
  async fetch(request, env) {
    try {
      const bindings = env as EnvBindings;
      return await route(request, bindings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: "Internal Server Error", message }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
} satisfies ExportedHandler<EnvBindings>;

