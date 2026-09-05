import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RequestOtpDto, VerifyOtpDto } from "./dto";
import { Public, CurrentUser, type AuthUser } from "../common/decorators";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("v1")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("auth/otp/request")
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("auth/otp/verify")
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.verifyOtp(dto.phone, dto.code, res);
  }

  @Public()
  @Post("auth/refresh")
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.refresh(req.cookies?.refresh_token as string | undefined, res);
  }

  @Public()
  @Post("auth/logout")
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.logout(req.cookies?.refresh_token as string | undefined, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthUser) {
    const full = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        profiles: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    return {
      id: full.id,
      phone: full.phone,
      role: full.role,
      profiles: full.profiles,
      subscription: full.subscriptions[0] ?? null,
    };
  }
}
