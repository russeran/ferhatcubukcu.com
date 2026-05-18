import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminNews } from "@/components/admin/AdminNews";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewsPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminPageShell
      title={t("news")}
      description={t("newsIntro")}
      actions={<AdminSignOut />}
    >
      <div className="admin-body !mt-0">
        <AdminNav />
        <Suspense fallback={<p className="text-ink-muted">…</p>}>
          <AdminNews />
        </Suspense>
      </div>
    </AdminPageShell>
  );
}
