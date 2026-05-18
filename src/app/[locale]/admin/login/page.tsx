import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
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
    <AdminPageShell
      title={t("loginTitle")}
      description="Secure admin · bilingual paintings & site copy"
    >
      <AdminLoginForm />
    </AdminPageShell>
  );
}
