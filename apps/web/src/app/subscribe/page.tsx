"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function SubscribeInner() {
  const { me } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const titleId = params.get("titleId");
  const [qr, setQr] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const start = async () => {
    if (!me) {
      router.push("/login");
      return;
    }
    const path = titleId ? `/v1/payments/ppv/${titleId}` : "/v1/payments/subscription";
    const res = await api<{
      qrText?: string;
      paymentId?: string;
      alreadyActive?: boolean;
      alreadyOwned?: boolean;
      amountMnt?: number;
    }>(path, { method: "POST" });
    if (res.alreadyActive || res.alreadyOwned) {
      setMsg("Та аль хэдийн хандалттай байна");
      return;
    }
    setQr(res.qrText ?? null);
    setPaymentId(res.paymentId ?? null);
  };

  const simulate = async () => {
    if (!paymentId) return;
    await api(`/v1/payments/simulate/${paymentId}`, { method: "POST" });
    setMsg("Төлбөр амжилттай. Одоо үзэж болно.");
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <main className="px-5 pb-28 pt-4">
      <h1 className="text-3xl font-bold">{titleId ? "Контент авах" : "Premium Plan"}</h1>
      <p className="mt-2 text-muted">
        {titleId ? "Энэ бүтээлийг нэг удаагийн төлбөрөөр үзнэ." : "Хязгааргүй үзэлт, 4K Ultra HD"}
      </p>
      {!titleId && <p className="mt-6 text-4xl font-bold">{formatPrice(12990)}</p>}
      <button onClick={() => void start()} className="mt-6 w-full rounded-2xl bg-accent py-3 font-semibold">
        QPay-р төлөх
      </button>
      {qr && (
        <div className="mt-6 rounded-2xl bg-elevated p-4">
          <p className="text-sm text-muted">QPay нэхэмжлэх</p>
          <p className="mt-2 break-all font-mono text-xs">{qr}</p>
          {qr.startsWith("MOCK") && (
            <button onClick={() => void simulate()} className="mt-4 w-full rounded-xl bg-white py-2 text-black">
              Dev: төлбөр амжилттай гэж тэмдэглэх
            </button>
          )}
        </div>
      )}
      {msg && <p className="mt-4 text-emerald-400">{msg}</p>}
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
