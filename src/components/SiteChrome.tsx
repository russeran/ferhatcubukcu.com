import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-0 flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
