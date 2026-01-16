export function getClientInfo(request: Request): {
  ip: string;
  ua: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  timezone: string;
  latitude: string;
  longitude: string;
  postalCode: string;
} {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const ua = request.headers.get("user-agent") || "";
  const cf: any = (request as any).cf || {};
  return {
    ip,
    ua,
    country: cf.country || "",
    city: cf.city || "",
    region: cf.region || "",
    continent: cf.continent || "",
    timezone: cf.timezone || "",
    latitude: cf.latitude !== undefined ? String(cf.latitude) : "",
    longitude: cf.longitude !== undefined ? String(cf.longitude) : "",
    postalCode: cf.postalCode || "",
  };
}

