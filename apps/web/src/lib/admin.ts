import { api } from "./api";

export type AccessType = "SUBSCRIPTION" | "PPV" | "FREE";
export type VideoKind = "FEATURE" | "REEL" | "TRAILER";
export type MuxStatus = "WAITING" | "PREPARING" | "READY" | "ERRORED";

export type AdminVideo = {
  id: string;
  titleId: string;
  kind: VideoKind;
  muxStatus: MuxStatus;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  durationSec: number;
  aspectRatio: string | null;
  createdAt: string;
  title?: { id: string; title: string };
};

export type AdminTitle = {
  id: string;
  title: string;
  synopsis: string;
  year: number;
  durationSec: number;
  ageRating: string;
  posterUrl: string;
  heroUrl: string;
  accessType: AccessType;
  ppvPriceMnt: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  videos: AdminVideo[];
  genres: { genre: { id: string; name: string; slug: string } }[];
};

export type AdminUser = {
  id: string;
  phone: string;
  role: "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  profiles: { id: string; name: string; isDefault: boolean; isKids: boolean }[];
  subscriptions: {
    status: string;
    planCode: string;
    currentPeriodEnd: string | null;
  }[];
};

export const ACCESS_LABEL: Record<AccessType, string> = {
  SUBSCRIPTION: "Премиум",
  PPV: "Нэг удаагийн",
  FREE: "Үнэгүй",
};

export const KIND_LABEL: Record<VideoKind, string> = {
  FEATURE: "Бүтэн кино",
  REEL: "Reel",
  TRAILER: "Трейлер",
};

export const MUX_LABEL: Record<MuxStatus, string> = {
  WAITING: "Хүлээж байна",
  PREPARING: "Боловсруулж байна",
  READY: "Бэлэн",
  ERRORED: "Алдаа",
};

export const AGE_RATINGS = ["0+", "6+", "12+", "16+", "18+"];

export const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80";

export function slugifyGenre(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function parseGenres(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(slugifyGenre);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function muxTone(status: MuxStatus) {
  if (status === "READY") return "bg-emerald-500/15 text-emerald-300";
  if (status === "ERRORED") return "bg-red-500/15 text-red-300";
  if (status === "PREPARING") return "bg-amber-500/15 text-amber-200";
  return "bg-white/10 text-muted";
}

export async function startVideoUpload(videoId: string, file?: File | null) {
  const res = await api<{ url: string; mock?: boolean }>(`/v1/admin/videos/${videoId}/upload`, {
    method: "POST",
  });
  if (res.mock) {
    await api(`/v1/admin/videos/${videoId}/mock-upload`, { method: "POST" });
    return { mock: true as const };
  }
  if (file) {
    const put = await fetch(res.url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    if (!put.ok) throw new Error("Mux руу файл илгээж чадсангүй");
  }
  return { mock: false as const, url: res.url };
}
