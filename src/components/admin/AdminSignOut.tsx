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
      className="rounded-full border border-white/20 px-5 py-2 text-sm text-parchment/85 hover:border-goldleaf hover:text-goldleaf"
    >
      {t("signOut")}
    </button>
  );
}
