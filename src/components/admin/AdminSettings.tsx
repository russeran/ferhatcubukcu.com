"use client";

import type { PressQuote, SiteSettings } from "@/lib/types";
import { readApiError } from "@/lib/read-api-error";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function newPressQuoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
          className="accent-panel px-4 py-3 text-sm text-oxide-deep"
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
      <div className="space-y-3 rounded-lg border border-white/10 bg-black/15 p-4">
        <p className="text-xs uppercase tracking-wider text-parchment/45">
          {t("galleryDisplaySection")}
        </p>
        <p className="text-xs text-parchment/50">{t("galleryImageFitHint")}</p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="focus-ring mt-0.5 h-4 w-4 rounded border-white/25 bg-black/40 accent-goldleaf"
            checked={form.galleryImageFit ?? false}
            onChange={(e) =>
              setForm({ ...form, galleryImageFit: e.target.checked })
            }
          />
          <span className="text-sm text-parchment/90">
            {t("galleryImageFitLabel")}
          </span>
        </label>
      </div>
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
      <div className="space-y-4 rounded-lg border border-white/10 bg-black/15 p-4">
        <p className="text-xs uppercase tracking-wider text-parchment/45">
          {t("pressQuotesSection")}
        </p>
        <p className="text-xs text-parchment/50">{t("pressQuotesHint")}</p>
        {(form.pressQuotes ?? []).map((q, i) => (
          <div
            key={q.id}
            className="space-y-3 rounded-md border border-white/10 bg-black/20 p-4"
          >
            <div className="flex justify-end">
              <button
                type="button"
                className="btn-admin-delete px-2.5 py-1 text-[10px] normal-case tracking-normal"
                onClick={() =>
                  setForm({
                    ...form,
                    pressQuotes: (form.pressQuotes ?? []).filter(
                      (_, j) => j !== i
                    ),
                  })
                }
              >
                {t("removePressQuote")}
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressQuoteEn")}</span>
              <textarea
                className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.quoteEn}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, quoteEn: e.target.value };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressQuoteTr")}</span>
              <textarea
                className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.quoteTr}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, quoteTr: e.target.value };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressAttrEn")}</span>
              <input
                className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.attributionEn}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, attributionEn: e.target.value };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressAttrTr")}</span>
              <input
                className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.attributionTr}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, attributionTr: e.target.value };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressUrl")}</span>
              <input
                className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.url ?? ""}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, url: e.target.value };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-parchment/55">{t("pressImage")}</span>
              <input
                className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                value={q.image ?? ""}
                onChange={(e) => {
                  const next = [...(form.pressQuotes ?? [])];
                  next[i] = { ...q, image: e.target.value || undefined };
                  setForm({ ...form, pressQuotes: next });
                }}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          className="btn-admin-add text-xs normal-case tracking-normal"
          onClick={() =>
            setForm({
              ...form,
              pressQuotes: [
                ...(form.pressQuotes ?? []),
                {
                  id: newPressQuoteId(),
                  quoteEn: "",
                  quoteTr: "",
                  attributionEn: "",
                  attributionTr: "",
                  url: "",
                  image: "",
                } satisfies PressQuote,
              ],
            })
          }
        >
          {t("addPressQuote")}
        </button>
      </div>
      <button
        type="submit"
        className="btn-admin-primary px-8 py-3"
      >
        {t("save")}
      </button>
    </form>
  );
}
