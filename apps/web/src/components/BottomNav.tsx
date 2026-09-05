"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Нүүр", icon: "⌂" },
  { href: "/new", label: "Шинэ", icon: "★" },
  { href: "/reels", label: "Reels", icon: "▶" },
  { href: "/list", label: "Жагсаалт", icon: "☰" },
  { href: "/profile", label: "Профайл", icon: "☺" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch") || pathname.startsWith("/login") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-bg/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px]"
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent" />}
              <span className="text-base">{item.icon}</span>
              <span className={active ? "text-white" : "text-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
