"use client";

import { useRef, useState } from "react";
import { KIND_LABEL, MUX_LABEL, muxTone, startVideoUpload, type AdminVideo, type VideoKind } from "@/lib/admin";
import { AccentButton, Badge, GhostButton } from "./ui";

export function VideoActions({
  video,
  onChanged,
}: {
  video: AdminVideo;
  onChanged: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async (file?: File | null) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await startVideoUpload(video.id, file);
      setMsg(res.mock ? "Mock upload бэлэн боллоо" : "Mux руу илгээлээ");
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${muxTone(video.muxStatus)}`}>
        {MUX_LABEL[video.muxStatus]}
      </span>
      <input
        ref={input}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void run(file);
        }}
      />
      <GhostButton disabled={busy} onClick={() => input.current?.click()}>
        Файл сонгох
      </GhostButton>
      <AccentButton disabled={busy} onClick={() => void run()}>
        {busy ? "…" : "Mux upload"}
      </AccentButton>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}

export function VideoKindBadge({ kind }: { kind: VideoKind }) {
  return <Badge tone="violet">{KIND_LABEL[kind]}</Badge>;
}
