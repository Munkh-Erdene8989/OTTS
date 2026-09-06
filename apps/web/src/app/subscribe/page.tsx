"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type BankUrl = { name: string; description?: string; logo?: string; link: string };

type InvoiceRes = {
  mock?: boolean;
  paymentId?: string;
  amountMnt?: number;
  qrText?: string;
  qrImage?: string;
  shortUrl?: string;
  urls?: BankUrl[];
  alreadyActive?: boolean;
  alreadyOwned?: boolean;
};

function qrSrc(image: string) {
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  return `data:image/png;base64,${image}`;
}

function SubscribeInner() {
  const { me, refresh } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const titleId = params.get("titleId");
  const [invoice, setInvoice] = useState<InvoiceRes | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!me) {
      router.push("/login");
      return;
    }
    setError("");
    setMsg("");
    setBusy(true);
    try {
      const path = titleId ? `/v1/payments/ppv/${titleId}` : "/v1/payments/subscription";
      const res = await api<InvoiceRes>(path, { method: "POST" });
      if (res.alreadyActive || res.alreadyOwned) {
        setMsg("Та аль хэдийн хандалттай байна");
        return;
      }
      setInvoice(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Төлбөр үүсгэж чадсангүй");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!invoice?.paymentId || invoice.mock) return;
    let stopped = false;
    const tick = async () => {
      try {
        const status = await api<{ status: string }>(`/v1/payments/${invoice.paymentId}`);
        if (stopped) return;
        if (status.status === "PAID") {
          setMsg("Төлбөр амжилттай. Одоо үзэж болно.");
          await refresh();
          setTimeout(() => router.push("/"), 800);
        }
      } catch {
        /* keep polling */
      }
    };
    const id = window.setInterval(() => void tick(), 3000);
    void tick();
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [invoice?.paymentId, invoice?.mock, refresh, router]);

  const simulate = async () => {
    if (!invoice?.paymentId) return;
    await api(`/v1/payments/simulate/${invoice.paymentId}`, { method: "POST" });
    setMsg("Төлбөр амжилттай. Одоо үзэж болно.");
    await refresh();
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <main className="px-5 pb-28 pt-4">
      <h1 className="text-3xl font-bold">{titleId ? "Контент авах" : "Premium Plan"}</h1>
      <p className="mt-2 text-muted">
        {titleId ? "Энэ бүтээлийг нэг удаагийн төлбөрөөр үзнэ." : "Хязгааргүй үзэлт, 4K Ultra HD"}
      </p>
      {!titleId && <p className="mt-6 text-4xl font-bold">{formatPrice(12990)}</p>}
      <button
        onClick={() => void start()}
        disabled={busy}
        className="mt-6 w-full rounded-2xl bg-accent py-3 font-semibold disabled:opacity-60"
      >
        {busy ? "Нэхэмжлэл үүсгэж байна…" : "QPay-р төлөх"}
      </button>
      {invoice && (
        <div className="mt-6 rounded-2xl bg-elevated p-4">
          <p className="text-sm text-muted">QPay нэхэмжлэх</p>
          {invoice.amountMnt != null && (
            <p className="mt-1 text-lg font-semibold">{formatPrice(invoice.amountMnt)}</p>
          )}
          {invoice.qrImage && (
            <img
              src={qrSrc(invoice.qrImage)}
              alt="QPay QR"
              className="mx-auto mt-4 w-56 rounded-xl bg-white p-2"
            />
          )}
          {!invoice.qrImage && invoice.qrText && (
            <p className="mt-2 break-all font-mono text-xs">{invoice.qrText}</p>
          )}
          {invoice.shortUrl && (
            <a
              href={invoice.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block w-full rounded-xl bg-white py-2 text-center font-semibold text-black"
            >
              QPay-р нээх
            </a>
          )}
          {invoice.urls && invoice.urls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {invoice.urls.map((bank) => (
                <a
                  key={bank.name + bank.link}
                  href={bank.link}
                  className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm"
                >
                  {bank.name}
                </a>
              ))}
            </div>
          )}
          {!invoice.mock && (
            <p className="mt-4 text-center text-xs text-muted">Төлбөр хийсний дараа автоматаар баталгаажна</p>
          )}
          {invoice.mock && (
            <button onClick={() => void simulate()} className="mt-4 w-full rounded-xl bg-white py-2 text-black">
              Dev: төлбөр амжилттай гэж тэмдэглэх
            </button>
          )}
        </div>
      )}
      {msg && <p className="mt-4 text-emerald-400">{msg}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </main>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<p className="p-6 text-muted">Уншиж байна…</p>}>
      <SubscribeInner />
    </Suspense>
  );
}
