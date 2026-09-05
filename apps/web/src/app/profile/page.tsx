"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CatalogTitle } from "@/lib/types";
import { TitleRow } from "@/components/TitleRow";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth";

type HistoryItem = {
  positionSec: number;
  videoId: string;
  title: CatalogTitle;
};

export default function ProfilePage() {
  const { me, loading, logout } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [list, setList] = useState<CatalogTitle[]>([]);
  const [wifi, setWifi] = useState(false);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    if (!me) return;
    void api<HistoryItem[]>("/v1/history").then(setHistory);
    void api<CatalogTitle[]>("/v1/watchlist").then(setList);
  }, [me]);

  if (loading) return <p className="p-6 text-muted">Уншиж байна…</p>;
  if (!me) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Профайл</h1>
        <Link href="/login" className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-black">
          Нэвтрэх
        </Link>
      </main>
    );
  }

  const premium = me.subscription?.status === "ACTIVE";
  const name = me.profiles.find((p) => p.isDefault)?.name ?? "Профайл";

  return (
    <main className="space-y-6 pb-8">
      <section className="px-4">
        <p className="text-xs tracking-[0.2em] text-muted">ПРОФАЙЛ</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2 text-2xl">
            {name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            {premium ? (
              <span className="mt-1 inline-block rounded-full bg-accent px-3 py-0.5 text-xs">Premium</span>
            ) : (
              <Link href="/subscribe" className="text-sm text-accent">
                Premium идэвхжүүлэх
              </Link>
            )}
            <p className="text-xs text-muted">4K Ultra HD · 4 дэлгэц</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            [list.length, "Жагсаалтад"],
            [history.filter((h) => !h.title ? false : true).length, "Үзэж байгаа"],
            [142, "Үзсэн цаг"],
          ].map(([n, l]) => (
            <div key={String(l)} className="rounded-2xl bg-elevated p-3 text-center">
              <p className="text-xl font-bold text-accent">{n}</p>
              <p className="text-[11px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <TitleRow name="Үзсэн түүх" items={history.map((h) => h.title)} href="/" wide />
      <TitleRow name="Миний жагсаалт" items={list} href="/list" />

      <section className="mx-4 space-y-2">
        <h2 className="text-lg font-semibold">Тохиргоо</h2>
        <div className="rounded-2xl bg-elevated">
          <label className="flex items-center justify-between px-4 py-3">
            Зөвхөн Wi-Fi үед татах
            <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            Мэдэгдэл хүлээн авах
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          </label>
        </div>
        {me.role === "ADMIN" && (
          <Link href="/admin" className="block rounded-2xl bg-elevated px-4 py-3">
            Админ самбар
          </Link>
        )}
        <button
          onClick={() => void logout()}
          className="flex w-full items-center justify-between rounded-2xl bg-elevated px-4 py-3"
        >
          Бүртгэлээс гарах
          <span>→</span>
        </button>
      </section>
      <Footer />
    </main>
  );
}
