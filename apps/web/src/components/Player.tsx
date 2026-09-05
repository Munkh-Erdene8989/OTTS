"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

type Props = {
  playbackId: string;
  tokens?: { playback: string; thumbnail: string; storyboard: string };
  mock?: boolean;
  title: string;
  videoId: string;
  startTime?: number;
};

export function Player({ playbackId, tokens, mock, title, videoId, startTime }: Props) {
  const lastSent = useRef(0);

  useEffect(() => {
    if (mock) return;
    const el = document.querySelector("mux-player") as HTMLMediaElement | null;
    if (!el) return;
    const onTime = () => {
      const now = Date.now();
      if (now - lastSent.current < 8000) return;
      lastSent.current = now;
      void api("/v1/progress", {
        method: "PUT",
        body: JSON.stringify({
          videoId,
          positionSec: Math.floor(el.currentTime || 0),
          durationSec: Math.floor(el.duration || 0),
        }),
      }).catch(() => undefined);
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [mock, videoId]);

  if (mock || playbackId.startsWith("seed_") || playbackId.startsWith("mock_")) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-black text-center">
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-2 text-sm text-muted">
            Mux тохируулаагүй тул жишээ тоглуулагч. Бодит бичлэг upload хийсний дараа энд Mux Player гарна.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-black">
      <MuxPlayer
        playbackId={playbackId}
        tokens={tokens}
        startTime={startTime}
        accentColor="#e23b8c"
        primaryColor="#f0f0f8"
        secondaryColor="#12121c"
        title={title}
        metadata={{ video_id: videoId, video_title: title }}
        style={{ aspectRatio: "16 / 9", width: "100%" }}
      />
    </div>
  );
}
