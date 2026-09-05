"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";
import { TitleCard } from "@/components/TitleCard";

export default function NewPage() {
  const [items, setItems] = useState<CatalogTitle[]>([]);
  useEffect(() => {
    void api<CatalogTitle[]>("/v1/catalog/new").then(setItems);
  }, []);

  return (
    <main className="px-4 pb-28">
      <h1 className="mb-4 text-2xl font-bold">Шинэ</h1>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <TitleCard key={item.id} title={item} fill />
        ))}
      </div>
    </main>
  );
}
