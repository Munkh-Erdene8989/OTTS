"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import type { AdminTitle } from "@/lib/admin";
import {
  emptyTitleForm,
  TitleForm,
  toCreatePayload,
  type TitleFormValues,
} from "@/components/admin/TitleForm";

export default function NewTitlePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (values: TitleFormValues) => {
    setBusy(true);
    setError("");
    try {
      const title = await api<AdminTitle>("/v1/admin/titles", {
        method: "POST",
        body: JSON.stringify(toCreatePayload(values)),
      });
      if (values.createFeature) {
        await api("/v1/admin/videos", {
          method: "POST",
          body: JSON.stringify({ titleId: title.id, kind: "FEATURE" }),
        });
      }
      router.push(`/admin/titles/${title.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Хадгалж чадсангүй");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-muted">Каталогт шинэ кино, цуврал нэмнэ</p>
      <div className="rounded-2xl border border-white/6 bg-elevated/40 p-4 lg:p-6">
        <TitleForm
          initial={emptyTitleForm()}
          submitLabel="Үүсгэх"
          showCreateVideo
          busy={busy}
          error={error}
          onSubmit={(v) => void submit(v)}
        />
      </div>
    </div>
  );
}
