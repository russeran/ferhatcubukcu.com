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
        <main className="min-h-0 flex-1 overflow-x-hidden">{children}</main>
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
