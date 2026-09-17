"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KIND_LABEL, type AdminTitle, type VideoKind } from "@/lib/admin";
import { TitleForm, toUpdatePayload, valuesFromTitle, type TitleFormValues } from "@/components/admin/TitleForm";
import { VideoActions, VideoKindBadge } from "@/components/admin/VideoActions";
import { EmptyState, fieldClass, GhostButton } from "@/components/admin/ui";

export default function EditTitlePage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<AdminTitle | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<VideoKind>("FEATURE");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const list = await api<AdminTitle[]>("/v1/admin/titles");
    const found = list.find((t) => t.id === id) ?? null;
    setTitle(found);
    setMissing(!found);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (values: TitleFormValues) => {
    setBusy(true);
    setError("");
    try {
      await api(`/v1/admin/titles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(toUpdatePayload(values)),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Хадгалж чадсангүй");
    } finally {
      setBusy(false);
    }
  };

  const addVideo = async () => {
    setAdding(true);
    try {
      await api("/v1/admin/videos", {
        method: "POST",
        body: JSON.stringify({ titleId: id, kind }),
      });
      await load();
    } finally {
      setAdding(false);
    }
  };

  if (missing) {
    return <EmptyState title="Title олдсонгүй" hint="Жагсаалт руу буцаж өөр контент сонгоно уу" />;
  }
  if (!title) return <p className="text-sm text-muted">Уншиж байна…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/titles" className="text-sm text-muted hover:text-white">
          ← Контент
        </Link>
        <Link href={`/title/${title.id}`} className="text-sm text-accent">
          Апп дээр харах
        </Link>
      </div>

      <section className="rounded-2xl border border-white/6 bg-elevated/40 p-4 lg:p-6">
        <TitleForm
          key={title.updatedAt ?? title.id}
          initial={valuesFromTitle(title)}
          submitLabel="Хадгалах"
          showPublish
          showGenres={false}
          busy={busy}
          error={error}
          onSubmit={(v) => void save(v)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Видео</h2>
          <div className="flex gap-2">
            <select className={fieldClass} value={kind} onChange={(e) => setKind(e.target.value as VideoKind)}>
              {(Object.keys(KIND_LABEL) as VideoKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
            <GhostButton disabled={adding} onClick={() => void addVideo()}>
              Видео нэмэх
            </GhostButton>
          </div>
        </div>

        {title.videos.length === 0 ? (
          <EmptyState title="Видео алга" hint="FEATURE, Reel эсвэл трейлер нэмээд Mux-д оруулна" />
        ) : (
          <div className="space-y-2">
            {title.videos.map((v) => (
              <article
                key={v.id}
                className="flex flex-col gap-3 rounded-2xl bg-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <VideoKindBadge kind={v.kind} />
                    <span className="text-xs text-muted">{v.id.slice(0, 8)}</span>
                  </div>
                  {v.muxPlaybackId && (
                    <p className="mt-1 text-xs text-muted">playback: {v.muxPlaybackId}</p>
                  )}
                </div>
                <VideoActions video={v} onChanged={() => void load()} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
