import { FibonacciWatermark } from "@/components/FibonacciWatermark";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { readSettings } from "@/lib/data";

export async function SiteChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const settings = await readSettings();
  return (
    <>
      <FibonacciWatermark />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader artistName={settings.artistName} />
        <main className="relative min-h-0 flex-1 overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-goldleaf/[0.12] via-goldleaf/[0.04] to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-24 left-0 hidden w-px bg-gradient-to-b from-goldleaf/30 via-goldleaf/10 to-transparent md:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-24 right-0 hidden w-px bg-gradient-to-b from-goldleaf/30 via-goldleaf/10 to-transparent md:block"
            aria-hidden
          />
          {children}
        </main>
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
