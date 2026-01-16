export function isBot(request: Request): boolean {
  const ua = request.headers.get("user-agent") || "";
  const bots = ["Slackbot", "Twitterbot", "facebookexternalhit", "Discordbot", "WhatsApp", "TelegramBot", "LinkedInBot"];
  for (const b of bots) if (ua.includes(b)) return true;
  return request.method === "HEAD";
}

