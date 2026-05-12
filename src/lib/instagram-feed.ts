/**
 * Fetches public media for an Instagram **professional** account (Business or Creator)
 * via the Instagram Graph API. Personal accounts are not supported by Meta.
 *
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
 */

export type InstagramFeedItem = {
  id: string;
  permalink: string;
  /** Image URL suitable for a grid cell (may be a video thumbnail). */
  displaySrc: string;
  caption: string | null;
  mediaType: string;
  timestamp: string;
};

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

type GraphMediaResponse = {
  data?: GraphMedia[];
  paging?: { next?: string };
  error?: { message?: string; code?: number };
};

const DEFAULT_VERSION = "v21.0";
const DEFAULT_LIMIT = 50;
const MAX_PAGES = 25;
const MAX_ITEMS_CAP = 500;

function pickDisplaySrc(m: GraphMedia): string | null {
  const type = (m.media_type || "").toUpperCase();
  if (type === "VIDEO" && m.thumbnail_url) return m.thumbnail_url;
  if (m.media_url) return m.media_url;
  if (m.thumbnail_url) return m.thumbnail_url;
  return null;
}

function normalizeItem(m: GraphMedia): InstagramFeedItem | null {
  const displaySrc = pickDisplaySrc(m);
  if (!m.id || !m.permalink || !displaySrc) return null;
  return {
    id: m.id,
    permalink: m.permalink,
    displaySrc,
    caption: m.caption ?? null,
    mediaType: m.media_type || "UNKNOWN",
    timestamp: m.timestamp || "",
  };
}

export type InstagramFeedResult =
  | { status: "ok"; items: InstagramFeedItem[] }
  | { status: "missing_env" }
  | { status: "error"; message: string };

export async function fetchInstagramFeed(): Promise<InstagramFeedResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const version =
    process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || DEFAULT_VERSION;

  if (!token || !userId) {
    return { status: "missing_env" };
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "permalink",
    "thumbnail_url",
    "timestamp",
  ].join(",");

  const items: InstagramFeedItem[] = [];
  let url: string | null =
    `https://graph.facebook.com/${version}/${encodeURIComponent(userId)}/media?fields=${encodeURIComponent(fields)}&limit=${DEFAULT_LIMIT}&access_token=${encodeURIComponent(token)}`;

  try {
    for (let page = 0; page < MAX_PAGES && url; page++) {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(20_000),
      });
      const json = (await res.json()) as GraphMediaResponse;

      if (!res.ok || json.error) {
        const msg =
          json.error?.message ||
          `Instagram API HTTP ${res.status}`;
        return { status: "error", message: msg };
      }

      for (const m of json.data || []) {
        const item = normalizeItem(m);
        if (item) items.push(item);
        if (items.length >= MAX_ITEMS_CAP) {
          url = null;
          break;
        }
      }

      url = json.paging?.next ?? null;
      if (items.length >= MAX_ITEMS_CAP) break;
    }

    return { status: "ok", items };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { status: "error", message };
  }
}
