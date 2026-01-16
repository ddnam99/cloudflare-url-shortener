export type EnvBindings = {
  DB: D1Database;
  KV: KVNamespace;
};

export function getBaseUrl(url: URL): string {
  return `${url.protocol}//${url.host}/`;
}

