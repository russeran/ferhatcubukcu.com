import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminLoginPage({ params }: Props) {
  const { locale } = await params;
  const session = await getSessionFromCookies();
  if (session) {
    redirect({ href: "/admin", locale });
  }
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="admin-surface min-h-[calc(100vh-12rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-2xl md:p-14">
      <h1 className="font-serif text-3xl text-parchment md:text-4xl">
        {t("loginTitle")}
      </h1>
      <p className="mt-3 max-w-md text-sm text-parchment/60">
        Secure admin · bilingual projects & site copy
      </p>
      <div className="mt-10">
        <AdminLoginForm />
      </div>
    </div>
  );
}
