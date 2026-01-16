export function renderDisclaimer(shortUrl: string, targetUrl: string, slug: string) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Proceed with Caution</title>
      <meta name="description" content="This short link redirects to its destination. Users are responsible for shortened links; we do not accept liability for malicious content." />
      <meta name="robots" content="noindex,nofollow" />
      <meta name="referrer" content="no-referrer" />
      <link rel="icon" href="/favicon.ico" sizes="any">
      <link rel="canonical" href="${shortUrl}">
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
        .link { color: var(--accent); text-decoration: none; }
        .actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .secondary { background: #f3f4f6; color: var(--text); border: 1px solid #e5e7eb; }
        a.btn::after, a.btn::before, .btn::after, .btn::before, .secondary::after, .secondary::before { content: none !important; display: none !important; background-image: none !important; }
        .toast { margin-top: 10px; font-size: 12px; color: var(--muted); }
        .footer { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; justify-content: center; color: var(--muted); font-size: 12px; }
        .footer a { color: var(--accent); text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero"><div class="title">Proceed with Caution</div></div>
        <div class="card">
          <div class="row">Short URL: <a class="link" href="${shortUrl}">${shortUrl}</a></div>
          <div class="row">Destination: <a class="link" href="${targetUrl}" rel="noreferrer">${targetUrl}</a></div>
          <div class="row muted">This is a free service. We do not assume responsibility for any malicious, harmful, or abusive content linked via shortened URLs created by users.</div>
          <div class="actions">
            <a class="btn" href="/go/${slug}">Continue</a>
            <a class="btn secondary" href="/">Back</a>
            <button class="btn secondary" id="report">Report</button>
          </div>
          <div class="toast" id="toast"></div>
        </div>
        <footer class="footer">
          <span>© ${year} NamDD URL Shortener · <a href="/legal">Legal</a> · <a href="https://github.com/ddnam99/cloudflare-url-shortener" target="_blank">GitHub</a></span>
        </footer>
      </div>
      <script>
        const reportBtn = document.getElementById('report');
        const toast = document.getElementById('toast');
        reportBtn?.addEventListener('click', async () => {
          let reason = '';
          try {
            reason = window.prompt('Describe the issue (optional):') || '';
          } catch {}
          try {
            const res = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: '${slug}', reason }) });
            const data = await res.json();
            toast.textContent = res.ok ? 'Reported. Thank you.' : (data.error || 'Failed to report');
          } catch {
            toast.textContent = 'Network error';
          }
        });
      </script>
    </body>
  </html>
  `;
}

