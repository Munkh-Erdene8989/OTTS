export type CatalogTitle = {
  id: string;
  title: string;
  synopsis: string;
  year: number;
  durationSec: number;
  ageRating: string;
  posterUrl: string;
  heroUrl: string;
  matchPercent: number;
  accessType: "SUBSCRIPTION" | "PPV" | "FREE";
  ppvPriceMnt: number;
  genres: string[];
  featureVideoId: string | null;
  reelVideoId: string | null;
  ready: boolean;
};

export type HomePayload = {
  hero: CatalogTitle[];
  rows: { slug: string; name: string; items: CatalogTitle[] }[];
};

export type Me = {
  id: string;
  phone: string;
  role: "ADMIN" | "CUSTOMER";
  profiles: { id: string; name: string; isDefault: boolean; isKids: boolean }[];
  subscription: { status: string; currentPeriodEnd: string | null } | null;
};
