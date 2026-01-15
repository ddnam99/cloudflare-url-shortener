export function renderHtml() {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Free URL shortening service. Users are responsible for shortened links; we do not accept liability for malicious or harmful content." />
      <meta name="disclaimer" content="This is a free service. We do not assume responsibility for any malicious, harmful, or abusive content linked via shortened URLs created by users." />
      <meta name="referrer" content="no-referrer" />
      <title>Cloudflare URL Shortener</title>
      <link rel="icon" href="/favicon.ico" sizes="any">
      <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      <style>
        :root {
          --bg: #f9fafb;
          --card: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --accent: #2563eb;
          --accent-2: #7c3aed;
          --error: #dc2626;
          --success: #16a34a;
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
        }
        .wrap {
          max-width: 840px;
          margin: 0 auto;
          padding: 32px 16px 64px;
        }
        .hero {
          text-align: center;
          margin: 40px 0 24px;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .subtitle { color: var(--muted); margin-top: 8px; }
        .card {
          background: var(--card);
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          padding: 20px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: end;
        }
        @media (min-width: 720px) {
          .grid { grid-template-columns: 3fr 1fr auto; }
        }
        .label { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: var(--text);
          outline: none;
          height: 44px;
          box-sizing: border-box;
        }
        .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .btn {
          padding: 12px 16px;
          border-radius: 10px;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .result {
          margin-top: 14px;
          display: none;
        }
        .alert {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 10px;
        }
        .alert.error { border-color: rgba(220,38,38,0.35); color: var(--error); background: #fff5f5; }
        .alert.success { border-color: rgba(22,163,74,0.35); color: var(--text); background: #f0fdf4; }
        .link { color: var(--accent); text-decoration: none; overflow-wrap: anywhere; word-break: break-word; }
        .tools { display: flex; gap: 8px; flex-wrap: wrap; }
        .tool { padding: 8px 10px; border-radius: 8px; background: #f3f4f6; color: var(--text); border: 1px solid #e5e7eb; cursor: pointer; }
        @media (max-width: 600px) {
          .alert { flex-direction: column; }
          .tools { width: 100%; justify-content: flex-start; }
        }
        .muted { color: var(--muted); font-size: 12px; }
        .history { margin-top: 18px; }
        .history h3 { margin: 0 0 8px 0; font-size: 14px; color: var(--muted); }
        .history ul { list-style: none; padding: 0; margin: 0; }
        .history li { margin: 6px 0; }
        .footer {
          margin-top: 28px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          justify-content: center;
          color: var(--muted);
          font-size: 12px;
        }
        .footer a { color: var(--accent); text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <div class="title">Cloudflare URL Shortener</div>
          <div class="subtitle">Workers · D1 · KV</div>
        </div>
        <div class="card">
          <form id="shorten-form">
            <div class="grid">
              <div>
                <div class="label">Long URL</div>
                <input class="input" type="text" id="url" placeholder="https://example.com/very/long/link" required />
              </div>
              <div>
                <div class="label">Custom slug (optional)</div>
                <input class="input" type="text" id="slug" placeholder="e.g. summer-sale" />
              </div>
              <div style="align-self: end;">
                <button class="btn" id="submit">Shorten</button>
              </div>
            </div>
          </form>
          <div id="msg" class="result">
            <div class="alert" id="alert"></div>
          </div>
          <div class="history" id="history" style="display:none">
            <h3>Recent</h3>
            <ul id="list"></ul>
          </div>
          <div class="muted">By using this tool you agree not to shorten malicious or harmful links.</div>
        </div>
        <footer class="footer">
          <span>© ${year} Cloudflare URL Shortener</span>
        </footer>
      </div>
      <script>
        const form = document.getElementById('shorten-form');
        const urlInput = document.getElementById('url');
        const slugInput = document.getElementById('slug');
        const submitBtn = document.getElementById('submit');
        const msg = document.getElementById('msg');
        const alertBox = document.getElementById('alert');
        const historyBox = document.getElementById('history');
        const listEl = document.getElementById('list');

        function showAlert(type, html) {
          msg.style.display = 'block';
          alertBox.className = 'alert ' + type;
          alertBox.innerHTML = html;
        }

        function addToHistory(item) {
          try {
            const key = 'short-history';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.unshift(item);
            while (existing.length > 5) existing.pop();
            localStorage.setItem(key, JSON.stringify(existing));
            renderHistory(existing);
          } catch {}
        }

        function renderHistory(items) {
          if (!items || items.length === 0) { historyBox.style.display = 'none'; return; }
          historyBox.style.display = 'block';
          listEl.innerHTML = items.map(i => '<li><a class="link" target="_blank" href="'+i.short_url+'">'+i.short_url+'</a></li>').join('');
        }

        function loadHistory() {
          try {
            const key = 'short-history';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            renderHistory(existing);
          } catch {}
        }

        async function copyToClipboard(text) {
          try {
            await navigator.clipboard.writeText(text);
            return true;
          } catch {
            return false;
          }
        }

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          msg.style.display = 'none';
          const url = urlInput.value.trim();
          const slug = slugInput.value.trim();
          submitBtn.disabled = true;
          submitBtn.textContent = 'Shortening...';
          try {
            const res = await fetch('/api/shorten', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ url, slug: slug || undefined })
            });
            const data = await res.json();
            if (!res.ok) {
              showAlert('error', (data.error || 'Error'));
            } else {
              const html = '<span>Short URL: </span><a class="link" href="' + data.short_url + '" target="_blank">' + data.short_url + '</a>' +
                           '<div class="tools"><button class="tool" id="copy">Copy</button><a class="tool" target="_blank" href="' + data.short_url + '">Open</a></div>';
              showAlert('success', html);
              addToHistory(data);
              const copyBtn = document.getElementById('copy');
              copyBtn?.addEventListener('click', async () => {
                const ok = await copyToClipboard(data.short_url);
                copyBtn.textContent = ok ? 'Copied' : 'Copy failed';
                setTimeout(() => copyBtn.textContent = 'Copy', 1500);
              });
            }
          } catch {
            showAlert('error', 'Network error');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Shorten';
          }
        });

        loadHistory();
      </script>
    </body>
  </html>
  `;
}
