"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";
import { TitleCard } from "@/components/TitleCard";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CatalogTitle[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) {
        setItems([]);
        return;
      }
      void api<CatalogTitle[]>(`/v1/catalog/search?q=${encodeURIComponent(q)}`).then(setItems);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <main className="px-4 pb-28">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Хайх..."
        className="mb-4 w-full rounded-2xl border border-white/10 bg-elevated px-4 py-3 outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <TitleCard key={item.id} title={item} fill />
        ))}
      </div>
    </main>
  );
}
