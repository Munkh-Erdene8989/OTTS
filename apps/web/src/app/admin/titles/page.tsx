"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ACCESS_LABEL, formatDate, type AccessType, type AdminTitle } from "@/lib/admin";
import { Badge, EmptyState, fieldClass } from "@/components/admin/ui";

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<AdminTitle[] | null>(null);
  const [q, setQ] = useState("");
  const [access, setAccess] = useState<"ALL" | AccessType>("ALL");
  const [pub, setPub] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  useEffect(() => {
    void api<AdminTitle[]>("/v1/admin/titles").then(setTitles);
  }, []);

  const filtered = useMemo(() => {
    if (!titles) return [];
    return titles.filter((t) => {
      if (access !== "ALL" && t.accessType !== access) return false;
      if (pub === "PUBLISHED" && !t.isPublished) return false;
      if (pub === "DRAFT" && t.isPublished) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [titles, q, access, pub]);

  if (!titles) return <p className="text-sm text-muted">Уншиж байна…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{filtered.length} контент</p>
        <Link
          href="/admin/titles/new"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
        >
          Шинэ title
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <input
          className={fieldClass}
          placeholder="Хайх…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldClass} value={access} onChange={(e) => setAccess(e.target.value as typeof access)}>
          <option value="ALL">Бүх хандалт</option>
          <option value="SUBSCRIPTION">Премиум</option>
          <option value="PPV">Нэг удаагийн</option>
          <option value="FREE">Үнэгүй</option>
        </select>
        <select className={fieldClass} value={pub} onChange={(e) => setPub(e.target.value as typeof pub)}>
          <option value="ALL">Бүх төлөв</option>
          <option value="PUBLISHED">Нийтлэгдсэн</option>
          <option value="DRAFT">Ноорог</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Контент олдсонгүй" hint="Шинэ title үүсгэж каталог нэмнэ үү" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/6">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Гарчиг</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Хандалт</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Видео</th>
                <th className="px-4 py-3 font-medium">Төлөв</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Огноо</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-white/6 hover:bg-white/3">
                  <td className="px-4 py-3">
                    <Link href={`/admin/titles/${t.id}`} className="flex items-center gap-3">
                      <img src={t.posterUrl} alt="" className="h-12 w-8 rounded object-cover" />
                      <span>
                        <span className="block font-medium">{t.title}</span>
                        <span className="text-xs text-muted">
                          {t.year} · {t.ageRating}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{ACCESS_LABEL[t.accessType]}</td>
                  <td className="hidden px-4 py-3 md:table-cell">{t.videos.length}</td>
                  <td className="px-4 py-3">
                    <Badge tone={t.isPublished ? "green" : "amber"}>
                      {t.isPublished ? "Нийтлэгдсэн" : "Ноорог"}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
