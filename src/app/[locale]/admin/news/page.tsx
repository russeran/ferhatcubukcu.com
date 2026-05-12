import { AdminNav } from "@/components/admin/AdminNav";
import { AdminNews } from "@/components/admin/AdminNews";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewsPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="admin-surface min-h-[calc(100vh-12rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-2xl md:p-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-parchment md:text-4xl">
            {t("news")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-parchment/60">
            {t("newsIntro")}
          </p>
        </div>
        <AdminSignOut />
      </div>
      <div className="mt-8 space-y-10">
        <AdminNav />
        <AdminNews />
      </div>
    </div>
  );
}
