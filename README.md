# Cloudflare URL Shortener (Workers + D1 + KV)

A simple, production-friendly URL shortener built on Cloudflare Workers.  
Uses D1 (SQL) as source of truth and KV for fast edge caching of slug→URL.

## Features
- Create short URLs with optional custom slug
- 302 redirect by slug with KV cache fallback to D1
- Click tracking (D1 column `clicks`)
- Minimal HTML form at `/` that calls REST API

## Requirements
- Cloudflare account
- Wrangler CLI
- D1 database and KV namespace

## Configuration
Update `wrangler.json` bindings:
- D1:
  - `"binding": "DB"`
  - `"database_id": "<your d1 id>"`
  - `"preview_database_id": "<your preview d1 id>"`
- KV:
  - `"binding": "KV"`
  - `"id": "<your kv id>"`
  - `"preview_id": "<your kv preview id>"`

Example: see the current [wrangler.json](file:///Users/doubled/Desktop/cloudflare-url-shortener/wrangler.json).

## Setup
```bash
npm install
# or: yarn, pnpm

# Create resources
npx wrangler d1 create cloudflare-url-shortener-d1
npx wrangler d1 info cloudflare-url-shortener-d1      # copy database_id
npx wrangler d1 create cloudflare-url-shortener-d1-preview
npx wrangler d1 info cloudflare-url-shortener-d1-preview  # copy preview_database_id

npx wrangler kv namespace create cloudflare-url-shortener-kv
npx wrangler kv namespace list                          # copy id
npx wrangler kv namespace create cloudflare-url-shortener-kv --preview
# copy preview_id from CLI output
```
Paste these IDs into `wrangler.json`.

## Development
Prefer remote preview to avoid local filesystem permission issues:
```bash
npm run dev
# serves on http://localhost:<port> (shown by wrangler)
```

Run migrations:
```bash
# apply to local dev
wrangler d1 migrations apply DB --local

# apply to preview database
wrangler d1 migrations apply DB --remote --preview

# apply to production database
wrangler d1 migrations apply DB --remote
```

Health check:
```bash
curl http://localhost:<port>/api/health
# {"d1":true,"kv":true}
```

## API
- Create:
  ```
  POST /api/shorten
  Content-Type: application/json
  Body: { "url": "https://example.com/long/path", "slug": "optional-slug" }
  Response: 201 { "slug": "...", "url": "...", "short_url": "https://<host>/<slug>" }
  ```
- Get details:
  ```
  GET /api/:slug
  Response: 200 UrlRecord | 404
  ```
- Redirect:
  ```
  GET /:slug → 302 to original URL
  ```

## Implementation Notes
- D1 schema is created automatically on demand (`CREATE TABLE IF NOT EXISTS`).
- KV is used as cache; on miss, Worker queries D1 and re-populates KV.
- Slugs are Base62 length 6 by default; custom slugs must match `/^[A-Za-z0-9_-]{3,32}$/`.

## Deploy
```bash
npm run deploy
```

## Troubleshooting
- Error 1101 (exception thrown): check `/api/health` and verify IDs in `wrangler.json`.
- Local dev EPERM: use `wrangler dev --remote` (see `npm run dev`).

## Disclaimer
This project is provided for educational and testing purposes. The author is not responsible for any misuse of the service, including but not limited to the shortening of malicious, phishing, or illegal URLs. Users are solely responsible for the content they generate and share.

## License
This project is licensed under the [MIT License](LICENSE).
