"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const hide =
    pathname.startsWith("/watch") || pathname.startsWith("/login") || pathname.startsWith("/admin");
  if (hide) return null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-bg/70">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2 text-white">
          ▶
        </span>
        <span className="text-lg font-bold tracking-tight">negun</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          aria-label="Хайх"
          onClick={() => router.push("/search")}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
        >
          ⌕
        </button>
        <button
          aria-label="Мэдэгдэл"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
        >
          ⌂
          <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 text-[10px]">
            3
          </span>
        </button>
        <Link
          href="/profile"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
          aria-label="Цэс"
        >
          ☰
        </Link>
      </div>
    </header>
  );
}
