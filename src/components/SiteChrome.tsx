import { FibonacciWatermark } from "@/components/FibonacciWatermark";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SitePageBackdrop } from "@/components/SitePageBackdrop";
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
          <SitePageBackdrop>{children}</SitePageBackdrop>
        </main>
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
