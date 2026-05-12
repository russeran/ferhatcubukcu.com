import { getSessionFromCookies } from "@/lib/auth";
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
      <SiteHeader showAdminNav={showAdminNav} />
      <main className="min-h-0 flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
