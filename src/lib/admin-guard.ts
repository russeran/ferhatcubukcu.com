import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";

export async function requireAdminSession() {
  const ok = await getSessionFromCookies();
  if (!ok) {
    redirect("/admin/login");
  }
}
