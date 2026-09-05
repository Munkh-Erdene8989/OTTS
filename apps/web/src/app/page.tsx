"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HomePayload } from "@/lib/types";
import { Hero } from "@/components/Hero";
import { TitleRow } from "@/components/TitleRow";
import { PremiumBanner } from "@/components/PremiumBanner";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const { me } = useAuth();

  useEffect(() => {
    void api<HomePayload>("/v1/catalog/home").then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 text-muted">Уншиж байна…</div>;
  }

  const continueRow = data.rows.find((r) => r.slug === "continue");
  const otherRows = data.rows.filter((r) => r.slug !== "continue" && r.slug !== "hero");

  return (
    <main className="space-y-8 pb-8">
      <Hero items={data.hero} />
      {continueRow && <TitleRow name={continueRow.name} items={continueRow.items} href="/profile" wide />}
      {otherRows.slice(0, 1).map((row) => (
        <TitleRow key={row.slug} name={row.name} items={row.items} href="/new" />
      ))}
      {!me?.subscription && <PremiumBanner />}
      {otherRows.slice(1).map((row) => (
        <TitleRow key={row.slug} name={row.name} items={row.items} href="/new" />
      ))}
      <Footer />
    </main>
  );
}
