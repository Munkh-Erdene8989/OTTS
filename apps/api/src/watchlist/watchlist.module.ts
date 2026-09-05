import { Module } from "@nestjs/common";
import { WatchlistController } from "./watchlist.controller";
import { WatchlistService } from "./watchlist.service";
import { AuthModule } from "../auth/auth.module";
import { CatalogModule } from "../catalog/catalog.module";

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
