import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/types";
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

function splitArtistName(full: string) {
  const t = full.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, rest: "" as string };
  return { first: t.slice(0, i), rest: t.slice(i + 1).trim() };
}

export async function HomeHeroSection({
  locale,
  settings,
  heroSlides,
  tagline,
}: Props) {
  const t = await getTranslations({ locale, namespace: "home" });
  const { first, rest } = splitArtistName(settings.artistName);

  return (
    <section className="relative overflow-hidden border-b border-umber/20">
      <HomeHeroGeometryDecor />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:gap-14 sm:px-5 sm:py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
        <div className="animate-fade-up space-y-5 border-l-[3px] border-goldleaf/60 pl-6 sm:space-y-6 sm:pl-8">
          <div className="gold-rule" aria-hidden />
          <p className="font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.28em] text-umber/58 sm:text-[11px]">
            {t("phiEyebrow")}
          </p>
          <h1 className="text-balance font-serif text-3xl font-semibold leading-[1.05] tracking-tight text-umber-deep drop-shadow-[0_1px_0_rgba(255,252,245,0.35)] sm:text-4xl md:text-5xl lg:text-[3.15rem]">
            <span className="block">{first}</span>
            {rest ? (
              <span className="mt-0.5 block bg-gradient-to-r from-patina via-patina-light to-patina bg-clip-text font-medium italic text-transparent">
                {rest}
              </span>
            ) : null}
          </h1>
          <div className="gold-rule max-w-[10rem]" aria-hidden />
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
