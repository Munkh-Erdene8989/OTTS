"use client";

import Link from "next/link";

export function PremiumBanner() {
  return (
    <section className="mx-4 overflow-hidden rounded-3xl bg-linear-to-r from-[#3b1d6e] via-[#6b1d7a] to-[#e23b8c] p-5">
      <p className="text-xs uppercase tracking-widest text-white/70">Premium Plan</p>
      <h3 className="mt-1 text-xl font-bold">Хязгааргүй үзэлт, 4K Ultra HD</h3>
      <p className="mt-1 text-sm text-white/80">Нэгэн зэрэг 4 дэлгэц · Татаж авах · Зар байхгүй</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-white/70">Сар бүр</p>
          <p className="text-2xl font-bold">₮12,990</p>
        </div>
        <Link href="/subscribe" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
          Идэвхжүүлэх
        </Link>
      </div>
    </section>
  );
}
