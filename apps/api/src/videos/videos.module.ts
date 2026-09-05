import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { MuxModule } from "../mux/mux.module";
import { AccessModule } from "../access/access.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MuxModule, AccessModule, AuthModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
