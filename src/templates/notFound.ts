export function renderNotFound(slug: string) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Short Link Not Found</title>
      <meta name="description" content="The requested short link does not exist." />
      <meta name="robots" content="noindex,nofollow" />
      <link rel="icon" href="/favicon.ico" sizes="any">
      <link rel="canonical" href="/${slug}">
      <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      <style>
        :root {
          --bg: #f9fafb;
          --card: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --accent: #2563eb;
          --accent-2: #7c3aed;
        }
        html, body { height: 100%; }
        body {
          margin: 0;
          background:
            radial-gradient(1000px 400px at 20% -10%, rgba(124,58,237,0.08), transparent),
            radial-gradient(800px 400px at 90% 0%, rgba(37,99,235,0.08), transparent),
            var(--bg);
          color: var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          min-height: 100vh;
        }
        .wrap { max-width: 840px; margin: 0 auto; padding: 32px 16px 64px; }
        .hero { text-align: center; margin: 24px 0; }
        .title {
          font-size: 24px; font-weight: 700; letter-spacing: -0.02em;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .card { background: var(--card); border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .muted { color: var(--muted); font-size: 12px; }
        .row { margin-top: 8px; }
        .btn { display: inline-block; margin-top: 12px; padding: 12px 16px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); color: #fff; border-radius: 10px; text-decoration: none; }
        .actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .secondary { background: #f3f4f6; color: var(--text); border: 1px solid #e5e7eb; }
        a.btn::after, a.btn::before, .btn::after, .btn::before, .secondary::after, .secondary::before { content: none !important; display: none !important; background-image: none !important; }
        .footer { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; justify-content: center; color: var(--muted); font-size: 12px; }
        .footer a { color: var(--accent); text-decoration: none; }
        .slug { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background: #f3f4f6; border: 1px solid #e5e7eb; padding: 4px 6px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero"><div class="title">Short Link Not Found</div></div>
        <div class="card">
          <div class="row">Requested slug: <span class="slug">${slug}</span></div>
          <div class="row muted">This short link does not exist or has been removed.</div>
          <div class="actions">
            <a class="btn" href="/">Go Home</a>
          </div>
        </div>
        <footer class="footer">
          <span>© ${year} NamDD URL Shortener · <a href="/legal">Legal</a> · <a href="https://github.com/ddnam99/cloudflare-url-shortener" target="_blank">GitHub</a></span>
        </footer>
      </div>
    </body>
  </html>
  `;
}

