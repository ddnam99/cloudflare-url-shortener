export type UrlRecord = {
  id: string;
  slug: string;
  url: string;
  created_at: number;
  clicks: number;
};

export type CreationEvent = {
  id: string;
  slug: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  timezone: string;
  latitude: string;
  longitude: string;
  postal_code: string;
  user_agent: string;
  created_at: number;
};

export type AbuseReport = {
  id: string;
  slug: string;
  reason: string;
  reporter_ip: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  timezone: string;
  user_agent: string;
  created_at: number;
};

