import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { readSettings } from "@/lib/data";

const DEFAULT_BEHANCE = "https://www.behance.net/ferhat_cubukcu";

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "curator" });
  const settings = await readSettings();
  const behance = settings.behance?.trim() || DEFAULT_BEHANCE;
  const prefix = `/${locale}`;

  return (
    <footer className="relative mt-auto border-t border-umber/10 bg-parchment-dark/90 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom,0px)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-goldleaf/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-sm text-umber/60 sm:px-5 md:flex-row md:items-start md:justify-between md:gap-10 md:py-14">
        <div className="space-y-4 md:max-w-md">
          <p className="text-umber/75">{t("rights")}</p>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium tracking-wide text-umber/55"
            aria-label={t("footerNavAria")}
          >
            <Link
              href={`${prefix}/gallery`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("gallery")}
            </Link>
            <span className="text-umber/25" aria-hidden>
              ·
            </span>
            <Link
              href={`${prefix}/studio`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("studio")}
            </Link>
            <span className="text-umber/25" aria-hidden>
              ·
            </span>
            <Link
              href={`${prefix}/press`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("press")}
            </Link>
            <span className="text-umber/25" aria-hidden>
              ·
            </span>
            <Link
              href={`${prefix}/news`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("news")}
            </Link>
            <span className="text-umber/25" aria-hidden>
              ·
            </span>
            <Link
              href={`${prefix}/about`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("about")}
            </Link>
            <span className="text-umber/25" aria-hidden>
              ·
            </span>
            <Link
              href={`${prefix}/contact`}
              className="transition-colors hover:text-umber-deep"
            >
              {tn("contact")}
            </Link>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href={behance}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-oxide underline-offset-[5px] transition hover:text-umber-deep hover:underline"
            >
              {t("behanceCta")}
            </a>
            <a
              href="/api/curator-pack"
              className="inline-flex text-sm font-medium text-umber-deep/80 underline-offset-[5px] transition hover:text-oxide hover:underline"
            >
              {t("curatorPack")} — {tc("footerLabel")}
            </a>
          </div>
        </div>
        <p className="max-w-xs font-serif text-sm italic leading-relaxed tracking-wide text-umber/45 md:text-right">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
