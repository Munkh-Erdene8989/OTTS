"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogTitle } from "@/lib/types";
import { formatDuration } from "@/lib/api";

export function Hero({ items }: { items: CatalogTitle[] }) {
  const [i, setI] = useState(0);
  const router = useRouter();
  const current = items[i];
  if (!current) return null;

  return (
    <section className="relative mx-4 overflow-hidden rounded-3xl min-h-[420px]">
      <img src={current.heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-black/20" />
      <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-5">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent">
          <span className="h-3 w-1 rounded-full bg-accent" />
          онцлох
        </p>
        <h1 className="text-3xl font-bold leading-tight">{current.title}</h1>
        <p className="mt-2 text-sm text-white/80">
          <span className="text-emerald-400">{current.matchPercent}% тохирол</span>
          {" · "}
          {current.year}
          {" · "}
          {formatDuration(current.durationSec)}
          {" · "}
          <span className="rounded border border-white/30 px-1.5 py-0.5 text-[11px]">
            {current.ageRating}
          </span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-white/70">{current.synopsis}</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() =>
              current.featureVideoId
                ? router.push(`/watch/${current.featureVideoId}`)
                : router.push(`/title/${current.id}`)
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            ▶ Тоглуулах
          </button>
          <button
            onClick={() => router.push(`/title/${current.id}`)}
            className="rounded-xl border border-white/30 px-4 py-2.5 text-sm"
          >
            ⓘ Дэлгэрэнгүй
          </button>
        </div>
        <div className="mt-5 flex gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full ${idx === i ? "w-6 bg-accent" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
