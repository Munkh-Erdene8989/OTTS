import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { IsInt, IsUUID, Min } from "class-validator";
import { HistoryService } from "./history.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/decorators";

class ProgressDto {
  @IsUUID()
  videoId!: string;

  @IsInt()
  @Min(0)
  positionSec!: number;

  @IsInt()
  @Min(0)
  durationSec!: number;
}

@UseGuards(JwtAuthGuard)
@Controller("v1")
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Put("progress")
  save(@CurrentUser() user: AuthUser, @Body() dto: ProgressDto) {
    return this.history.upsert(user.profileId, dto.videoId, dto.positionSec, dto.durationSec);
  }

  @Get("history")
  list(@CurrentUser() user: AuthUser) {
    return this.history.list(user.profileId);
  }
}
