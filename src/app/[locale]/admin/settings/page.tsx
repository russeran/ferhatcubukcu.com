import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminPageShell title={t("settings")} actions={<AdminSignOut />}>
      <div className="admin-body !mt-0">
        <AdminNav />
        <AdminSettings />
      </div>
    </AdminPageShell>
  );
}
