"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function LoginInner() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();

  const request = async () => {
    setError("");
    try {
      const res = await api<{ devCode?: string }>("/v1/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setDevCode(res.devCode ?? null);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа");
    }
  };

  const verify = async () => {
    setError("");
    try {
      await api("/v1/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });
      await refresh();
      router.push(safeNext(params.get("next")));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа");
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6">
      <div className="mb-10 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2">
          ▶
        </span>
        <div>
          <h1 className="text-2xl font-bold">negun</h1>
          <p className="text-sm text-muted">Утасны дугаараар нэвтрэх</p>
        </div>
      </div>

      {step === "phone" ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void request();
          }}
        >
          <input
            className="w-full rounded-2xl border border-white/10 bg-elevated px-4 py-3 outline-none"
            placeholder="99001122"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-linear-to-r from-accent to-accent-2 py-3 font-semibold"
          >
            Код авах
          </button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <p className="text-sm text-muted">{phone} дугаар руу код илгээлээ</p>
          {devCode && (
            <p className="rounded-xl bg-white/5 px-3 py-2 text-sm">
              Dev OTP: <strong>{devCode}</strong>
            </p>
          )}
          <input
            className="w-full rounded-2xl border border-white/10 bg-elevated px-4 py-3 tracking-[0.4em] outline-none"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="w-full rounded-2xl bg-white py-3 font-semibold text-black">
            Нэвтрэх
          </button>
        </form>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-6 text-muted">Уншиж байна…</p>}>
      <LoginInner />
    </Suspense>
  );
}
