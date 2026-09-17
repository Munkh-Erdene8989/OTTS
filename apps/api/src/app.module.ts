import { join } from "path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { SmsModule } from "./sms/sms.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CatalogModule } from "./catalog/catalog.module";
import { VideosModule } from "./videos/videos.module";
import { MuxModule } from "./mux/mux.module";
import { AccessModule } from "./access/access.module";
import { PaymentsModule } from "./payments/payments.module";
import { HistoryModule } from "./history/history.module";
import { WatchlistModule } from "./watchlist/watchlist.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), ".env"), join(process.cwd(), "apps/api/.env"), ".env"],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    PrismaModule,
    HealthModule,
    SmsModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    VideosModule,
    MuxModule,
    AccessModule,
    PaymentsModule,
    HistoryModule,
    WatchlistModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
