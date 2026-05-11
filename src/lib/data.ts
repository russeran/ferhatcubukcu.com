import type { Artwork, SiteSettings } from "@/lib/types";
import fs from "fs/promises";
import path from "path";
import { getDataDir } from "@/lib/auth";

const SETTINGS_FILE = "settings.json";
const ARTWORKS_FILE = "artworks.json";

const defaultSettings: SiteSettings = {
  artistName: "Ferhat Çubukçu",
  taglineEn: "Digital & graphic design — identity, editorial, campaigns",
  taglineTr: "Dijital ve grafik tasarım — kimlik, editoryal, kampanyalar",
  bioEn:
    "Ferhat Çubukçu is a freelance digital designer based in İstanbul, working with brands on visual systems, layout, and campaign-ready artwork. His background spans retail, automotive, and airport environments — contexts where clear hierarchy and calm typography matter. He combines structured grids with a restrained palette so each project reads quickly and holds up in print and on screen.\n\nPublic profiles list long-term freelance graphic design practice alongside studies in business administration; this site is a curated selection of portfolio-style pieces. Replace this text anytime from the admin settings.",
  bioTr:
    "Ferhat Çubukçu, İstanbul merkezli serbest dijital tasarımcıdır; markalarla görsel sistemler, yerleşim ve kampanyaya hazır görseller üzerinde çalışır. Perakende, otomotiv ve havalimanı gibi ortamlardan gelen deneyimi, net hiyerarşi ve sakin tipografinin önemli olduğu işlere taşır. Izgara ve sınırlı bir paletle, projelerin hem baskıda hem ekranda hızlı okunmasını hedefler.\n\nKamu profillerinde uzun süreli grafik tasarım serbest çalışması ve işletme lisansı eğitimi yer alır; bu site seçilmiş portföy örneklerini sunar. Metni yönetim panelinden dilediğiniz zaman güncelleyebilirsiniz.",
  heroImage: "/hero-placeholder.svg",
  contactEmail: "hello@ferhatcubukcu.com",
  instagram: "https://www.instagram.com/ferhatcubukcu/",
  studioNoteEn: "Response time is usually within a few business days.",
  studioNoteTr: "Dönüş süresi genelde birkaç iş günü içindedir.",
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
        slug: "identity-grid-study",
        titleEn: "Identity grid study",
        titleTr: "Kimlik ızgara çalışması",
        descriptionEn:
          "Modular logo lockups, spacing rhythm, and typographic scale for a fictitious studio mark — built to stress-test clarity at small sizes.",
        descriptionTr:
          "Hayali bir stüdyo işareti için modüler logo yerleşimi, aralık ritmi ve tipografik ölçek — küçük boyutlarda okunabilirliği test etmek için.",
        image: "/gallery-placeholder.svg",
        year: "2024",
        mediumEn: "Brand guidelines · digital PDF",
        mediumTr: "Marka kılavuzu · dijital PDF",
        dimensions: "Full system",
        order: 0,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-2",
        slug: "editorial-spread",
        titleEn: "Editorial spread",
        titleTr: "Editoryal yayın sayfası",
        descriptionEn:
          "Two-column magazine rhythm with oversized numerals and restrained photography crops — print-first hierarchy translated to web mockups.",
        descriptionTr:
          "Büyük rakamlar ve sakin fotoğraf kırpımlarıyla iki sütunlu dergi ritmi — baskı öncelikli hiyerarşinin web maketlerine aktarımı.",
        image: "/gallery-placeholder.svg",
        year: "2025",
        mediumEn: "InDesign · Figma",
        mediumTr: "InDesign · Figma",
        dimensions: "Spread + digital",
        order: 1,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed-3",
        slug: "campaign-key-visual",
        titleEn: "Campaign key visual",
        titleTr: "Kampanya ana görseli",
        descriptionEn:
          "Hero composition for a launch narrative: bold type, single accent, and negative space tuned for social crops and out-of-home ratios.",
        descriptionTr:
          "Lansman anlatısı için ana kompozisyon: cesur tipografi, tek vurgu rengi ve sosyal kırpımlar ile dış mekân oranları için ayarlanmış negatif alan.",
        image: "/gallery-placeholder.svg",
        year: "2025",
        mediumEn: "Photoshop · motion stills",
        mediumTr: "Photoshop · hareketli kare",
        dimensions: "Multi-ratio kit",
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
