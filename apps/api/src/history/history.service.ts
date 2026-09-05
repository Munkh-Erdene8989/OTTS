import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
  ) {}

  async upsert(profileId: string, videoId: string, positionSec: number, durationSec: number) {
    const completed = durationSec > 0 && positionSec / durationSec >= 0.92;
    return this.prisma.watchProgress.upsert({
      where: { profileId_videoId: { profileId, videoId } },
      update: { positionSec, durationSec, completed },
      create: { profileId, videoId, positionSec, durationSec, completed },
    });
  }

  async list(profileId: string) {
    const rows = await this.prisma.watchProgress.findMany({
      where: { profileId },
      orderBy: { updatedAt: "desc" },
      include: { video: { include: { title: { include: { genres: { include: { genre: true } }, videos: true } } } } },
      take: 40,
    });
    return rows.map((r) => ({
      positionSec: r.positionSec,
      durationSec: r.durationSec,
      completed: r.completed,
      videoId: r.videoId,
      updatedAt: r.updatedAt,
      title: this.catalog.serializeTitle(r.video.title),
    }));
  }
}
