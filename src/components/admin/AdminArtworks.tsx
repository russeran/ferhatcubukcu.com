"use client";

import type { Artwork } from "@/lib/types";
import { readApiError } from "@/lib/read-api-error";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const fetchOpts: RequestInit = { credentials: "same-origin" };

const MAX_DETAIL_IMAGES = 24;

const emptyForm = {
  titleEn: "",
  titleTr: "",
  descriptionEn: "",
  descriptionTr: "",
  image: "/gallery-placeholder.svg",
  detailImages: [] as string[],
  year: "",
  mediumEn: "",
  mediumTr: "",
  dimensions: "",
  priceEn: "",
  priceTr: "",
  exhibitionEn: "",
  exhibitionTr: "",
  seriesSlug: "",
  seriesTitleEn: "",
  seriesTitleTr: "",
  published: true,
  sold: false,
  slug: "",
};

export function AdminArtworks() {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const deepLinkApplied = useRef<string | null>(null);
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [create, setCreate] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [detailUploadProgress, setDetailUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
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

  async function uploadMain(file: File, mode: "create" | "edit") {
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

  async function uploadDetails(
    fileList: FileList | null,
    mode: "create" | "edit"
  ) {
    if (!fileList?.length) return;

    const existing =
      mode === "create" ? create.detailImages.length : edit.detailImages.length;
    const room = MAX_DETAIL_IMAGES - existing;
    if (room <= 0) {
      setError(t("detailImagesMax"));
      return;
    }

    const files = Array.from(fileList).slice(0, room);
    setUploading(true);
    setDetailUploadProgress({ current: 0, total: files.length });
    setError(null);

    const uploaded: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setDetailUploadProgress({ current: i + 1, total: files.length });
        const url = await uploadOne(files[i]);
        if (url) uploaded.push(url);
      }
      if (uploaded.length === 0) return;

      const merge = (prev: string[]) => [...prev, ...uploaded];

      if (mode === "create") {
        setCreate((c) => ({ ...c, detailImages: merge(c.detailImages) }));
      } else {
        setEdit((c) => ({ ...c, detailImages: merge(c.detailImages) }));
      }
    } finally {
      setUploading(false);
      setDetailUploadProgress(null);
    }
  }

  function removeDetail(idx: number, mode: "create" | "edit") {
    if (mode === "create") {
      setCreate((c) => ({
        ...c,
        detailImages: c.detailImages.filter((_, i) => i !== idx),
      }));
    } else {
      setEdit((c) => ({
        ...c,
        detailImages: c.detailImages.filter((_, i) => i !== idx),
      }));
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
        detailImages:
          create.detailImages.length > 0 ? create.detailImages : undefined,
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
      detailImages: [...(a.detailImages ?? [])],
      year: a.year ?? "",
      mediumEn: a.mediumEn ?? "",
      mediumTr: a.mediumTr ?? "",
      dimensions: a.dimensions ?? "",
      priceEn: a.priceEn ?? "",
      priceTr: a.priceTr ?? "",
      exhibitionEn: a.exhibitionEn ?? "",
      exhibitionTr: a.exhibitionTr ?? "",
      seriesSlug: a.seriesSlug ?? "",
      seriesTitleEn: a.seriesTitleEn ?? "",
      seriesTitleTr: a.seriesTitleTr ?? "",
      published: a.published,
      sold: Boolean(a.sold),
      slug: a.slug,
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
        .getElementById(`admin-artwork-${editQuery}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
    return () => window.clearTimeout(tid);
  }, [editQuery, loading, items]);

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
        detailImages: edit.detailImages,
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
    return <p className="text-ink-muted">…</p>;
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

      <section id="admin-add-artwork" className="admin-panel">
        <h2 className="admin-section-title">{t("addArtwork")}</h2>
        <form onSubmit={addArtwork} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="admin-label block">
              {t("mainImage")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="admin-file-input"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadMain(f, "create");
                e.target.value = "";
              }}
            />
            {uploading ? (
              <span className="mt-1 block text-xs text-ink-faint">
                Uploading…
              </span>
            ) : null}
          </label>
          <div className="md:col-span-2 space-y-3 admin-panel">
            <span className="admin-label block">
              {t("detailImages")}
            </span>
            <p className="text-xs text-ink-faint">{t("detailImagesHint")}</p>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="admin-file-input disabled:opacity-50"
              onChange={(e) => {
                void uploadDetails(e.target.files, "create");
                e.target.value = "";
              }}
            />
            {detailUploadProgress ? (
              <p className="text-xs text-ink-faint" role="status">
                {t("detailImagesUploading", {
                  current: detailUploadProgress.current,
                  total: detailUploadProgress.total,
                })}
              </p>
            ) : null}
            {create.detailImages.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {create.detailImages.map((src, idx) => (
                  <li
                    key={`${src}-${idx}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-white/15"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <button
                      type="button"
                      className="btn-admin-delete absolute right-0 top-0 px-1.5 py-0.5 text-[10px] leading-none normal-case tracking-normal"
                      onClick={() => removeDetail(idx, "create")}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-xs text-ink-faint">
              {create.detailImages.length} / {MAX_DETAIL_IMAGES}
            </p>
          </div>
          <label className="space-y-1">
            <span className="admin-field-label">{t("titleEn")}</span>
            <input
              className="admin-input"
              value={create.titleEn}
              onChange={(e) =>
                setCreate({ ...create, titleEn: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1">
            <span className="admin-field-label">{t("titleTr")}</span>
            <input
              className="admin-input"
              value={create.titleTr}
              onChange={(e) =>
                setCreate({ ...create, titleTr: e.target.value })
              }
              required
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="admin-field-label">{t("slug")}</span>
            <input
              className="admin-input"
              value={create.slug}
              onChange={(e) =>
                setCreate({ ...create, slug: e.target.value })
              }
              placeholder="auto from title if empty"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="admin-field-label">
              {t("descriptionEn")}
            </span>
            <textarea
              className="admin-textarea-sm"
              value={create.descriptionEn}
              onChange={(e) =>
                setCreate({ ...create, descriptionEn: e.target.value })
              }
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="admin-field-label">
              {t("descriptionTr")}
            </span>
            <textarea
              className="admin-textarea-sm"
              value={create.descriptionTr}
              onChange={(e) =>
                setCreate({ ...create, descriptionTr: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="admin-field-label">Year</span>
            <input
              className="admin-input"
              value={create.year}
              onChange={(e) =>
                setCreate({ ...create, year: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="admin-field-label">Dimensions</span>
            <input
              className="admin-input"
              value={create.dimensions}
              onChange={(e) =>
                setCreate({ ...create, dimensions: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="admin-field-label">Medium EN</span>
            <input
              className="admin-input"
              value={create.mediumEn}
              onChange={(e) =>
                setCreate({ ...create, mediumEn: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="admin-field-label">Medium TR</span>
            <input
              className="admin-input"
              value={create.mediumTr}
              onChange={(e) =>
                setCreate({ ...create, mediumTr: e.target.value })
              }
            />
          </label>
          <div className="md:col-span-2 space-y-3 admin-panel">
            <span className="admin-label block">
              {t("seriesSection")}
            </span>
            <p className="text-xs text-ink-faint">{t("seriesHint")}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="admin-field-label">
                  {t("seriesSlug")}
                </span>
                <input
                  className="admin-input"
                  value={create.seriesSlug}
                  onChange={(e) =>
                    setCreate({ ...create, seriesSlug: e.target.value })
                  }
                  maxLength={80}
                />
              </label>
              <label className="space-y-1">
                <span className="admin-field-label">
                  {t("seriesTitleEn")}
                </span>
                <input
                  className="admin-input"
                  value={create.seriesTitleEn}
                  onChange={(e) =>
                    setCreate({ ...create, seriesTitleEn: e.target.value })
                  }
                  maxLength={120}
                />
              </label>
              <label className="space-y-1">
                <span className="admin-field-label">
                  {t("seriesTitleTr")}
                </span>
                <input
                  className="admin-input"
                  value={create.seriesTitleTr}
                  onChange={(e) =>
                    setCreate({ ...create, seriesTitleTr: e.target.value })
                  }
                  maxLength={120}
                />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3 admin-panel">
            <span className="admin-label block">
              {t("priceSection")}
            </span>
            <p className="text-xs text-ink-faint">{t("priceHint")}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="admin-field-label">{t("priceEn")}</span>
                <input
                  className="admin-input"
                  value={create.priceEn}
                  onChange={(e) =>
                    setCreate({ ...create, priceEn: e.target.value })
                  }
                  maxLength={160}
                />
              </label>
              <label className="space-y-1">
                <span className="admin-field-label">{t("priceTr")}</span>
                <input
                  className="admin-input"
                  value={create.priceTr}
                  onChange={(e) =>
                    setCreate({ ...create, priceTr: e.target.value })
                  }
                  maxLength={160}
                />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3 admin-panel">
            <span className="admin-label block">
              {t("exhibitionSection")}
            </span>
            <p className="text-xs text-ink-faint">{t("exhibitionHint")}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="admin-field-label">
                  {t("exhibitionEn")}
                </span>
                <input
                  className="admin-input"
                  value={create.exhibitionEn}
                  onChange={(e) =>
                    setCreate({ ...create, exhibitionEn: e.target.value })
                  }
                  maxLength={240}
                />
              </label>
              <label className="space-y-1">
                <span className="admin-field-label">
                  {t("exhibitionTr")}
                </span>
                <input
                  className="admin-input"
                  value={create.exhibitionTr}
                  onChange={(e) =>
                    setCreate({ ...create, exhibitionTr: e.target.value })
                  }
                  maxLength={240}
                />
              </label>
            </div>
          </div>
          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={create.sold}
              onChange={(e) =>
                setCreate({ ...create, sold: e.target.checked })
              }
              className="admin-checkbox"
            />
            <span className="text-sm text-ink-muted">{t("markSold")}</span>
          </label>
          <p className="-mt-1 text-xs text-ink-faint md:col-span-2">
            {t("soldHint")}
          </p>
          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={create.published}
              onChange={(e) =>
                setCreate({ ...create, published: e.target.checked })
              }
              className="admin-checkbox"
            />
            <span className="text-sm text-ink-muted">{t("published")}</span>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="btn-admin-primary"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="admin-section-title">{t("artworks")}</h2>
        <ul className="space-y-6">
          {items.map((a) => (
            <li
              key={a.id}
              id={`admin-artwork-${a.id}`}
              className="admin-list-item"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="admin-thumb h-40 w-full shrink-0 md:h-36 md:w-28">
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  {a.sold ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink">
                      {t("statusSold")}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="page-card-title">
                    {a.titleEn} / {a.titleTr}
                  </p>
                  <p className="text-xs text-ink-faint">
                    /gallery/{a.slug} · order {a.order}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn-admin-edit"
                      onClick={() => startEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-admin-delete"
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
                    <span className="admin-label block">
                      {t("mainImage")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="admin-file-input"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadMain(f, "edit");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="md:col-span-2 space-y-3 admin-panel">
                    <span className="admin-label block">
                      {t("detailImages")}
                    </span>
                    <p className="text-xs text-ink-faint">
                      {t("detailImagesHint")}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      className="admin-file-input disabled:opacity-50"
                      onChange={(e) => {
                        void uploadDetails(e.target.files, "edit");
                        e.target.value = "";
                      }}
                    />
                    {detailUploadProgress ? (
                      <p className="text-xs text-ink-faint" role="status">
                        {t("detailImagesUploading", {
                          current: detailUploadProgress.current,
                          total: detailUploadProgress.total,
                        })}
                      </p>
                    ) : null}
                    {edit.detailImages.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {edit.detailImages.map((src, idx) => (
                          <li
                            key={`${src}-${idx}`}
                            className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-white/15"
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                            <button
                              type="button"
                              className="btn-admin-delete absolute right-0 top-0 px-1.5 py-0.5 text-[10px] leading-none normal-case tracking-normal"
                              onClick={() => removeDetail(idx, "edit")}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="text-xs text-ink-faint">
                      {edit.detailImages.length} / {MAX_DETAIL_IMAGES}
                    </p>
                  </div>
                  <label className="space-y-1">
                    <span className="admin-field-label">
                      {t("titleEn")}
                    </span>
                    <input
                      className="admin-input"
                      value={edit.titleEn}
                      onChange={(e) =>
                        setEdit({ ...edit, titleEn: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-field-label">
                      {t("titleTr")}
                    </span>
                    <input
                      className="admin-input"
                      value={edit.titleTr}
                      onChange={(e) =>
                        setEdit({ ...edit, titleTr: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="admin-field-label">{t("slug")}</span>
                    <input
                      className="admin-input"
                      value={edit.slug}
                      onChange={(e) =>
                        setEdit({ ...edit, slug: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="admin-field-label">
                      {t("descriptionEn")}
                    </span>
                    <textarea
                      className="admin-textarea-sm"
                      value={edit.descriptionEn}
                      onChange={(e) =>
                        setEdit({ ...edit, descriptionEn: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="admin-field-label">
                      {t("descriptionTr")}
                    </span>
                    <textarea
                      className="admin-textarea-sm"
                      value={edit.descriptionTr}
                      onChange={(e) =>
                        setEdit({ ...edit, descriptionTr: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-field-label">Year</span>
                    <input
                      className="admin-input"
                      value={edit.year}
                      onChange={(e) =>
                        setEdit({ ...edit, year: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-field-label">Order</span>
                    <input
                      type="number"
                      className="admin-input"
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
                    <span className="admin-field-label">Dimensions</span>
                    <input
                      className="admin-input"
                      value={edit.dimensions}
                      onChange={(e) =>
                        setEdit({ ...edit, dimensions: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-field-label">Medium EN</span>
                    <input
                      className="admin-input"
                      value={edit.mediumEn}
                      onChange={(e) =>
                        setEdit({ ...edit, mediumEn: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-field-label">Medium TR</span>
                    <input
                      className="admin-input"
                      value={edit.mediumTr}
                      onChange={(e) =>
                        setEdit({ ...edit, mediumTr: e.target.value })
                      }
                    />
                  </label>
                  <div className="md:col-span-2 space-y-3 admin-panel">
                    <span className="admin-label block">
                      {t("seriesSection")}
                    </span>
                    <p className="text-xs text-ink-faint">{t("seriesHint")}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1 md:col-span-2">
                        <span className="admin-field-label">
                          {t("seriesSlug")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.seriesSlug}
                          onChange={(e) =>
                            setEdit({ ...edit, seriesSlug: e.target.value })
                          }
                          maxLength={80}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("seriesTitleEn")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.seriesTitleEn}
                          onChange={(e) =>
                            setEdit({ ...edit, seriesTitleEn: e.target.value })
                          }
                          maxLength={120}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("seriesTitleTr")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.seriesTitleTr}
                          onChange={(e) =>
                            setEdit({ ...edit, seriesTitleTr: e.target.value })
                          }
                          maxLength={120}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3 admin-panel">
                    <span className="admin-label block">
                      {t("priceSection")}
                    </span>
                    <p className="text-xs text-ink-faint">{t("priceHint")}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("priceEn")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.priceEn}
                          onChange={(e) =>
                            setEdit({ ...edit, priceEn: e.target.value })
                          }
                          maxLength={160}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("priceTr")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.priceTr}
                          onChange={(e) =>
                            setEdit({ ...edit, priceTr: e.target.value })
                          }
                          maxLength={160}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3 admin-panel">
                    <span className="admin-label block">
                      {t("exhibitionSection")}
                    </span>
                    <p className="text-xs text-ink-faint">{t("exhibitionHint")}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("exhibitionEn")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.exhibitionEn}
                          onChange={(e) =>
                            setEdit({ ...edit, exhibitionEn: e.target.value })
                          }
                          maxLength={240}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="admin-field-label">
                          {t("exhibitionTr")}
                        </span>
                        <input
                          className="admin-input"
                          value={edit.exhibitionTr}
                          onChange={(e) =>
                            setEdit({ ...edit, exhibitionTr: e.target.value })
                          }
                          maxLength={240}
                        />
                      </label>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={edit.sold}
                      onChange={(e) =>
                        setEdit({ ...edit, sold: e.target.checked })
                      }
                      className="admin-checkbox"
                    />
                    <span className="text-sm text-ink-muted">
                      {t("markSold")}
                    </span>
                  </label>
                  <p className="-mt-1 text-xs text-ink-faint md:col-span-2">
                    {t("soldHint")}
                  </p>
                  <label className="flex items-center gap-3 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={edit.published}
                      onChange={(e) =>
                        setEdit({ ...edit, published: e.target.checked })
                      }
                      className="admin-checkbox"
                    />
                    <span className="text-sm text-ink-muted">
                      {t("published")}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button
                      type="submit"
                      className="btn-admin-primary"
                    >
                      {t("save")}
                    </button>
                    <button
                      type="button"
                      className="btn-admin-secondary"
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
