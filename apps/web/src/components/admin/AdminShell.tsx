"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Тойм", icon: OverviewIcon, exact: true },
  { href: "/admin/titles", label: "Контент", icon: TitlesIcon },
  { href: "/admin/videos", label: "Видео", icon: VideosIcon },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: UsersIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (me.role !== "ADMIN") router.replace("/");
  }, [me, loading, router, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || me?.role !== "ADMIN") {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted">
        {loading ? "Уншиж байна…" : "Хандалт шалгаж байна…"}
      </div>
    );
  }

  const name = me.profiles.find((p) => p.isDefault)?.name ?? "Админ";

  return (
    <div className="min-h-dvh bg-bg">
      {open && (
        <button
          aria-label="Цэс хаах"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/8 bg-[#0b0b14] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2 text-sm">
            ▶
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight">negun</p>
            <p className="text-[11px] text-muted">Админ самбар</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-4">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted">{me.phone}</p>
          <Link href="/" className="mt-3 inline-block text-xs text-accent hover:underline">
            Апп руу буцах
          </Link>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/8 bg-bg/80 px-4 py-3 backdrop-blur-md md:px-8">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Цэс"
          >
            ☰
          </button>
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] text-muted">ADMIN</p>
            <h1 className="truncate text-lg font-semibold">
              {NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ??
                "Админ"}
            </h1>
          </div>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function TitlesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VideosIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10l5-3v10l-5-3V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20.5 19c0-2.2-1.4-3.8-3.5-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
