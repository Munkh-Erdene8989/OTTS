import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from "class-validator";
import { AccessType, VideoKind } from "@prisma/client";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators";
import { MuxService } from "../mux/mux.service";
import { UsersService } from "../users/users.service";

class CreateTitleDto {
  @IsString()
  title!: string;

  @IsString()
  synopsis!: string;

  @IsInt()
  year!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @IsString()
  ageRating?: string;

  @IsUrl()
  posterUrl!: string;

  @IsUrl()
  heroUrl!: string;

  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;

  @IsOptional()
  @IsInt()
  @Min(0)
  ppvPriceMnt?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreSlugs?: string[];
}

class UpdateTitleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  durationSec?: number;

  @IsOptional()
  @IsString()
  ageRating?: string;

  @IsOptional()
  @IsUrl()
  posterUrl?: string;

  @IsOptional()
  @IsUrl()
  heroUrl?: string;

  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;

  @IsOptional()
  @IsInt()
  ppvPriceMnt?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

class CreateVideoDto {
  @IsUUID()
  titleId!: string;

  @IsOptional()
  @IsEnum(VideoKind)
  kind?: VideoKind;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("v1/admin")
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly mux: MuxService,
    private readonly users: UsersService,
  ) {}

  @Get("titles")
  titles() {
    return this.admin.titles();
  }

  @Post("titles")
  createTitle(@Body() dto: CreateTitleDto) {
    return this.admin.createTitle(dto);
  }

  @Patch("titles/:id")
  updateTitle(@Param("id") id: string, @Body() dto: UpdateTitleDto) {
    return this.admin.updateTitle(id, dto);
  }

  @Get("videos")
  videos() {
    return this.admin.videos();
  }

  @Get("users")
  usersList() {
    return this.users.list();
  }

  @Post("videos")
  createVideo(@Body() dto: CreateVideoDto) {
    return this.admin.createVideo(dto.titleId, dto.kind ?? "FEATURE");
  }

  @Post("videos/:id/upload")
  upload(@Param("id") id: string) {
    return this.admin.createUpload(id);
  }

  @Post("videos/:id/mock-upload")
  mockUpload(@Param("id") id: string) {
    return this.mux.completeMockUpload(id);
  }
}
