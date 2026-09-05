import { Module } from "@nestjs/common";
import { MuxService } from "./mux.service";
import { MuxController } from "./mux.controller";

@Module({
  controllers: [MuxController],
  providers: [MuxService],
  exports: [MuxService],
})
export class MuxModule {}
