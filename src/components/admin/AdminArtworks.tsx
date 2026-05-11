"use client";

import type { Artwork } from "@/lib/types";
import { readApiError } from "@/lib/read-api-error";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const fetchOpts: RequestInit = { credentials: "same-origin" };

const emptyForm = {
  titleEn: "",
  titleTr: "",
  descriptionEn: "",
  descriptionTr: "",
  image: "/gallery-placeholder.svg",
  year: "",
  mediumEn: "",
  mediumTr: "",
  dimensions: "",
  published: true,
  slug: "",
};

export function AdminArtworks() {
  const t = useTranslations("admin");
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [create, setCreate] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/artworks?admin=1", fetchOpts);
    if (!res.ok) {
      setError(`${t("loadFailed")}: ${await readApiError(res)}`);
      setItems([]);
      return;
    }
    const data = (await res.json()) as Artwork[];
    setItems(data);
  }, [t]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function uploadFile(file: File, target: "create" | "edit") {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      if (!res.ok) {
        setError(`${t("uploadFailed")}: ${await readApiError(res)}`);
        return;
      }
      const data = (await res.json()) as { url?: string };
      const url = data.url;
      if (!url) {
        setError(t("uploadFailed"));
        return;
      }
      if (target === "create") {
        setCreate((c) => ({ ...c, image: url }));
      } else {
        setEdit((c) => ({ ...c, image: url }));
      }
    } finally {
      setUploading(false);
    }
  }

  async function addArtwork(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        ...create,
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

  function startEdit(a: Artwork) {
    setEditingId(a.id);
    setError(null);
    setEdit({
      titleEn: a.titleEn,
      titleTr: a.titleTr,
      descriptionEn: a.descriptionEn,
      descriptionTr: a.descriptionTr,
      image: a.image,
      year: a.year ?? "",
      mediumEn: a.mediumEn ?? "",
      mediumTr: a.mediumTr ?? "",
      dimensions: a.dimensions ?? "",
      published: a.published,
      slug: a.slug,
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    const order = items.find((x) => x.id === editingId)?.order ?? 0;
    const res = await fetch(`/api/artworks/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        ...edit,
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
    if (!confirm("Delete this artwork?")) return;
    setError(null);
    const res = await fetch(`/api/artworks/${id}`, {
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
          className="rounded-lg border border-oxide/50 bg-oxide/10 px-4 py-3 text-sm text-oxide"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-white/10 bg-black/20 p-6">
        <h2 className="font-serif text-xl text-goldleaf">{t("addArtwork")}</h2>
        <form onSubmit={addArtwork} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-wider text-parchment/45">
              {t("uploadImage")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-parchment/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, "create");
              }}
            />
            {uploading ? (
              <span className="mt-1 block text-xs text-parchment/50">
                Uploading…
              </span>
            ) : null}
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
              {t("descriptionEn")}
            </span>
            <textarea
              className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.descriptionEn}
              onChange={(e) =>
                setCreate({ ...create, descriptionEn: e.target.value })
              }
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-parchment/55">
              {t("descriptionTr")}
            </span>
            <textarea
              className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.descriptionTr}
              onChange={(e) =>
                setCreate({ ...create, descriptionTr: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">Year</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.year}
              onChange={(e) =>
                setCreate({ ...create, year: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">Dimensions</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.dimensions}
              onChange={(e) =>
                setCreate({ ...create, dimensions: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">Medium EN</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.mediumEn}
              onChange={(e) =>
                setCreate({ ...create, mediumEn: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-parchment/55">Medium TR</span>
            <input
              className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
              value={create.mediumTr}
              onChange={(e) =>
                setCreate({ ...create, mediumTr: e.target.value })
              }
            />
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
              className="rounded-full bg-goldleaf px-6 py-2 text-sm font-semibold text-umber-deep hover:bg-parchment"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl text-parchment">{t("artworks")}</h2>
        <ul className="space-y-6">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-white/10 bg-black/15 p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md bg-black/40 md:h-36 md:w-28">
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-serif text-lg text-parchment">
                    {a.titleEn} / {a.titleTr}
                  </p>
                  <p className="text-xs text-parchment/45">
                    /gallery/{a.slug} · order {a.order}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-wider text-parchment hover:border-goldleaf hover:text-goldleaf"
                      onClick={() => startEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-oxide/40 px-4 py-1.5 text-xs uppercase tracking-wider text-oxide hover:bg-oxide/15"
                      onClick={() => remove(a.id)}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>

              {editingId === a.id ? (
                <form
                  onSubmit={saveEdit}
                  className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2"
                >
                  <label className="md:col-span-2">
                    <span className="text-xs uppercase tracking-wider text-parchment/45">
                      {t("uploadImage")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-parchment/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, "edit");
                      }}
                    />
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
                      {t("descriptionEn")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.descriptionEn}
                      onChange={(e) =>
                        setEdit({ ...edit, descriptionEn: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-parchment/55">
                      {t("descriptionTr")}
                    </span>
                    <textarea
                      className="focus-ring min-h-[72px] w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.descriptionTr}
                      onChange={(e) =>
                        setEdit({ ...edit, descriptionTr: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">Year</span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.year}
                      onChange={(e) =>
                        setEdit({ ...edit, year: e.target.value })
                      }
                    />
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
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">Dimensions</span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.dimensions}
                      onChange={(e) =>
                        setEdit({ ...edit, dimensions: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">Medium EN</span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.mediumEn}
                      onChange={(e) =>
                        setEdit({ ...edit, mediumEn: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-parchment/55">Medium TR</span>
                    <input
                      className="focus-ring w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-parchment"
                      value={edit.mediumTr}
                      onChange={(e) =>
                        setEdit({ ...edit, mediumTr: e.target.value })
                      }
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
                      className="rounded-full bg-goldleaf px-6 py-2 text-sm font-semibold text-umber-deep hover:bg-parchment"
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
