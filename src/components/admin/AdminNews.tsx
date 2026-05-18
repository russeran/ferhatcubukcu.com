"use client";

import type { NewsKind, NewsPost } from "@/lib/types";
import { readApiError } from "@/lib/read-api-error";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const fetchOpts: RequestInit = { credentials: "same-origin" };

const KINDS: NewsKind[] = ["news", "social", "press", "studio"];

const emptyForm = {
  kind: "news" as NewsKind,
  titleEn: "",
  titleTr: "",
  excerptEn: "",
  excerptTr: "",
  bodyEn: "",
  bodyTr: "",
  image: "",
  externalUrl: "",
  published: true,
  slug: "",
};

export function AdminNews() {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const deepLinkApplied = useRef<string | null>(null);
  const [items, setItems] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [create, setCreate] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/news?admin=1", fetchOpts);
    if (!res.ok) {
      setError(`${t("loadFailed")}: ${await readApiError(res)}`);
      setItems([]);
      return;
    }
    const data = (await res.json()) as NewsPost[];
    setItems(data);
  }, [t]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function uploadOne(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    if (!res.ok) {
      setError(`${t("uploadFailed")}: ${await readApiError(res)}`);
      return null;
    }
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  }

  async function uploadImage(file: File, mode: "create" | "edit") {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadOne(file);
      if (!url) return;
      if (mode === "create") setCreate((c) => ({ ...c, image: url }));
      else setEdit((c) => ({ ...c, image: url }));
    } finally {
      setUploading(false);
    }
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        kind: create.kind,
        titleEn: create.titleEn,
        titleTr: create.titleTr,
        excerptEn: create.excerptEn.trim() || undefined,
        excerptTr: create.excerptTr.trim() || undefined,
        bodyEn: create.bodyEn,
        bodyTr: create.bodyTr,
        image: create.image.trim() || undefined,
        externalUrl: create.externalUrl.trim() || "",
        published: create.published,
        slug: create.slug.trim() || undefined,
      }),
    });
    if (!res.ok) {
      setError(`${t("saveFailed")}: ${await readApiError(res)}`);
      return;
    }
    setCreate(emptyForm);
    await load();
  }

  function startEdit(p: NewsPost) {
    setEditingId(p.id);
    setError(null);
    setEdit({
      kind: p.kind,
      titleEn: p.titleEn,
      titleTr: p.titleTr,
      excerptEn: p.excerptEn ?? "",
      excerptTr: p.excerptTr ?? "",
      bodyEn: p.bodyEn,
      bodyTr: p.bodyTr,
      image: p.image ?? "",
      externalUrl: p.externalUrl ?? "",
      published: p.published,
      slug: p.slug,
    });
  }

  const editQuery = searchParams.get("edit");
  useEffect(() => {
    if (!editQuery) {
      deepLinkApplied.current = null;
      return;
    }
    if (loading || items.length === 0) return;
    if (deepLinkApplied.current === editQuery) return;
    const found = items.find((x) => x.id === editQuery);
    if (!found) return;
    deepLinkApplied.current = editQuery;
    startEdit(found);
    const tid = window.setTimeout(() => {
      document
        .getElementById(`admin-news-${editQuery}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
    return () => window.clearTimeout(tid);
  }, [editQuery, loading, items]);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    const order = items.find((x) => x.id === editingId)?.order ?? 0;
    const res = await fetch(`/api/news/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        kind: edit.kind,
        titleEn: edit.titleEn,
        titleTr: edit.titleTr,
        excerptEn: edit.excerptEn.trim() || undefined,
        excerptTr: edit.excerptTr.trim() || undefined,
        bodyEn: edit.bodyEn,
        bodyTr: edit.bodyTr,
        image: edit.image.trim() || undefined,
        externalUrl: edit.externalUrl.trim() || "",
        published: edit.published,
        slug: edit.slug.trim() || undefined,
        order,
      }),
    });
    if (!res.ok) {
      setError(`${t("saveFailed")}: ${await readApiError(res)}`);
      return;
    }
    setEditingId(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    setError(null);
    const res = await fetch(`/api/news/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      setError(`${t("saveFailed")}: ${await readApiError(res)}`);
      return;
    }
    await load();
  }

  if (loading) {
    return <p className="text-parchment/60">…</p>;
  }

  return (
    <div className="space-y-12">
      {error ? (
        <p
          className="accent-panel px-4 py-3 text-sm text-oxide-deep"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section id="admin-add-news" className="rounded-xl border border-white/10 bg-black/20 p-6">
        <h2 className="font-serif text-xl text-goldleaf">{t("addNews")}</h2>
        <form onSubmit={addPost} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">{t("newsKind")}</span>
            <select
              className="focus-ring w-full max-w-md rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.kind}
              onChange={(e) =>
                setCreate({ ...create, kind: e.target.value as NewsKind })
              }
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`newsKind_${k}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">{t("titleEn")}</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.titleEn}
              onChange={(e) =>
                setCreate({ ...create, titleEn: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">{t("titleTr")}</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.titleTr}
              onChange={(e) =>
                setCreate({ ...create, titleTr: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">{t("slug")}</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.slug}
              onChange={(e) =>
                setCreate({ ...create, slug: e.target.value })
              }
              placeholder="auto from title if empty"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("newsExcerptEn")}
            </span>
            <textarea
              className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.excerptEn}
              onChange={(e) =>
                setCreate({ ...create, excerptEn: e.target.value })
              }
              maxLength={400}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("newsExcerptTr")}
            </span>
            <textarea
              className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.excerptTr}
              onChange={(e) =>
                setCreate({ ...create, excerptTr: e.target.value })
              }
              maxLength={400}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("newsBodyEn")}
            </span>
            <textarea
              className="focus-ring min-h-[100px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.bodyEn}
              onChange={(e) =>
                setCreate({ ...create, bodyEn: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("newsBodyTr")}
            </span>
            <textarea
              className="focus-ring min-h-[100px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.bodyTr}
              onChange={(e) =>
                setCreate({ ...create, bodyTr: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("newsExternalUrl")}
            </span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.externalUrl}
              onChange={(e) =>
                setCreate({ ...create, externalUrl: e.target.value })
              }
              placeholder="https://…"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-wider text-parchment/45">
              {t("newsImage")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-parchment/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage(f, "create");
                e.target.value = "";
              }}
            />
            {uploading ? (
              <span className="mt-1 block text-xs text-parchment/50">
                Uploading…
              </span>
            ) : null}
            {create.image ? (
              <div className="relative mt-3 h-28 w-full max-w-xs overflow-hidden rounded border border-white/15">
                <Image
                  src={create.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            ) : null}
          </label>
          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={create.published}
              onChange={(e) =>
                setCreate({ ...create, published: e.target.checked })
              }
              className="h-4 w-4 rounded border-white/25 bg-black/40"
            />
            <span className="text-sm text-parchment/80">{t("published")}</span>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-goldleaf px-6 py-2 text-sm font-semibold text-ink hover:bg-parchment"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl text-parchment">{t("news")}</h2>
        <ul className="space-y-6">
          {items.map((p) => (
            <li
              key={p.id}
              id={`admin-news-${p.id}`}
              className="rounded-xl border border-white/10 bg-black/15 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {p.image ? (
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-black/40 md:h-28 md:w-40">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs uppercase tracking-wider text-parchment/50">
                    {t(`newsKind_${p.kind}`)}
                  </p>
                  <p className="font-serif text-lg text-parchment">
                    {p.titleEn} / {p.titleTr}
                  </p>
                  <p className="text-xs text-parchment/45">
                    /press/{p.slug} · order {p.order}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn-admin-edit"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-admin-delete"
                      onClick={() => remove(p.id)}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>

              {editingId === p.id ? (
                <form
                  onSubmit={saveEdit}
                  className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2"
                >
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsKind")}
                    </span>
                    <select
                      className="focus-ring w-full max-w-md rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.kind}
                      onChange={(e) =>
                        setEdit({ ...edit, kind: e.target.value as NewsKind })
                      }
                    >
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {t(`newsKind_${k}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">
                      {t("titleEn")}
                    </span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.titleEn}
                      onChange={(e) =>
                        setEdit({ ...edit, titleEn: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">
                      {t("titleTr")}
                    </span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.titleTr}
                      onChange={(e) =>
                        setEdit({ ...edit, titleTr: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">{t("slug")}</span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.slug}
                      onChange={(e) =>
                        setEdit({ ...edit, slug: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsExcerptEn")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.excerptEn}
                      onChange={(e) =>
                        setEdit({ ...edit, excerptEn: e.target.value })
                      }
                      maxLength={400}
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsExcerptTr")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[56px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.excerptTr}
                      onChange={(e) =>
                        setEdit({ ...edit, excerptTr: e.target.value })
                      }
                      maxLength={400}
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsBodyEn")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[100px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.bodyEn}
                      onChange={(e) =>
                        setEdit({ ...edit, bodyEn: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsBodyTr")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[100px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.bodyTr}
                      onChange={(e) =>
                        setEdit({ ...edit, bodyTr: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("newsExternalUrl")}
                    </span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.externalUrl}
                      onChange={(e) =>
                        setEdit({ ...edit, externalUrl: e.target.value })
                      }
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="text-xs uppercase tracking-wider text-parchment/45">
                      {t("newsImage")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-parchment/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadImage(f, "edit");
                        e.target.value = "";
                      }}
                    />
                    {uploading ? (
                      <span className="mt-1 block text-xs text-parchment/50">
                        Uploading…
                      </span>
                    ) : null}
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">Order</span>
                    <input
                      type="number"
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={items.find((x) => x.id === editingId)?.order ?? 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (Number.isNaN(v)) return;
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === editingId ? { ...x, order: v } : x
                          )
                        );
                      }}
                    />
                  </label>
                  <label className="flex items-center gap-3 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={edit.published}
                      onChange={(e) =>
                        setEdit({ ...edit, published: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-white/25 bg-black/40"
                    />
                    <span className="text-sm text-parchment/80">
                      {t("published")}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-full bg-goldleaf px-6 py-2 text-sm font-semibold text-ink hover:bg-parchment"
                    >
                      {t("save")}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/20 px-6 py-2 text-sm text-parchment hover:border-goldleaf"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
