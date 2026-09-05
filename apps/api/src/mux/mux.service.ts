import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Mux from "@mux/mux-node";
import { MuxStatus, VideoKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private readonly client: Mux | null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const tokenId = this.config.get<string>("MUX_TOKEN_ID");
    const tokenSecret = this.config.get<string>("MUX_TOKEN_SECRET");
    this.client =
      tokenId && tokenSecret
        ? new Mux({
            tokenId,
            tokenSecret,
            webhookSecret: this.config.get<string>("MUX_WEBHOOK_SECRET"),
            jwtSigningKey: this.config.get<string>("MUX_SIGNING_KEY_ID"),
            jwtPrivateKey: this.config.get<string>("MUX_SIGNING_KEY_PRIVATE"),
          })
        : null;
    if (!this.client) {
      this.logger.warn("Mux credentials missing — running in mock mode");
    }
  }

  isConfigured() {
    return this.client !== null;
  }

  async createDirectUpload(videoId: string, kind: VideoKind) {
    const quality =
      kind === "FEATURE"
        ? (this.config.get<string>("MUX_VIDEO_QUALITY") ?? "plus")
        : "basic";

    if (!this.client) {
      const uploadId = `mock_upload_${videoId}`;
      await this.prisma.video.update({
        where: { id: videoId },
        data: { muxUploadId: uploadId, muxStatus: "WAITING" },
      });
      return {
        uploadId,
        url: `${this.config.get("APP_URL")}/v1/admin/videos/${videoId}/mock-upload`,
        mock: true,
      };
    }

    const upload = await this.client.video.uploads.create({
      cors_origin: this.config.get<string>("WEB_ORIGIN") ?? "*",
      new_asset_settings: {
        playback_policies: ["signed"],
        video_quality: quality as "basic" | "plus",
      },
    });

    await this.prisma.video.update({
      where: { id: videoId },
      data: { muxUploadId: upload.id, muxStatus: "WAITING" },
    });

    return { uploadId: upload.id, url: upload.url, mock: false };
  }

  async completeMockUpload(videoId: string) {
    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        muxAssetId: `mock_asset_${videoId}`,
        muxPlaybackId: `mock_playback_${videoId}`,
        muxStatus: "READY",
        aspectRatio: "16:9",
      },
    });
    return { ok: true, mock: true };
  }

  async handleWebhook(rawBody: string, signature: string | undefined) {
    if (this.client && this.config.get("MUX_WEBHOOK_SECRET")) {
      try {
        this.client.webhooks.verifySignature(rawBody, {
          "mux-signature": signature ?? "",
        });
      } catch (err) {
        this.logger.error(`Mux signature failed: ${String(err)}`);
        throw err;
      }
    }

    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        id?: string;
        upload_id?: string;
        status?: string;
        playback_ids?: { id: string; policy: string }[];
        duration?: number;
        aspect_ratio?: string;
        errors?: { type?: string };
      };
    };

    const type = event.type ?? "";
    const data = event.data ?? {};
    const uploadId = data.upload_id;
    const assetId = data.id;

    const video = await this.prisma.video.findFirst({
      where: {
        OR: [
          ...(uploadId ? [{ muxUploadId: uploadId }] : []),
          ...(assetId ? [{ muxAssetId: assetId }] : []),
        ],
      },
    });

    if (!video) {
      this.logger.warn(`Mux webhook for unknown asset/upload: ${type} ${assetId}`);
      return { ok: true, ignored: true };
    }

    let muxStatus: MuxStatus = video.muxStatus;
    if (type === "video.asset.ready" || data.status === "ready") muxStatus = "READY";
    else if (type === "video.asset.errored" || data.status === "errored") muxStatus = "ERRORED";
    else muxStatus = "PREPARING";

    const playbackId =
      data.playback_ids?.find((p) => p.policy === "signed")?.id ??
      data.playback_ids?.[0]?.id ??
      video.muxPlaybackId;

    await this.prisma.video.update({
      where: { id: video.id },
      data: {
        muxAssetId: assetId ?? video.muxAssetId,
        muxPlaybackId: playbackId,
        muxStatus,
        durationSec: data.duration ? Math.round(data.duration) : video.durationSec,
        aspectRatio: data.aspect_ratio ?? video.aspectRatio,
      },
    });

    return { ok: true };
  }

  async signPlayback(playbackId: string) {
    if (!this.client) {
      return {
        playbackId,
        tokens: {
          playback: "mock-playback-token",
          thumbnail: "mock-thumbnail-token",
          storyboard: "mock-storyboard-token",
        },
        mock: true,
      };
    }

    const expiration = "12h";
    const [playback, thumbnail, storyboard] = await Promise.all([
      this.client.jwt.signPlaybackId(playbackId, { type: "video", expiration }),
      this.client.jwt.signPlaybackId(playbackId, { type: "thumbnail", expiration }),
      this.client.jwt.signPlaybackId(playbackId, { type: "storyboard", expiration }),
    ]);

    return {
      playbackId,
      tokens: { playback, thumbnail, storyboard },
      mock: false,
    };
  }
}
