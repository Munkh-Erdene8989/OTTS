"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ACCESS_LABEL,
  formatDate,
  MUX_LABEL,
  muxTone,
  type AdminTitle,
  type AdminUser,
  type AdminVideo,
} from "@/lib/admin";
import { Badge } from "@/components/admin/ui";

export default function AdminOverviewPage() {
  const [titles, setTitles] = useState<AdminTitle[] | null>(null);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    void Promise.all([
      api<AdminTitle[]>("/v1/admin/titles"),
      api<AdminVideo[]>("/v1/admin/videos"),
      api<AdminUser[]>("/v1/admin/users"),
    ]).then(([t, v, u]) => {
      setTitles(t);
      setVideos(v);
      setUsers(u);
    });
  }, []);

  if (!titles) return <p className="text-sm text-muted">Уншиж байна…</p>;

  const published = titles.filter((t) => t.isPublished).length;
  const ready = videos.filter((v) => v.muxStatus === "READY").length;
  const waiting = videos.filter((v) => v.muxStatus !== "READY").length;
  const premium = users.filter((u) => u.subscriptions.some((s) => s.status === "ACTIVE")).length;

  const stats = [
    { label: "Контент", value: titles.length, hint: `${published} нийтлэгдсэн` },
    { label: "Видео", value: videos.length, hint: `${ready} бэлэн · ${waiting} хүлээгдэж` },
    { label: "Хэрэглэгч", value: users.length, hint: `${premium} Premium` },
    { label: "Админ", value: users.filter((u) => u.role === "ADMIN").length, hint: "хандалттай" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">negun контент, хэрэглэгч, Mux төлөв</p>
        </div>
        <Link
          href="/admin/titles/new"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
        >
          Шинэ title
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="rounded-2xl border border-white/6 bg-elevated p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Сүүлийн контент</h2>
            <Link href="/admin/titles" className="text-xs text-accent">
              Бүгд
            </Link>
          </div>
          <div className="space-y-2">
            {titles.slice(0, 6).map((t) => (
              <Link
                key={t.id}
                href={`/admin/titles/${t.id}`}
                className="flex items-center gap-3 rounded-2xl bg-elevated p-3 hover:bg-white/5"
              >
                <img src={t.posterUrl} alt="" className="h-14 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="text-xs text-muted">
                    {ACCESS_LABEL[t.accessType]} · {t.videos.length} видео
                  </p>
                </div>
                <Badge tone={t.isPublished ? "green" : "amber"}>
                  {t.isPublished ? "Нийтлэгдсэн" : "Ноорог"}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Видео төлөв</h2>
            <Link href="/admin/videos" className="text-xs text-accent">
              Бүгд
            </Link>
          </div>
          <div className="space-y-2">
            {videos.slice(0, 6).map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-2xl bg-elevated p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{v.title?.title ?? v.titleId}</p>
                  <p className="text-xs text-muted">
                    {v.kind} · {formatDate(v.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${muxTone(v.muxStatus)}`}>
                  {MUX_LABEL[v.muxStatus]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
