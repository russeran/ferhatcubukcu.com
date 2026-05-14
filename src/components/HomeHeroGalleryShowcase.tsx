"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type HomeHeroSlide = {
  image: string;
  slug: string;
  title: string;
};

const ROTATE_MS = 5200;

type Props = {
  slides: HomeHeroSlide[];
  fallbackSrc: string;
  fallbackAlt: string;
};

export function HomeHeroGalleryShowcase({
  slides,
  fallbackSrc,
  fallbackAlt,
}: Props) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full animate-fade-up overflow-hidden rounded-sm bg-gradient-to-br from-parchment-warm to-parchment-dark shadow-gallery ring-1 ring-umber/15 md:aspect-[5/4]">
        <Image
          src={fallbackSrc}
          alt={fallbackAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/20 via-transparent to-white/25" />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/3] w-full animate-fade-up overflow-hidden rounded-sm bg-gradient-to-br from-parchment-warm to-parchment-dark shadow-gallery ring-1 ring-umber/15 md:aspect-[5/4]"
      aria-roledescription="carousel"
      aria-label={t("heroSlideshowAria")}
    >
      <div aria-live="polite" className="sr-only">
        {slides[active]?.title}
      </div>
      {slides.map((item, i) => (
        <Link
          key={item.slug}
          href={`/gallery/${item.slug}`}
            className={cn(
            "absolute inset-0 block outline-none transition-opacity duration-[900ms] ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-goldleaf/90",
            i === active
              ? "z-[2] opacity-100"
              : "z-[1] opacity-0 pointer-events-none"
          )}
          aria-current={i === active ? "true" : undefined}
          aria-label={item.title}
        >
          <Image
            key={`${item.slug}-${i === active}`}
            src={item.image}
            alt=""
            fill
            className={cn(
              "object-cover",
              i === active && slides.length > 1
                ? "motion-safe:animate-hero-ken"
                : ""
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === 0}
          />
        </Link>
      ))}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-br from-white/20 via-transparent to-umber-deep/15" />
      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-[4] flex justify-center gap-2 px-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "pointer-events-auto h-2 rounded-full transition-all duration-300 focus-ring",
                i === active
                  ? "w-8 bg-parchment shadow-sm"
                  : "w-2 bg-parchment/45 hover:bg-parchment/70"
              )}
              aria-label={t("heroSlideshowDotAria", {
                current: i + 1,
                total: slides.length,
              })}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
