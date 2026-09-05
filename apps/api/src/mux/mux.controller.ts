import { Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { MuxService } from "./mux.service";
import { Public } from "../common/decorators";

@SkipThrottle()
@Public()
@Controller("v1/webhooks")
export class MuxController {
  constructor(private readonly mux: MuxService) {}

  @Post("mux")
  @HttpCode(200)
  handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers("mux-signature") signature?: string,
  ) {
    const raw = req.rawBody?.toString("utf8") ?? JSON.stringify(req.body);
    return this.mux.handleWebhook(raw, signature);
  }
}
