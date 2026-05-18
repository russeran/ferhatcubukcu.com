import type { Artwork, NewsPost, SiteSettings } from "@/lib/types";
import fs from "fs/promises";
import path from "path";
import { getDataDir } from "@/lib/auth";
import { getRedis, redisKeys } from "@/lib/kv";
import {
  getSupabaseAdmin,
  supabaseGetJson,
  supabaseSetJson,
} from "@/lib/supabase-store";

const SETTINGS_FILE = "settings.json";
const ARTWORKS_FILE = "artworks.json";
const NEWS_FILE = "news.json";

const defaultSettings: SiteSettings = {
  artistName: "Ferhat Çubukçu",
  taglineEn:
    "Figurative composition shaped by the Fibonacci sequence and the golden ratio",
  taglineTr:
    "Fibonacci dizisi ve altın oranına dayanan figüratif kompozisyon",
  bioEn:
    "Ferhat Çubukçu (b. 4 March 1990, Bursa) is a painter based in Türkiye. He studied automotive technologies at Yüzüncü Yıl University and has painted for more than two decades, continuing training after high school at the Ertuğrul Topsakal Art Workshop. His work spans multiple media and formats, often at 80×100 cm and larger.\n\nHis approach grows from the spiral implied by the Fibonacci sequence’s approach to the golden ratio: spirals are woven into overall compositions and figures, with Fibonacci intervals considered on and between forms. He has shown in group exhibitions in Bursa, Van, and elsewhere in Türkiye. Replace this text anytime from the admin panel.",
  bioTr:
    "Ferhat Çubukçu (4 Mart 1990, Bursa doğumlu) Türkiye merkezli bir ressamdır. Yüzüncü Yıl Üniversitesi’nde otomotiv teknolojileri okumuş, yirmi yılı aşkın süredir resim yapmaktadır; liseden sonra Ertuğrul Topsakal Sanat Atölyesi’nde çalışmalarını sürdürmüştür. Eserleri farklı malzeme ve ölçülerde, sıkça 80×100 cm ve daha büyük formatlarda üretilir.\n\nYaklaşımı, Fibonacci dizisinin altın orana yaklaşımından doğan sarmal biçimden beslenir; bu sarmallar genel kompozisyon ve figürlere entegre edilir, figürler üzerinde ve aralarında Fibonacci ölçüleri dikkate alınır. Bursa, Van ve Türkiye’nin farklı şehirlerinde karma sergilerde yer almıştır. Metni yönetim panelinden dilediğiniz zaman güncelleyebilirsiniz.",
  heroImage: "/hero-placeholder.svg",
  contactEmail: "studio@ferhatcubukcu.com",
  instagram: "https://www.instagram.com/ferhatcubukcu/",
  studioNoteEn:
    "For availability, commissions, or exhibition proposals, please write.",
  studioNoteTr:
    "Müsaitlik, sipariş veya sergi önerileri için yazabilirsiniz.",
  pressQuotes: [],
  galleryImageFit: false,
};

function hasLegacyHeroTagline(text: string): boolean {
  return /istanbul|i̇stanbul|los\s*angeles|acrylic and oil/i.test(text);
}

function mergeSettings(parsed: Partial<SiteSettings>): SiteSettings {
  const merged = { ...defaultSettings, ...parsed } as SiteSettings & {
    behance?: string;
  };
  delete merged.behance;
  if (merged.taglineEn && hasLegacyHeroTagline(merged.taglineEn)) {
    merged.taglineEn = defaultSettings.taglineEn;
  }
  if (merged.taglineTr && hasLegacyHeroTagline(merged.taglineTr)) {
    merged.taglineTr = defaultSettings.taglineTr;
  }
  return merged;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseRedisJson<T>(raw: unknown): T | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return raw as T;
}

export async function readSettings(): Promise<SiteSettings> {
  if (getSupabaseAdmin()) {
    const v = await supabaseGetJson("settings");
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return mergeSettings(v as Partial<SiteSettings>);
    }
    return { ...defaultSettings };
  }

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(redisKeys().settings);
    const parsed = parseRedisJson<Partial<SiteSettings>>(raw);
    if (parsed) {
      return mergeSettings(parsed);
    }
    return { ...defaultSettings };
  }

  const file = path.join(getDataDir(), SETTINGS_FILE);
  try {
    const raw = await fs.readFile(file, "utf-8");
    try {
      return mergeSettings(JSON.parse(raw) as Partial<SiteSettings>);
    } catch {
      return { ...defaultSettings };
    }
  } catch {
    try {
      await fs.mkdir(getDataDir(), { recursive: true });
      await fs.writeFile(
        file,
        JSON.stringify(defaultSettings, null, 2),
        "utf-8"
      );
    } catch {
      /* e.g. serverless read-only FS — still serve defaults */
    }
    return { ...defaultSettings };
  }
}

export async function writeSettings(
  partial: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await readSettings();
  const next = { ...current, ...partial };
  if (getSupabaseAdmin()) {
    await supabaseSetJson("settings", next);
    return next;
  }

  const redis = getRedis();
  if (redis) {
    await redis.set(redisKeys().settings, JSON.stringify(next));
    return next;
  }

  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(
    path.join(getDataDir(), SETTINGS_FILE),
    JSON.stringify(next, null, 2),
    "utf-8"
  );
  return next;
}

