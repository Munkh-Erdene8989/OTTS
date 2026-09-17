const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
  const message = Array.isArray(data?.message) ? data.message.join(" ") : (data?.message ?? res.statusText);
    throw new ApiError(res.status, data, String(message));
  }
  return data as T;
}

export const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h <= 0) return `${m}м`;
  return `${h}ц ${m}м`;
};

export const formatPrice = (mnt: number) => `₮${mnt.toLocaleString("mn-MN")}`;
