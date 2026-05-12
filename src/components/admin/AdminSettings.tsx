"use client";

import type { SiteSettings } from "@/lib/types";
import { readApiError } from "@/lib/read-api-error";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function AdminSettings() {
  const t = useTranslations("admin");
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { credentials: "same-origin" })
      .then((r) => r.json())
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError(`${t("saveFailed")}: ${await readApiError(res)}`);
      return;
    }
    const next = (await res.json()) as SiteSettings;
    setForm(next);
    setSaved(true);
  }

  if (loading || !form) {
    return <p className="text-parchment/60">…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-6" onInput={() => setSaved(false)}>
      {error ? (
        <p
          className="rounded-lg border border-oxide/50 bg-oxide/10 px-4 py-3 text-sm text-oxide"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-patina" role="status">
          {t("saved")}
        </p>
      ) : null}
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Artist name
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.artistName}
          onChange={(e) => setForm({ ...form, artistName: e.target.value })}
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Tagline EN
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.taglineEn}
          onChange={(e) => setForm({ ...form, taglineEn: e.target.value })}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Tagline TR
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.taglineTr}
          onChange={(e) => setForm({ ...form, taglineTr: e.target.value })}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Hero image path
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.heroImage ?? ""}
          onChange={(e) =>
            setForm({ ...form, heroImage: e.target.value || undefined })
          }
          placeholder="/hero-placeholder.svg"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Bio EN
        </span>
        <textarea
          className="focus-ring min-h-[120px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.bioEn}
          onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Bio TR
        </span>
        <textarea
          className="focus-ring min-h-[120px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.bioTr}
          onChange={(e) => setForm({ ...form, bioTr: e.target.value })}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Contact email
        </span>
        <input
          type="email"
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.contactEmail}
          onChange={(e) =>
            setForm({ ...form, contactEmail: e.target.value })
          }
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Instagram (handle or URL)
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.instagram ?? ""}
          onChange={(e) =>
            setForm({ ...form, instagram: e.target.value || undefined })
          }
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Behance (full URL)
        </span>
        <input
          className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.behance ?? ""}
          onChange={(e) =>
            setForm({ ...form, behance: e.target.value || undefined })
          }
          placeholder="https://www.behance.net/ferhat_cubukcu"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Studio note EN
        </span>
        <textarea
          className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.studioNoteEn ?? ""}
          onChange={(e) =>
            setForm({ ...form, studioNoteEn: e.target.value || undefined })
          }
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-parchment/45">
          Studio note TR
        </span>
        <textarea
          className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
          value={form.studioNoteTr ?? ""}
          onChange={(e) =>
            setForm({ ...form, studioNoteTr: e.target.value || undefined })
          }
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-goldleaf px-8 py-3 text-sm font-semibold text-umber-deep hover:bg-parchment"
      >
        {t("save")}
      </button>
    </form>
  );
}
