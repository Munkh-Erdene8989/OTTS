"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, formatPrice } from "@/lib/api";
import { Player } from "@/components/Player";
import { useAuth } from "@/lib/auth";

type Playback = {
  videoId: string;
  titleId: string;
  title: string;
  playbackId: string;
  tokens?: { playback: string; thumbnail: string; storyboard: string };
  mock?: boolean;
};

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { me, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Playback | null>(null);
  const [paywall, setPaywall] = useState<{ accessType?: string; ppvPriceMnt?: number } | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.push("/login");
      return;
    }
    void api<Playback>(`/v1/videos/${videoId}/playback`)
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 402) {
          const body = e.body as { accessType?: string; ppvPriceMnt?: number };
          setPaywall(body);
        } else {
          setError(e instanceof Error ? e.message : "Алдаа");
        }
      });
  }, [videoId, me, loading, router]);

  return (
    <main className="min-h-dvh bg-black">
      <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1">
        ← Буцах
      </button>
      {data && (
        <Player
          playbackId={data.playbackId}
          tokens={data.tokens}
          mock={data.mock}
          title={data.title}
          videoId={data.videoId}
        />
      )}
      {paywall && (
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold">Төлбөртэй контент</h1>
          <p className="mt-2 text-muted">Үзэхийн тулд Premium эсвэл энэ бүтээлийг худалдана уу.</p>
          <button
            onClick={() =>
              router.push(
                paywall.accessType === "PPV" && data === null
                  ? "/subscribe"
                  : "/subscribe",
              )
            }
            className="mt-6 rounded-2xl bg-accent px-6 py-3 font-semibold"
          >
            {paywall.accessType === "PPV" && paywall.ppvPriceMnt
              ? `${formatPrice(paywall.ppvPriceMnt)}-р авах`
              : "Premium авах"}
          </button>
        </div>
      )}
      {error && <p className="p-6 text-red-400">{error}</p>}
    </main>
  );
}
