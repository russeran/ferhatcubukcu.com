import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/types";
import { splitArtistName } from "@/lib/split-artist-name";
import { HomeHeroGeometryDecor } from "@/components/HomeHeroGeometryDecor";
import {
  HomeHeroGalleryShowcase,
  type HomeHeroSlide,
} from "@/components/HomeHeroGalleryShowcase";

type Props = {
  locale: string;
  settings: SiteSettings;
  heroSlides: HomeHeroSlide[];
  tagline: string;
};

export async function HomeHeroSection({
  locale,
  settings,
  heroSlides,
  tagline,
}: Props) {
  const t = await getTranslations({ locale, namespace: "home" });
  const { first, rest } = splitArtistName(settings.artistName);

  return (
    <section className="relative overflow-hidden">
      <HomeHeroGeometryDecor />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-10 sm:px-5 sm:py-14 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
        <div className="animate-fade-up space-y-4 pl-0 sm:space-y-5">
          <p className="font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.28em] text-umber/58 sm:text-[11px]">
            {t("phiEyebrow")}
          </p>
          <h1 className="text-balance font-serif leading-[1.02] tracking-tight">
            <span className="block text-[clamp(1.85rem,5.2vw,3.35rem)] font-bold tracking-[0.04em] text-umber-deep drop-shadow-[0_2px_18px_rgba(244,239,230,0.55)]">
              {first}
            </span>
            {rest ? (
              <span className="mt-1.5 block bg-gradient-to-br from-patina via-goldleaf/80 to-oxide bg-clip-text text-[clamp(1.65rem,4.6vw,2.95rem)] font-semibold italic tracking-[0.08em] text-transparent sm:mt-2">
                {rest}
              </span>
            ) : null}
          </h1>
          <p className="max-w-xl text-balance font-serif text-2xl font-medium leading-snug tracking-tight text-umber-deep sm:text-3xl md:text-[2.05rem]">
            {tagline}
          </p>
          <p className="prose-atelier max-w-xl text-sm text-umber/75 md:text-base">
            {t("statementLead")}
          </p>
          <p className="max-w-xl font-mono text-[10px] leading-relaxed tracking-[0.12em] text-umber/48 sm:text-[11px]">
            <span className="text-goldleaf/95">φ</span>
            <span className="mx-1.5 text-umber/35">·</span>
            {t("phiMeasure")}
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center rounded-sm bg-umber-deep px-8 py-3.5 text-sm font-semibold tracking-wide text-parchment shadow-[6px_6px_0_0_rgba(201,168,90,0.22)] transition duration-300 ease-out-expo hover:bg-oxide hover:shadow-[8px_8px_0_0_rgba(201,168,90,0.28)]"
            >
              {t("viewWork")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-sm border border-umber/25 bg-parchment/75 px-8 py-3.5 text-sm font-medium tracking-wide text-umber-deep shadow-sm backdrop-blur-sm transition duration-300 ease-out-expo hover:border-goldleaf/55 hover:text-oxide"
            >
              {locale === "tr" ? "İletişim" : "Contact"}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-2 -z-10 rounded-sm bg-gradient-to-br from-goldleaf/15 via-transparent to-oxide/10 opacity-90 blur-2xl"
            aria-hidden
          />
          <div className="relative rounded-sm shadow-[12px_12px_0_0_rgba(26,23,20,0.06)]">
            <HomeHeroGalleryShowcase
              slides={heroSlides}
              fallbackSrc={settings.heroImage || "/hero-placeholder.svg"}
              fallbackAlt={t("heroAlt")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
