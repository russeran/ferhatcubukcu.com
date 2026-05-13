import { getSessionFromCookies } from "@/lib/auth";
import { FibonacciWatermark } from "@/components/FibonacciWatermark";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export async function SiteChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const showAdminNav = await getSessionFromCookies();

  return (
    <>
      <FibonacciWatermark />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader showAdminNav={showAdminNav} />
        <main className="relative min-h-0 flex-1 overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-goldleaf/[0.06] via-transparent to-transparent"
            aria-hidden
          />
          {children}
        </main>
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
