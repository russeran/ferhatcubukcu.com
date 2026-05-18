import { Suspense } from "react";
import { AdminArtworks } from "@/components/admin/AdminArtworks";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminArtworksPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminPageShell
      title={t("artworks")}
      description="Images up to 8MB · JPEG, PNG, WebP, GIF"
      actions={<AdminSignOut />}
    >
      <div className="admin-body !mt-0">
        <AdminNav />
        <Suspense fallback={<p className="text-ink-muted">…</p>}>
          <AdminArtworks />
        </Suspense>
      </div>
    </AdminPageShell>
  );
}
