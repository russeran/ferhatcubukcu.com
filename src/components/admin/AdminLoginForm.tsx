"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AdminLoginForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("loginError"));
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-6">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-parchment/55">
          {t("password")}
        </span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-parchment placeholder:text-parchment/35"
          required
        />
      </label>
      {error ? (
        <p className="text-sm text-oxide" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-goldleaf px-6 py-3 text-sm font-semibold text-umber-deep transition hover:bg-parchment disabled:opacity-50"
      >
        {pending ? "…" : t("signIn")}
      </button>
    </form>
  );
}
