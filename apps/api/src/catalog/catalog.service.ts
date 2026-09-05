import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const titleInclude = {
  genres: { include: { genre: true } },
  videos: true,
} as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  serializeTitle(title: {
    id: string;
    title: string;
    synopsis: string;
    year: number;
    durationSec: number;
    ageRating: string;
    posterUrl: string;
    heroUrl: string;
    matchPercent: number;
    accessType: string;
    ppvPriceMnt: number;
    genres?: { genre: { name: string; slug: string } }[];
    videos?: {
      id: string;
      kind: string;
      muxStatus: string;
      durationSec: number;
      aspectRatio: string | null;
    }[];
  }) {
    const feature = title.videos?.find((v) => v.kind === "FEATURE");
    const reel = title.videos?.find((v) => v.kind === "REEL");
    return {
      id: title.id,
      title: title.title,
      synopsis: title.synopsis,
      year: title.year,
      durationSec: title.durationSec,
      ageRating: title.ageRating,
      posterUrl: title.posterUrl,
      heroUrl: title.heroUrl,
      matchPercent: title.matchPercent,
      accessType: title.accessType,
      ppvPriceMnt: title.ppvPriceMnt,
      genres: title.genres?.map((g) => g.genre.name) ?? [],
      featureVideoId: feature?.id ?? null,
      reelVideoId: reel?.id ?? null,
      ready: feature?.muxStatus === "READY" || reel?.muxStatus === "READY",
    };
  }

  async home() {
    const collections = await this.prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { title: { include: titleInclude } },
        },
      },
    });

    const heroCollection = collections.find((c) => c.slug === "hero");
    const hero =
      heroCollection?.items.filter((i) => i.title.isPublished).map((i) => i.title) ??
      (await this.prisma.title.findMany({
        where: { isPublished: true },
        include: titleInclude,
        orderBy: { createdAt: "desc" },
        take: 5,
      }));

    return {
      hero: hero.map((t) => this.serializeTitle(t)),
      rows: collections.map((c) => ({
        slug: c.slug,
        name: c.name,
        items: c.items
          .filter((i) => i.title.isPublished)
          .map((i) => this.serializeTitle(i.title)),
      })),
    };
  }

  async newest() {
    const titles = await this.prisma.title.findMany({
      where: { isPublished: true },
      include: titleInclude,
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return titles.map((t) => this.serializeTitle(t));
  }

  async reels() {
    const videos = await this.prisma.video.findMany({
      where: { kind: "REEL", title: { isPublished: true } },
      include: { title: { include: titleInclude } },
      orderBy: { createdAt: "desc" },
    });
    return videos.map((v) => ({
      videoId: v.id,
      muxStatus: v.muxStatus,
      ...this.serializeTitle(v.title),
    }));
  }

  async search(q: string) {
    const titles = await this.prisma.title.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { synopsis: { contains: q, mode: "insensitive" } },
        ],
      },
      include: titleInclude,
      take: 30,
    });
    return titles.map((t) => this.serializeTitle(t));
  }

  async byId(id: string) {
    const title = await this.prisma.title.findFirst({
      where: { id, isPublished: true },
      include: titleInclude,
    });
    if (!title) throw new NotFoundException("Контент олдсонгүй");
    const similar = await this.similar(id);
    return { ...this.serializeTitle(title), similar };
  }

  async similar(id: string) {
    const current = await this.prisma.title.findUnique({
      where: { id },
      include: { genres: true },
    });
    if (!current) return [];
    const genreIds = current.genres.map((g) => g.genreId);
    const titles = await this.prisma.title.findMany({
      where: {
        isPublished: true,
        id: { not: id },
        genres: { some: { genreId: { in: genreIds } } },
      },
      include: titleInclude,
      take: 8,
    });
    return titles.map((t) => this.serializeTitle(t));
  }
}
