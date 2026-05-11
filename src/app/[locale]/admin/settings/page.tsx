import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations("admin");

  return (
    <div className="admin-surface min-h-[calc(100vh-12rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-umber-deep/95 via-patina/95 to-umber-deep/95 p-8 shadow-2xl md:p-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-serif text-3xl text-parchment md:text-4xl">
          {t("settings")}
        </h1>
        <AdminSignOut />
      </div>
      <div className="mt-8 space-y-10">
        <AdminNav />
        <AdminSettings />
      </div>
    </div>
  );
}
