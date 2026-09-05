import { Injectable, NotFoundException } from "@nestjs/common";
import { AccessType, VideoKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MuxService } from "./../mux/mux.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mux: MuxService,
  ) {}

  titles() {
    return this.prisma.title.findMany({
      include: { videos: true, genres: { include: { genre: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  videos() {
    return this.prisma.video.findMany({
      include: { title: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createTitle(data: {
    title: string;
    synopsis: string;
    year: number;
    durationSec?: number;
    ageRating?: string;
    posterUrl: string;
    heroUrl: string;
    accessType?: AccessType;
    ppvPriceMnt?: number;
    genreSlugs?: string[];
  }) {
    const title = await this.prisma.title.create({
      data: {
        title: data.title,
        synopsis: data.synopsis,
        year: data.year,
        durationSec: data.durationSec ?? 0,
        ageRating: data.ageRating ?? "12+",
        posterUrl: data.posterUrl,
        heroUrl: data.heroUrl,
        accessType: data.accessType ?? "SUBSCRIPTION",
        ppvPriceMnt: data.ppvPriceMnt ?? 0,
        isPublished: true,
      },
    });

    if (data.genreSlugs?.length) {
      for (const slug of data.genreSlugs) {
        const genre = await this.prisma.genre.upsert({
          where: { slug },
          update: {},
          create: { slug, name: slug },
        });
        await this.prisma.titleGenre.create({
          data: { titleId: title.id, genreId: genre.id },
        });
      }
    }

    return title;
  }

  async updateTitle(
    id: string,
    data: Partial<{
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
    }>,
  ) {
    return this.prisma.title.update({ where: { id }, data });
  }

  async createVideo(titleId: string, kind: VideoKind) {
    const title = await this.prisma.title.findUnique({ where: { id: titleId } });
    if (!title) throw new NotFoundException("Title not found");
    return this.prisma.video.create({ data: { titleId, kind } });
  }

  async createUpload(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Video not found");
    return this.mux.createDirectUpload(videoId, video.kind);
  }
}
