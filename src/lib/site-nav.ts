/** Top-level header links (excluding the News & studio hub). */
export const primaryNavLinks = [
  { href: "/", key: "home" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

/** Grouped under “News & studio” in the header. */
export const newsHubNavLinks = [
  { href: "/studio", key: "studio" as const },
  { href: "/press", key: "press" as const },
  { href: "/social", key: "social" as const },
];

export function pathMatchesNav(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname === "";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pathInNewsHub(pathname: string): boolean {
  return newsHubNavLinks.some((l) => pathMatchesNav(pathname, l.href));
}
