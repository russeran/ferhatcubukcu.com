import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { requireAdminSession } from "@/lib/admin-guard";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="admin-surface min-h-[calc(100vh-12rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-2xl md:p-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-parchment md:text-4xl">
            {t("dashboard")}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-parchment/65">
            Manage bilingual painting entries, hero image path, and biography.
            File uploads go to{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              /public/uploads
            </code>
            .
          </p>
        </div>
        <AdminSignOut />
      </div>
      <div className="mt-10 space-y-8">
        <AdminNav />
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href={`/${locale}/admin/artworks`}
            prefetch={false}
            className="group rounded-xl border border-white/10 bg-black/20 p-6 transition hover:border-goldleaf/40"
          >
            <p className="font-serif text-xl text-goldleaf">{t("artworks")}</p>
            <p className="mt-2 text-sm text-parchment/60">
              Images, EN/TR titles & descriptions, slug, sort order, publish.
            </p>
          </Link>
          <Link
            href={`/${locale}/admin/settings`}
            prefetch={false}
            className="group rounded-xl border border-white/10 bg-black/20 p-6 transition hover:border-goldleaf/40"
          >
            <p className="font-serif text-xl text-goldleaf">{t("settings")}</p>
            <p className="mt-2 text-sm text-parchment/60">
              Taglines, bio, hero path, email, Instagram, Behance, studio notes.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
