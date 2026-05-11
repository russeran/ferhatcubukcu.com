import type { Artwork, SiteSettings } from "@/lib/types";
import fs from "fs/promises";
import path from "path";
import { getDataDir } from "@/lib/auth";

const SETTINGS_FILE = "settings.json";
const ARTWORKS_FILE = "artworks.json";

const defaultSettings: SiteSettings = {
  artistName: "Ferhat Çubukçu",
  taglineEn: "Paintings — oil and pigment on canvas",
  taglineTr: "Tuval üzerine yağlıboya ve pigment",
  bioEn:
    "Ferhat Çubukçu works from observation and memory, building compositions where light, texture, and color carry equal weight. The studio practice bridges landscape, interior, and figure — surfaces worked slowly until the image holds its own silence.",
  bioTr:
    "Ferhat Çubukçu, gözlem ve hafızadan yürür; ışık, doku ve rengin eşit ağırlıkta olduğu kompozisyonlar kurar. Atölye pratiği peyzaj, iç mekân ve figür arasında köprü kurar; yüzey, görüntü kendi sessizliğini taşıyana dek biçimlenir.",
  heroImage: "/hero-placeholder.svg",
  contactEmail: "studio@ferhatcubukcu.com",
  instagram: "",
  studioNoteEn: "Commissions and exhibition inquiries welcome.",
  studioNoteTr: "Sipariş ve sergi talepleri için iletişime geçebilirsiniz.",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function readSettings(): Promise<SiteSettings> {
  const file = path.join(getDataDir(), SETTINGS_FILE);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    await fs.mkdir(getDataDir(), { recursive: true });
    await fs.writeFile(
      file,
      JSON.stringify(defaultSettings, null, 2),
      "utf-8"
    );
    return { ...defaultSettings };
  }
}

export async function writeSettings(
  partial: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await readSettings();
  const next = { ...current, ...partial };
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(
    path.join(getDataDir(), SETTINGS_FILE),
    JSON.stringify(next, null, 2),
    "utf-8"
  );
  return next;
}

export async function readArtworks(): Promise<Artwork[]> {
  const file = path.join(getDataDir(), ARTWORKS_FILE);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as Artwork[];
  } catch {
    const seed: Artwork[] = [
      {
        id: "seed-1",
        slug: "nocturne-study",
        titleEn: "Nocturne study",
        titleTr: "Noktürn çalışması",
        descriptionEn:
          "A small study in blues and umber — late interior light held against the window.",
        descriptionTr:
          "Mavi ve çımbarın küçük bir çalışması — geç iç mekân ışığı pencereye tutunur.",
        image: "/gallery-placeholder.svg",
        year: "2024",
        mediumEn: "Oil on linen",
        mediumTr: "Ketende yağlıboya",
        dimensions: "40 × 50 cm",
        order: 0,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-2",
        slug: "terracotta-ground",
        titleEn: "Terracotta ground",
        titleTr: "Terrakota zemin",
        descriptionEn:
          "Warm earth tones over a prepared ground; brush rhythm follows the weave of the cloth.",
        descriptionTr:
          "Hazırlı bir zeminin üzerinde sıcak toprak tonları; fırça ritmi kumaşın dokusunu izler.",
        image: "/gallery-placeholder.svg",
        year: "2025",
        mediumEn: "Oil on canvas",
        mediumTr: "Tuval üzerine yağlıboya",
        dimensions: "60 × 80 cm",
        order: 1,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-3",
        slug: "winter-light",
        titleEn: "Winter light",
        titleTr: "Kış ışığı",
        descriptionEn:
          "Cool light across an interior edge — charcoal drawing notes beneath thin oil glazes.",
        descriptionTr:
          "İç mekânın kenarında serin ışık — seyrek yağlıboya sırlarının altında kömür çizim notaları.",
        image: "/gallery-placeholder.svg",
        year: "2025",
        mediumEn: "Oil and charcoal on panel",
        mediumTr: "Panel üzerine yağlıboya ve kömür",
        dimensions: "35 × 45 cm",
        order: 2,
        published: true,
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.mkdir(getDataDir(), { recursive: true });
    await fs.writeFile(file, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
}

export async function writeArtworks(list: Artwork[]): Promise<void> {
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
