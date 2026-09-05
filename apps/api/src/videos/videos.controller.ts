import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { VideosService } from "./videos.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/decorators";

@UseGuards(JwtAuthGuard)
@Controller("v1/videos")
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Get(":id/playback")
  playback(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.videos.playback(user.id, id);
  }
}
