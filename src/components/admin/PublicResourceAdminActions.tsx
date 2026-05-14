"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { readApiError } from "@/lib/read-api-error";

type Kind = "artwork" | "news";

export function PublicResourceAdminActions({
  locale,
  kind,
  id,
  className = "",
}: {
  locale: string;
  kind: Kind;
  id: string;
  className?: string;
}) {
  const t = useTranslations("publicAdmin");
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const base = `/${locale}`;
  const editHref =
    kind === "artwork"
      ? `${base}/admin/artworks?edit=${encodeURIComponent(id)}`
      : `${base}/admin/news?edit=${encodeURIComponent(id)}`;

  const confirmMsg =
    kind === "artwork"
      ? t("confirmDeleteArtwork")
      : t("confirmDeleteNews");

  async function onDelete() {
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setErr(null);
    const url =
      kind === "artwork" ? `/api/artworks/${id}` : `/api/news/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setBusy(false);
    if (!res.ok) {
      setErr(`${t("deleteFailed")}: ${await readApiError(res)}`);
      return;
    }
    const onArtworkDetail = /^\/(en|tr)\/gallery\/[^/]+$/.test(pathname);
    const onPressDetail = /^\/(en|tr)\/press\/[^/]+$/.test(pathname);
    if (kind === "artwork" && onArtworkDetail) {
      router.push(`${base}/gallery`);
      return;
    }
    if (kind === "news" && onPressDetail) {
      router.push(`${base}/press`);
      return;
    }
    router.refresh();
  }

  return (
    <div className={`text-xs ${className}`}>
      {err ? (
        <p className="mb-2 text-oxide" role="alert">
          {err}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <NextLink
          href={editHref}
          prefetch={false}
          className="rounded-full border border-umber-deep/20 bg-white/90 px-2.5 py-1 font-medium text-umber-deep hover:border-oxide hover:text-oxide"
        >
          {kind === "artwork" ? t("editArtwork") : t("editNews")}
        </NextLink>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete()}
          className="rounded-full border border-oxide/35 bg-transparent px-2.5 py-1 font-medium text-oxide hover:bg-oxide/10 disabled:opacity-50"
        >
          {kind === "artwork" ? t("deleteArtwork") : t("deleteNews")}
        </button>
      </div>
    </div>
  );
}
