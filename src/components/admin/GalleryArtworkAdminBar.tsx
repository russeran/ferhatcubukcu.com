"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { readApiError } from "@/lib/read-api-error";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  id: string;
  initialFavorite: boolean;
  favoriteLabel: string;
  className?: string;
};

export function GalleryArtworkAdminBar({
  locale,
  id,
  initialFavorite,
  favoriteLabel,
  className = "",
}: Props) {
  const t = useTranslations("publicAdmin");
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite, id]);
  const [busyFavorite, setBusyFavorite] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const editHref = `/${locale}/admin/artworks?edit=${encodeURIComponent(id)}`;

  async function onFavoriteChange(next: boolean) {
    setFavorite(next);
    setBusyFavorite(true);
    setErr(null);
    const res = await fetch(`/api/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ favorite: next }),
    });
    setBusyFavorite(false);
    if (!res.ok) {
      setFavorite(!next);
      setErr(`${t("favoriteFailed")}: ${await readApiError(res)}`);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm(t("confirmDeleteArtwork"))) return;
    setBusyDelete(true);
    setErr(null);
    const res = await fetch(`/api/artworks/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setBusyDelete(false);
    if (!res.ok) {
      setErr(`${t("deleteFailed")}: ${await readApiError(res)}`);
      return;
    }
    router.refresh();
  }

  const busy = busyFavorite || busyDelete;

  return (
    <div
      className={cn(
        "rounded-md border border-goldleaf/40 bg-gradient-to-br from-parchment/12 via-parchment/6 to-transparent p-3 ring-1 ring-goldleaf/25",
        className
      )}
    >
      {err ? (
        <p
          className="accent-panel mb-2 px-2 py-1.5 text-xs text-oxide-deep"
          role="alert"
        >
          {err}
        </p>
      ) : null}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-sm border border-white/12 bg-anthracite-light/35 p-2.5 transition",
          favorite && "border-goldleaf/50 bg-goldleaf/10",
          busyFavorite && "pointer-events-none opacity-70"
        )}
      >
        <input
          type="checkbox"
          checked={favorite}
          disabled={busy}
          onChange={(e) => void onFavoriteChange(e.target.checked)}
          className="admin-checkbox mt-0.5 h-5 w-5 shrink-0"
        />
        <span className="min-w-0 select-none">
          <span className="block text-sm font-semibold text-parchment">
            {favoriteLabel}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">
            {t("favoriteHint")}
          </span>
        </span>
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2 text-xs">
        <NextLink
          href={editHref}
          prefetch={false}
          className="btn-admin-edit px-2.5 py-1 normal-case tracking-normal"
        >
          {t("editArtwork")}
        </NextLink>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete()}
          className="btn-admin-delete px-2.5 py-1 normal-case tracking-normal"
        >
          {t("deleteArtwork")}
        </button>
      </div>
    </div>
  );
}
