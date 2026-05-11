import { AdminArtworks } from "@/components/admin/AdminArtworks";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminArtworksPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations("admin");

  return (
    <div className="admin-surface min-h-[calc(100vh-12rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-umber-deep/95 via-patina/95 to-umber-deep/95 p-8 shadow-2xl md:p-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-parchment md:text-4xl">
            {t("artworks")}
          </h1>
          <p className="mt-1 text-sm text-parchment/60">
            Images up to 8MB · JPEG, PNG, WebP, GIF
          </p>
        </div>
        <AdminSignOut />
      </div>
      <div className="mt-8 space-y-10">
        <AdminNav />
        <AdminArtworks />
      </div>
    </div>
  );
}
