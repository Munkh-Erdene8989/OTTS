import { Body, Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { IsUUID } from "class-validator";
import { WatchlistService } from "./watchlist.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../common/decorators";

class WatchlistDto {
  @IsUUID()
  titleId!: string;
}

@UseGuards(JwtAuthGuard)
@Controller("v1/watchlist")
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.watchlist.list(user.profileId);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: WatchlistDto) {
    return this.watchlist.add(user.profileId, dto.titleId);
  }

  @Delete()
  remove(@CurrentUser() user: AuthUser, @Body() dto: WatchlistDto) {
    return this.watchlist.remove(user.profileId, dto.titleId);
  }
}
