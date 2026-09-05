import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";

@Injectable()
export class WatchlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
  ) {}

  async add(profileId: string, titleId: string) {
    await this.prisma.watchlistItem.upsert({
      where: { profileId_titleId: { profileId, titleId } },
      update: {},
      create: { profileId, titleId },
    });
    return { ok: true };
  }

  async remove(profileId: string, titleId: string) {
    await this.prisma.watchlistItem.deleteMany({ where: { profileId, titleId } });
    return { ok: true };
  }

  async list(profileId: string) {
    const items = await this.prisma.watchlistItem.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      include: { title: { include: { genres: { include: { genre: true } }, videos: true } } },
    });
    return items.map((i) => this.catalog.serializeTitle(i.title));
  }
}
