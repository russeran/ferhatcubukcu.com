import { Redis } from "@upstash/redis";

const SETTINGS_KEY = "fc_site:settings:v1";
const ARTWORKS_KEY = "fc_site:artworks:v1";

let cached: Redis | null | undefined;

/** Upstash (Vercel “Redis” integration) or legacy KV REST env names. */
export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}

export function redisKeys() {
  return { settings: SETTINGS_KEY, artworks: ARTWORKS_KEY };
}
