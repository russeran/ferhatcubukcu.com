import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
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
    <AdminPageShell
      title={t("dashboard")}
      description={
        <>
          Manage bilingual paintings, news and social posts, hero image path,
          and biography. File uploads go to{" "}
          <code className="admin-code">/public/uploads</code>.
        </>
      }
      actions={<AdminSignOut />}
    >
      <div className="admin-body !mt-0 space-y-8">
        <AdminNav />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/${locale}/admin/artworks`}
            prefetch={false}
            className="admin-card"
          >
            <p className="font-serif text-xl font-medium text-goldleaf">
              {t("artworks")}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Images, EN/TR titles & descriptions, slug, sort order, publish.
            </p>
          </Link>
          <Link
            href={`/${locale}/admin/news`}
            prefetch={false}
            className="admin-card"
          >
            <p className="font-serif text-xl font-medium text-goldleaf">
              {t("news")}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Studio updates, press, and social links — bilingual, with optional
              image and external URL.
            </p>
          </Link>
          <Link
            href={`/${locale}/admin/settings`}
            prefetch={false}
            className="admin-card md:col-span-2 lg:col-span-1"
          >
            <p className="font-serif text-xl font-medium text-goldleaf">
              {t("settings")}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Taglines, bio, hero path, email, Instagram, studio notes.
            </p>
          </Link>
        </div>
      </div>
    </AdminPageShell>
  );
}
