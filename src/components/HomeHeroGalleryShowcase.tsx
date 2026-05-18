"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FavoriteStamp } from "@/components/FavoriteStamp";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type HomeHeroSlide = {
  image: string;
  slug: string;
  title: string;
  favorite?: boolean;
};

const ROTATE_MS = 5200;

const frameClass =
  "hero-slideshow-frame relative aspect-[4/3] w-full animate-fade-up md:aspect-[5/4]";

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
  const tg = useTranslations("gallery");
  const [active, setActive] = useState(0);
  const favoriteLabel = tg("artistFavorite");

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className={frameClass}>
        <Image
          src={fallbackSrc}
          alt={fallbackAlt}
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-anthracite/10 via-transparent to-white/50" />
      </div>
    );
  }

  const activeFavorite = Boolean(slides[active]?.favorite);

  return (
    <div
      className={cn(frameClass, activeFavorite && "gallery-image-frame-favorite")}
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
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === 0}
          />
          {item.favorite && i === active ? (
            <FavoriteStamp label={favoriteLabel} />
          ) : null}
        </Link>
      ))}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-br from-white/35 via-transparent to-anthracite/8" />
      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-[4] flex justify-center gap-2 px-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "pointer-events-auto h-2.5 rounded-full border-2 border-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all duration-300 focus-ring",
                i === active
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/45 hover:bg-white/70"
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
