"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatDate, KIND_LABEL, type AdminVideo, type MuxStatus, type VideoKind } from "@/lib/admin";
import { VideoActions, VideoKindBadge } from "@/components/admin/VideoActions";
import { EmptyState, fieldClass } from "@/components/admin/ui";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[] | null>(null);
  const [kind, setKind] = useState<"ALL" | VideoKind>("ALL");
  const [status, setStatus] = useState<"ALL" | MuxStatus>("ALL");

  const load = useCallback(() => api<AdminVideo[]>("/v1/admin/videos").then(setVideos), []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!videos) return [];
    return videos.filter((v) => {
      if (kind !== "ALL" && v.kind !== kind) return false;
      if (status !== "ALL" && v.muxStatus !== status) return false;
      return true;
    });
  }, [videos, kind, status]);

  if (!videos) return <p className="text-sm text-muted">Уншиж байна…</p>;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">{filtered.length} видео · Mux төлөв, upload</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <select className={fieldClass} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="ALL">Бүх төрөл</option>
          <option value="FEATURE">Бүтэн кино</option>
          <option value="REEL">Reel</option>
          <option value="TRAILER">Трейлер</option>
        </select>
        <select
          className={fieldClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="ALL">Бүх Mux төлөв</option>
          <option value="WAITING">Хүлээж байна</option>
          <option value="PREPARING">Боловсруулж байна</option>
          <option value="READY">Бэлэн</option>
          <option value="ERRORED">Алдаа</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Видео алга" hint="Title дээр видео нэмээд эндээс upload хийнэ" />
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <article
              key={v.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/6 bg-elevated p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/titles/${v.titleId}`} className="font-medium hover:underline">
                    {v.title?.title ?? "Title"}
                  </Link>
                  <VideoKindBadge kind={v.kind} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {KIND_LABEL[v.kind]} · {formatDate(v.createdAt)}
                  {v.durationSec ? ` · ${Math.round(v.durationSec / 60)}м` : ""}
                </p>
              </div>
              <VideoActions video={v} onChanged={() => void load()} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
