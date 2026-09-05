import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccessService } from "../access/access.service";
import { MuxService } from "../mux/mux.service";

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly mux: MuxService,
  ) {}

  async playback(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { title: true },
    });
    if (!video) throw new NotFoundException("Бичлэг олдсонгүй");
    if (video.muxStatus !== "READY" || !video.muxPlaybackId) {
      throw new HttpException("Бичлэг бэлэн болоогүй байна", HttpStatus.CONFLICT);
    }

    const result = await this.access.check(userId, video.titleId, video.title.accessType);
    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: 402,
          message: "Төлбөр шаардлагатай",
          accessType: video.title.accessType,
          ppvPriceMnt: video.title.ppvPriceMnt,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const signed = await this.mux.signPlayback(video.muxPlaybackId);
    return {
      videoId: video.id,
      titleId: video.titleId,
      kind: video.kind,
      aspectRatio: video.aspectRatio,
      durationSec: video.durationSec,
      title: video.title.title,
      ...signed,
    };
  }
}
