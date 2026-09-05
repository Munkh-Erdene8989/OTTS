"use client";

import Link from "next/link";
import type { CatalogTitle } from "@/lib/types";
import { TitleCard } from "./TitleCard";

export function TitleRow({
  name,
  items,
  href,
  wide,
}: {
  name: string;
  items: CatalogTitle[];
  href?: string;
  wide?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold">{name}</h2>
        {href && (
          <Link href={href} className="text-sm text-muted">
            Бүгд
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {items.map((item) => (
          <TitleCard key={item.id} title={item} wide={wide} />
        ))}
      </div>
    </section>
  );
}
