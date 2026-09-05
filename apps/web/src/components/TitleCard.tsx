"use client";

import Link from "next/link";
import type { CatalogTitle } from "@/lib/types";

export function TitleCard({
  title,
  wide = false,
  fill = false,
}: {
  title: CatalogTitle;
  wide?: boolean;
  fill?: boolean;
}) {
  return (
    <Link
      href={`/title/${title.id}`}
      className={`relative overflow-hidden rounded-xl bg-elevated ${
        fill ? "block aspect-[2/3] w-full" : wide ? "h-28 w-44 shrink-0" : "h-48 w-32 shrink-0"
      }`}
    >
      <img src={title.posterUrl} alt={title.title} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2">
        <p className="line-clamp-2 text-xs font-medium">{title.title}</p>
      </div>
    </Link>
  );
}
