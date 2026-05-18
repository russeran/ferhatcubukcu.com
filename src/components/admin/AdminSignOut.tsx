"use client";

import { useLocale, useTranslations } from "next-intl";

export function AdminSignOut() {
  const t = useTranslations("admin");
  const locale = useLocale();

  async function signOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    window.location.assign(`/${locale}`);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="btn-admin-secondary px-5 py-2"
    >
      {t("signOut")}
    </button>
  );
}
