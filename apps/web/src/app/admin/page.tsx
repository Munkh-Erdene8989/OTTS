"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type AdminTitle = {
  id: string;
  title: string;
  accessType: string;
  isPublished: boolean;
  videos: { id: string; kind: string; muxStatus: string }[];
};

export default function AdminPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [titles, setTitles] = useState<AdminTitle[]>([]);
  const [form, setForm] = useState({
    title: "",
    synopsis: "",
    year: 2024,
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    heroUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
    accessType: "SUBSCRIPTION",
  });

  useEffect(() => {
    if (loading) return;
    if (me?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    void load();
  }, [me, loading, router]);

  const load = () => api<AdminTitle[]>("/v1/admin/titles").then(setTitles);

  const create = async () => {
    const title = await api<AdminTitle>("/v1/admin/titles", {
      method: "POST",
      body: JSON.stringify({ ...form, year: Number(form.year) }),
    });
    await api("/v1/admin/videos", {
      method: "POST",
      body: JSON.stringify({ titleId: title.id, kind: "FEATURE" }),
    });
    await load();
  };

  const upload = async (videoId: string) => {
    const res = await api<{ url: string; mock?: boolean }>(`/v1/admin/videos/${videoId}/upload`, {
      method: "POST",
    });
    if (res.mock) {
      await api(`/v1/admin/videos/${videoId}/mock-upload`, { method: "POST" });
    }
    await load();
  };

  return (
    <main className="space-y-6 px-4 pb-16 pt-4">
      <h1 className="text-2xl font-bold">Админ</h1>
      <section className="space-y-2 rounded-2xl bg-elevated p-4">
        <input
          className="w-full rounded-xl bg-black/30 px-3 py-2"
          placeholder="Гарчиг"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full rounded-xl bg-black/30 px-3 py-2"
          placeholder="Тайлбар"
          value={form.synopsis}
          onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
        />
        <select
          className="w-full rounded-xl bg-black/30 px-3 py-2"
          value={form.accessType}
          onChange={(e) => setForm({ ...form, accessType: e.target.value })}
        >
          <option>SUBSCRIPTION</option>
          <option>PPV</option>
          <option>FREE</option>
        </select>
        <button onClick={() => void create()} className="w-full rounded-xl bg-white py-2 text-black">
          Title + video үүсгэх
        </button>
      </section>
      <section className="space-y-3">
        {titles.map((t) => (
          <article key={t.id} className="rounded-2xl bg-elevated p-4 text-sm">
            <p className="font-semibold">{t.title}</p>
            <p className="text-muted">
              {t.accessType} · {t.isPublished ? "нийтлэгдсэн" : "ноорог"}
            </p>
            {t.videos.map((v) => (
              <div key={v.id} className="mt-2 flex items-center justify-between">
                <span>
                  {v.kind} · {v.muxStatus}
                </span>
                <button onClick={() => void upload(v.id)} className="rounded-lg bg-accent px-3 py-1">
                  Mux upload
                </button>
              </div>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}
