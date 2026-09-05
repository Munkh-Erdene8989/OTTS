"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";

type Reel = CatalogTitle & { videoId: string };

export default function ReelsPage() {
  const [items, setItems] = useState<Reel[]>([]);
  const router = useRouter();

  useEffect(() => {
    void api<Reel[]>("/v1/catalog/reels").then(setItems);
  }, []);

  return (
    <main className="space-y-4 px-4 pb-28">
      <h1 className="text-2xl font-bold">Reels</h1>
      {items.map((item) => (
        <article key={item.videoId} className="overflow-hidden rounded-3xl bg-elevated">
          <div className="relative h-80">
            <img src={item.heroUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => router.push(`/watch/${item.videoId}`)}
              className="absolute inset-0 grid place-items-center bg-black/20 text-5xl"
            >
              ▶
            </button>
          </div>
          <div className="p-4">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted">{item.synopsis}</p>
          </div>
        </article>
      ))}
    </main>
  );
}
