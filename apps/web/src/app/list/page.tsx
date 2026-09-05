"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";
import { TitleCard } from "@/components/TitleCard";
import { useAuth } from "@/lib/auth";

export default function ListPage() {
  const { me, loading } = useAuth();
  const [items, setItems] = useState<CatalogTitle[]>([]);

  useEffect(() => {
    if (!me) return;
    void api<CatalogTitle[]>("/v1/watchlist").then(setItems);
  }, [me]);

  if (loading) return <p className="p-6 text-muted">Уншиж байна…</p>;
  if (!me) {
    return (
      <main className="p-6">
        <p>Жагсаалтаа харахын тулд нэвтэрнэ үү.</p>
        <Link href="/login" className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-black">
          Нэвтрэх
        </Link>
      </main>
    );
  }

  return (
    <main className="px-4 pb-28">
      <h1 className="mb-4 text-2xl font-bold">Жагсаалт</h1>
      {items.length === 0 ? (
        <p className="text-muted">Жагсаалт хоосон байна.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <TitleCard key={item.id} title={item} fill />
          ))}
        </div>
      )}
    </main>
  );
}
