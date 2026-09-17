"use client";

import { useState } from "react";
import {
  ACCESS_LABEL,
  AGE_RATINGS,
  DEFAULT_HERO,
  DEFAULT_POSTER,
  parseGenres,
  type AccessType,
  type AdminTitle,
} from "@/lib/admin";
import { Field, fieldClass, PrimaryButton } from "./ui";

export type TitleFormValues = {
  title: string;
  synopsis: string;
  year: number;
  durationMin: number;
  ageRating: string;
  posterUrl: string;
  heroUrl: string;
  accessType: AccessType;
  ppvPriceMnt: number;
  genres: string;
  isPublished: boolean;
  createFeature: boolean;
};

export function valuesFromTitle(t: AdminTitle): TitleFormValues {
  return {
    title: t.title,
    synopsis: t.synopsis,
    year: t.year,
    durationMin: Math.round((t.durationSec || 0) / 60),
    ageRating: t.ageRating,
    posterUrl: t.posterUrl,
    heroUrl: t.heroUrl,
    accessType: t.accessType,
    ppvPriceMnt: t.ppvPriceMnt,
    genres: t.genres.map((g) => g.genre.name).join(", "),
    isPublished: t.isPublished,
    createFeature: false,
  };
}

export const emptyTitleForm = (): TitleFormValues => ({
  title: "",
  synopsis: "",
  year: new Date().getFullYear(),
  durationMin: 0,
  ageRating: "12+",
  posterUrl: DEFAULT_POSTER,
  heroUrl: DEFAULT_HERO,
  accessType: "SUBSCRIPTION",
  ppvPriceMnt: 0,
  genres: "",
  isPublished: true,
  createFeature: true,
});

export function toCreatePayload(v: TitleFormValues) {
  return {
    title: v.title.trim(),
    synopsis: v.synopsis.trim(),
    year: Number(v.year),
    durationSec: Math.max(0, Number(v.durationMin) || 0) * 60,
    ageRating: v.ageRating,
    posterUrl: v.posterUrl.trim() || DEFAULT_POSTER,
    heroUrl: v.heroUrl.trim() || DEFAULT_HERO,
    accessType: v.accessType,
    ppvPriceMnt: v.accessType === "PPV" ? Number(v.ppvPriceMnt) || 0 : 0,
    genreSlugs: parseGenres(v.genres),
  };
}

export function toUpdatePayload(v: TitleFormValues) {
  const created = toCreatePayload(v);
  return {
    title: created.title,
    synopsis: created.synopsis,
    year: created.year,
    durationSec: created.durationSec,
    ageRating: created.ageRating,
    posterUrl: created.posterUrl,
    heroUrl: created.heroUrl,
    accessType: created.accessType,
    ppvPriceMnt: created.ppvPriceMnt,
    isPublished: v.isPublished,
  };
}

export function TitleForm({
  initial,
  submitLabel,
  showPublish = false,
  showCreateVideo = false,
  showGenres = true,
  busy,
  error,
  onSubmit,
}: {
  initial: TitleFormValues;
  submitLabel: string;
  showPublish?: boolean;
  showCreateVideo?: boolean;
  showGenres?: boolean;
  busy: boolean;
  error: string;
  onSubmit: (values: TitleFormValues) => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof TitleFormValues>(key: K, value: TitleFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="max-h-52 overflow-hidden rounded-2xl bg-elevated md:max-h-none">
          <img src={form.posterUrl || DEFAULT_POSTER} alt="" className="aspect-[2/3] h-full w-full object-cover" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Гарчиг" className="sm:col-span-2">
            <input
              required
              className={fieldClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="Тайлбар" className="sm:col-span-2">
            <textarea
              required
              rows={4}
              className={fieldClass}
              value={form.synopsis}
              onChange={(e) => set("synopsis", e.target.value)}
            />
          </Field>
          <Field label="Он">
            <input
              type="number"
              className={fieldClass}
              value={form.year}
              onChange={(e) => set("year", Number(e.target.value))}
            />
          </Field>
          <Field label="Хугацаа (минут)">
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.durationMin}
              onChange={(e) => set("durationMin", Number(e.target.value))}
            />
          </Field>
          <Field label="Насны ангилал">
            <select
              className={fieldClass}
              value={form.ageRating}
              onChange={(e) => set("ageRating", e.target.value)}
            >
              {AGE_RATINGS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Хандалт">
            <select
              className={fieldClass}
              value={form.accessType}
              onChange={(e) => set("accessType", e.target.value as AccessType)}
            >
              {(Object.keys(ACCESS_LABEL) as AccessType[]).map((k) => (
                <option key={k} value={k}>
                  {ACCESS_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          {form.accessType === "PPV" && (
            <Field label="PPV үнэ (₮)">
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.ppvPriceMnt}
                onChange={(e) => set("ppvPriceMnt", Number(e.target.value))}
              />
            </Field>
          )}
          {showGenres && (
            <Field label="Жанр (таслалаар)" className={form.accessType === "PPV" ? "" : "sm:col-span-2"}>
              <input
                className={fieldClass}
                placeholder="Драма, Адал явдал"
                value={form.genres}
                onChange={(e) => set("genres", e.target.value)}
              />
            </Field>
          )}
          {!showGenres && form.genres && (
            <p className="sm:col-span-2 text-xs text-muted">Жанр: {form.genres}</p>
          )}
          <Field label="Постер URL" className="sm:col-span-2">
            <input
              className={fieldClass}
              value={form.posterUrl}
              onChange={(e) => set("posterUrl", e.target.value)}
            />
          </Field>
          <Field label="Hero URL" className="sm:col-span-2">
            <input className={fieldClass} value={form.heroUrl} onChange={(e) => set("heroUrl", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {showPublish && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
            />
            Нийтлэх
          </label>
        )}
        {showCreateVideo && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.createFeature}
              onChange={(e) => set("createFeature", e.target.checked)}
            />
            FEATURE видео үүсгэх
          </label>
        )}
        <PrimaryButton type="submit" disabled={busy || !form.title.trim()}>
          {busy ? "Хадгалж байна…" : submitLabel}
        </PrimaryButton>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
