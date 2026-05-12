import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";

export async function requireAdminSession(locale: string) {
  const ok = await getSessionFromCookies();
  if (!ok) {
    redirect({ href: "/admin/login", locale });
  }
}
