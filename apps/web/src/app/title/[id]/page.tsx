"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, formatDuration, formatPrice } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";
import { TitleCard } from "@/components/TitleCard";
import { useAuth } from "@/lib/auth";

type Detail = CatalogTitle & { similar: CatalogTitle[] };

export default function TitlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { me } = useAuth();
  const [title, setTitle] = useState<Detail | null>(null);
  const [inList, setInList] = useState(false);

  useEffect(() => {
    void api<Detail>(`/v1/titles/${id}`).then(setTitle);
    if (me) {
      void api<CatalogTitle[]>("/v1/watchlist").then((list) =>
        setInList(list.some((t) => t.id === id)),
      );
    }
  }, [id, me]);

  if (!title) return <p className="p-6 text-muted">Уншиж байна…</p>;

  const play = () => {
    if (!me) {
      router.push("/login");
      return;
    }
    if (title.featureVideoId) router.push(`/watch/${title.featureVideoId}`);
  };

  const toggleList = async () => {
    if (!me) {
      router.push("/login");
      return;
    }
    if (inList) {
      await api("/v1/watchlist", { method: "DELETE", body: JSON.stringify({ titleId: title.id }) });
      setInList(false);
    } else {
      await api("/v1/watchlist", { method: "POST", body: JSON.stringify({ titleId: title.id }) });
      setInList(true);
    }
  };

  const buy = async () => {
    if (!me) {
      router.push("/login");
      return;
    }
    if (title.accessType === "PPV") {
      router.push(`/subscribe?titleId=${title.id}`);
    } else {
      router.push("/subscribe");
    }
  };

  return (
    <main className="pb-28">
      <div className="relative h-64">
        <img src={title.heroUrl} alt="" className="h-full w-full object-cover" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/50"
        >
          ✕
        </button>
        <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs">шинэ</span>
      </div>
      <div className="space-y-4 px-4 pt-4">
        <h1 className="text-3xl font-bold">{title.title}</h1>
        <p className="text-sm">
          <span className="text-emerald-400">{title.matchPercent}% тохирол</span> · {title.year} ·{" "}
          {formatDuration(title.durationSec)} · {title.ageRating}
        </p>
        <div className="flex gap-2">
          <button onClick={play} className="rounded-xl bg-white px-4 py-2.5 font-semibold text-black">
            ▶ Тоглуулах
          </button>
          <button onClick={() => void toggleList()} className="rounded-xl bg-elevated px-4 py-2.5">
            {inList ? "Жагсаалтад байгаа" : "Жагсаалтад нэмэх"}
          </button>
        </div>
        <p className="text-sm text-white/80">{title.synopsis}</p>
        <div className="flex flex-wrap gap-2">
          {title.genres.map((g) => (
            <span key={g} className="rounded-full bg-elevated px-3 py-1 text-xs">
              {g}
            </span>
          ))}
        </div>
        {title.accessType !== "FREE" && (
          <button onClick={() => void buy()} className="w-full rounded-2xl bg-accent py-3 font-semibold">
            {title.accessType === "PPV"
              ? `${formatPrice(title.ppvPriceMnt)}-р авах`
              : "Premium идэвхжүүлэх"}
          </button>
        )}
        <section>
          <h3 className="mb-3 font-semibold">Төстэй бүтээл</h3>
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            {title.similar.map((item) => (
              <TitleCard key={item.id} title={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
