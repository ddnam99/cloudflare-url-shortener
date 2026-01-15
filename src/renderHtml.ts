export function renderHtml() {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>URL Shortener</title>
      <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      <style>
        .container { max-width: 720px; margin: 40px auto; }
        form { display: flex; gap: 8px; margin-top: 16px; }
        input[type="text"] { flex: 1; padding: 8px; }
        input[type="submit"], button { padding: 8px 12px; }
        .result { margin-top: 16px; }
        .error { color: #c00; }
        .muted { color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Cloudflare URL Shortener</h1>
        <p class="muted">Workers + D1 + KV</p>
        <form id="shorten-form">
          <input type="text" id="url" placeholder="https://example.com/very/long/link" required />
          <input type="text" id="slug" placeholder="custom slug (optional)" />
          <input type="submit" value="Shorten" />
        </form>
        <div id="msg" class="result"></div>
      </div>
      <script>
        const form = document.getElementById('shorten-form');
        const msg = document.getElementById('msg');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          msg.textContent = '';
          const url = document.getElementById('url').value.trim();
          const slug = document.getElementById('slug').value.trim();
          try {
            const res = await fetch('/api/shorten', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ url, slug: slug || undefined })
            });
            const data = await res.json();
            if (!res.ok) {
              msg.innerHTML = '<span class="error">' + (data.error || 'Error') + '</span>';
            } else {
              msg.innerHTML = 'Short URL: <a href="' + data.short_url + '" target="_blank">' + data.short_url + '</a>';
            }
          } catch (err) {
            msg.innerHTML = '<span class="error">Network error</span>';
          }
        });
      </script>
    </body>
  </html>
  `;
}
