export function renderLegal(baseUrl: string) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Legal · Data & Privacy · Disclaimer</title>
      <meta name="description" content="Legal information including Data & Privacy and Disclaimer for the URL shortener service." />
      <meta name="robots" content="index,follow" />
      <link rel="icon" href="/favicon.ico" sizes="any">
      <link rel="canonical" href="${baseUrl}legal">
      <meta property="og:title" content="Legal · Data & Privacy · Disclaimer" />
      <meta property="og:description" content="Legal information including Data & Privacy and Disclaimer for the URL shortener service." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${baseUrl}legal" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Legal · Data & Privacy · Disclaimer" />
      <meta name="twitter:description" content="Legal information including Data & Privacy and Disclaimer for the URL shortener service." />
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
          font-size: 28px; font-weight: 700; letter-spacing: -0.02em;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .card { background: var(--card); border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .section { margin-top: 18px; }
        .section h2 { margin: 0 0 8px 0; font-size: 16px; }
        .muted { color: var(--muted); font-size: 12px; }
        .list { margin: 6px 0 0 18px; color: var(--muted); }
        .list li { margin: 4px 0; }
        .footer { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; justify-content: center; color: var(--muted); font-size: 12px; }
        .footer a { color: var(--accent); text-decoration: none; }
        .actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .btn { display: inline-block; margin-top: 12px; padding: 12px 16px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); color: #fff; border-radius: 10px; text-decoration: none; }
        .secondary { background: #f3f4f6; color: var(--text); border: 1px solid #e5e7eb; }
        a.btn::after, a.btn::before, .btn::after, .btn::before, .secondary::after, .secondary::before { content: none !important; display: none !important; background-image: none !important; }
      </style>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Legal",
          "url": "${baseUrl}legal",
          "description": "Legal information including Data & Privacy and Disclaimer for the URL shortener service."
        }
      </script>
    </head>
    <body>
      <div class="wrap">
        <div class="hero"><div class="title">Legal</div></div>
        <div class="card">
          <div class="section">
            <h2>Data & Privacy</h2>
            <ul class="list">
              <li><strong>Visitors</strong>: We operate a privacy-first policy. We DO NOT store your IP address, User Agent, or browsing behavior.</li>
              <li><strong>Creators</strong>: To prevent abuse (phishing/malware), we log the IP address and approximate location metadata of anyone generating a short link.</li>
              <li><strong>Reporters</strong>: When you report a link, we log your IP, User Agent, and approximate location to investigate abuse.</li>
            </ul>
          </div>
          <div class="section">
            <h2>Disclaimer</h2>
            <ul class="list">
              <li>This is a free service. We do not assume responsibility for any malicious, harmful, or abusive content linked via shortened URLs created by users.</li>
              <li>By proceeding, you acknowledge that you are responsible for the content you shorten and the destinations you visit.</li>
              <li>Prohibited uses include phishing, malware distribution, illegal content, and other harmful activities.</li>
            </ul>
          </div>
          <div class="actions">
            <a class="btn secondary" href="/">Back Home</a>
          </div>
        </div>
        <footer class="footer">
          <span>© ${year} NamDD URL Shortener · <a href="https://github.com/ddnam99/cloudflare-url-shortener" target="_blank">GitHub</a></span>
        </footer>
      </div>
    </body>
  </html>
  `;
}

