import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/types";
import { splitArtistName } from "@/lib/split-artist-name";
import { ArtistWordmark } from "@/components/ArtistWordmark";
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
          <p className="text-mono-caption">{t("phiEyebrow")}</p>
          <h1 className="text-balance leading-[1.02] tracking-tight">
            <ArtistWordmark first={first} rest={rest} size="hero" className="block" />
          </h1>
          <p className="max-w-xl text-balance font-serif text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl md:text-[2.05rem]">
            {tagline}
          </p>
          <p className="prose-atelier max-w-xl text-sm md:text-base">
            {t("statementLead")}
          </p>
          <p className="text-mono-note max-w-xl">
            <span className="text-goldleaf/95">φ</span>
            <span className="mx-1.5 text-ink-faint/50">·</span>
            {t("phiMeasure")}
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Link href="/gallery" className="btn-primary">
              {t("viewWork")}
            </Link>
            <Link href="/contact" className="btn-secondary">
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