function defaultSeedArtworks(): Artwork[] {
  return [
      {
        id: "seed-1",
        slug: "urban-layers",
        titleEn: "Urban layers",
        titleTr: "Kentsel katmanlar",
        descriptionEn:
          "A series exploring architecture, light, and crowd rhythms with Fibonacci-guided structure in the composition.",
        descriptionTr:
          "Mimari, ışık ve kalabalık ritimlerini; kompozisyonda Fibonacci rehberli yapıyla araştıran bir seri.",
        image: "/gallery-placeholder.svg",
        year: "2024",
        mediumEn: "Mixed media on canvas",
        mediumTr: "Tuval üzerine karışık teknik",
        dimensions: "Various",
        order: 0,
        sold: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-2",
        slug: "red-hagia-sophia",
        titleEn: "Red Ayasofya (Hagia Sophia)",
        titleTr: "Kırmızı Ayasofya",
        descriptionEn:
          "80×100 cm — a saturated red reading of Hagia Sophia’s mass and dome silhouette, where spiral geometry underpins the placement of masses and voids.",
        descriptionTr:
          "80×100 cm — Ayasofya kütle ve kubbe siluetinin doygun kırmızı bir yorumu; kütle ve boşlukların yerleşiminde sarmal geometri.",
        image: "/gallery-placeholder.svg",
        year: "2023",
        mediumEn: "Acrylic on canvas",
        mediumTr: "Tuval üzerine akrilik",
        dimensions: "80 × 100 cm",
        order: 1,
        sold: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-3",
        slug: "invisible-faces-2",
        titleEn: "Invisible faces II",
        titleTr: "Görünmez yüzler II",
        descriptionEn:
          "80×100 cm — figures on the edge of recognition; Fibonacci intervals measured between facial landmarks and the painting’s outer spiral tension.",
        descriptionTr:
          "80×100 cm — tanınmanın eşiğinde figürler; yüz işaretleri ile tablonun dış sarmal gerilimi arasında Fibonacci aralıkları.",
        image: "/gallery-placeholder.svg",
        year: "2025",
        mediumEn: "Mixed media on canvas",
        mediumTr: "Tuval üzerine karışık teknik",
        dimensions: "80 × 100 cm",
        order: 2,
        sold: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
    ];
}

export async function readArtworks(): Promise<Artwork[]> {
  if (getSupabaseAdmin()) {
    const v = await supabaseGetJson("artworks");
    if (Array.isArray(v)) {
      return v as Artwork[];
    }
    return defaultSeedArtworks();
  }

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(redisKeys().artworks);
    const parsed = parseRedisJson<Artwork[]>(raw);
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }
    return defaultSeedArtworks();
  }

  const file = path.join(getDataDir(), ARTWORKS_FILE);
  try {
    const raw = await fs.readFile(file, "utf-8");
    try {
      return JSON.parse(raw) as Artwork[];
    } catch {
      return defaultSeedArtworks();
    }
  } catch {
    const seed = defaultSeedArtworks();
    try {
      await fs.mkdir(getDataDir(), { recursive: true });
      await fs.writeFile(file, JSON.stringify(seed, null, 2), "utf-8");
    } catch {
      /* e.g. serverless read-only FS — still serve seed list in memory */
    }
    return seed;
  }
}

export async function writeArtworks(list: Artwork[]): Promise<void> {
  if (getSupabaseAdmin()) {
    await supabaseSetJson("artworks", list);
    return;
  }

  const redis = getRedis();
  if (redis) {
    await redis.set(redisKeys().artworks, JSON.stringify(list));
    return;
  }

  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(
    path.join(getDataDir(), ARTWORKS_FILE),
    JSON.stringify(list, null, 2),
    "utf-8"
  );
}

export async function getArtworkBySlug(
  slug: string
): Promise<Artwork | undefined> {
  const all = await readArtworks();
  return all.find((a) => a.slug === slug && a.published);
}

export function ensureUniqueSlug(
  base: string,
  existing: Artwork[],
  exceptId?: string
): string {
  let slug = slugify(base) || "work";
  let n = 1;
  while (
    existing.some((a) => a.slug === slug && a.id !== exceptId)
  ) {
    slug = `${slugify(base) || "work"}-${n++}`;
  }
  return slug;
}

export { slugify };

export function ensureUniqueNewsSlug(
  base: string,
  existing: NewsPost[],
  exceptId?: string
): string {
  let slug = slugify(base) || "update";
  let n = 1;
  while (existing.some((p) => p.slug === slug && p.id !== exceptId)) {
    slug = `${slugify(base) || "update"}-${n++}`;
  }
  return slug;
}

export async function readNewsPosts(): Promise<NewsPost[]> {
  if (getSupabaseAdmin()) {
    const v = await supabaseGetJson("news");
    if (Array.isArray(v)) {
      return v as NewsPost[];
    }
    return [];
  }

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(redisKeys().news);
    const parsed = parseRedisJson<NewsPost[]>(raw);
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  }

  const file = path.join(getDataDir(), NEWS_FILE);
  try {
    const raw = await fs.readFile(file, "utf-8");
    try {
      const parsed = JSON.parse(raw) as NewsPost[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

export async function writeNewsPosts(list: NewsPost[]): Promise<void> {
  if (getSupabaseAdmin()) {
    await supabaseSetJson("news", list);
    return;
  }

  const redis = getRedis();
  if (redis) {
    await redis.set(redisKeys().news, JSON.stringify(list));
    return;
  }

  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(
    path.join(getDataDir(), NEWS_FILE),
    JSON.stringify(list, null, 2),
    "utf-8"
  );
}

export async function getNewsPostBySlug(
  slug: string
): Promise<NewsPost | undefined> {
  const all = await readNewsPosts();
  return all.find((p) => p.slug === slug && p.published);
}
