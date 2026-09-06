import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, Public, type AuthUser } from "../common/decorators";
import { AccessService } from "../access/access.service";

@Controller("v1")
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly access: AccessService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @Post("payments/subscription")
  subscription(@CurrentUser() user: AuthUser) {
    return this.payments.createSubscription(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @Post("payments/ppv/:titleId")
  ppv(@CurrentUser() user: AuthUser, @Param("titleId") titleId: string) {
    return this.payments.createPpv(user.id, titleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("entitlements/me")
  entitlements(@CurrentUser() user: AuthUser) {
    return this.access.entitlements(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("payments/:paymentId")
  status(@CurrentUser() user: AuthUser, @Param("paymentId") paymentId: string) {
    return this.payments.getStatus(user.id, user.role, paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("payments/simulate/:paymentId")
  simulate(@CurrentUser() user: AuthUser, @Param("paymentId") paymentId: string) {
    return this.payments.simulate(user.id, user.role, paymentId);
  }

  @Public()
  @Post("webhooks/qpay")
  @HttpCode(200)
  callbackPost(@Body() body: Record<string, unknown>, @Query() query: Record<string, unknown>) {
    return this.payments.handleCallback({ ...query, ...body });
  }

  @Public()
  @Get("webhooks/qpay")
  @HttpCode(200)
  callbackGet(@Query() query: Record<string, unknown>) {
    return this.payments.handleCallback(query);
  }
}
