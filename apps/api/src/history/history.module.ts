import { Module } from "@nestjs/common";
import { HistoryController } from "./history.controller";
import { HistoryService } from "./history.service";
import { AuthModule } from "../auth/auth.module";
import { CatalogModule } from "../catalog/catalog.module";

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
